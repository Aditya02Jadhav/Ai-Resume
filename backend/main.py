import asyncio
import json
import io
import os
from typing import AsyncGenerator

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import PyPDF2

load_dotenv()

from agent.nodes import parser_node, scoring_node, critique_node, finalizer_node
from agent.state import AgentState
from app.database import engine, Base
from app.routes import auth
from app.models import models

from agent.panel_state import PanelState
from agent.panel_graph import compiled_panel_graph

# Create database tables
Base.metadata.create_all(bind=engine)

NODE_FUNCTIONS = {
    "parser_node": parser_node,
    "scoring_node": scoring_node,   
    "critique_node": critique_node,
    "finalizer_node": finalizer_node,
}

app = FastAPI(title="Resume Analyser API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

NODE_ORDER = ["parser_node", "scoring_node", "critique_node", "finalizer_node"]
NODE_LABELS = {
    "parser_node": "Resume Parser",
    "scoring_node": "ATS Scorer",
    "critique_node": "AI Critique",
    "finalizer_node": "Report Builder",
}


def extract_pdf_text(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


async def stream_analysis(resume_text: str, job_description: str) -> AsyncGenerator[str, None]:
    def sse(event: str, data: dict) -> str:
        return f"data: {json.dumps({'event': event, **data})}\n\n"

    yield sse("pipeline_start", {"nodes": NODE_ORDER, "labels": NODE_LABELS})

    initial_state: AgentState = {
        "resume_text": resume_text,
        "job_description": job_description,
        "parsed_resume": {},
        "scores": {},
        "critique": {},
        "final_report": {},
        "current_node": "",
        "error": None,
    }

    current_state = initial_state
    completed_nodes = []

    for node_name in NODE_ORDER:
        yield sse("node_start", {"node": node_name, "label": NODE_LABELS[node_name]})
        await asyncio.sleep(0.1)

        try:
            loop = asyncio.get_event_loop()
            node_fn = NODE_FUNCTIONS[node_name]
            result = await loop.run_in_executor(None, node_fn, current_state)
            current_state = {**current_state, **result}
            completed_nodes.append(node_name)

            payload = {}
            if node_name == "parser_node":
                payload = {"candidate": current_state["parsed_resume"].get("name", "Unknown")}
            elif node_name == "scoring_node":
                payload = {"overall_fit": current_state["scores"].get("overall_fit", 0)}
            elif node_name == "critique_node":
                payload = {"issues_found": len(current_state["critique"].get("semantic_gaps", []))}
            elif node_name == "finalizer_node":
                payload = {"grade": current_state["final_report"].get("grade", "?")}

            yield sse("node_complete", {"node": node_name, "label": NODE_LABELS[node_name], **payload})
        except Exception as e:
            yield sse("node_error", {"node": node_name, "error": str(e)})
            yield sse("pipeline_error", {"error": str(e)})
            return

        await asyncio.sleep(0.05)

    yield sse("pipeline_complete", {"report": current_state["final_report"]})


@app.post("/analyze")
async def analyze(
    job_description: str = Form(...),
    resume_text: str = Form(default=""),
    resume_file: UploadFile = File(default=None),
):
    text = resume_text.strip()

    if resume_file and resume_file.filename:
        raw = await resume_file.read()
        if resume_file.filename.lower().endswith(".pdf"):
            text = extract_pdf_text(raw)
        else:
            text = raw.decode("utf-8", errors="ignore")

    if not text:
        raise HTTPException(status_code=400, detail="Provide resume_text or upload a resume file.")
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="job_description is required.")

    return StreamingResponse(
        stream_analysis(text, job_description),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/upload")
async def upload_resume_guest(
    file: UploadFile = File(...),
):
    """Guest endpoint for resume upload without job description"""
    text = ""

    if file and file.filename:
        raw = await file.read()
        if file.filename.lower().endswith(".pdf"):
            text = extract_pdf_text(raw)
        else:
            text = raw.decode("utf-8", errors="ignore")

    if not text:
        raise HTTPException(status_code=400, detail="Failed to extract text from resume file.")

    # Analyze without job description (generic ATS scoring)
    default_job_description = "Seeking a skilled professional with strong expertise, relevant experience, and attention to detail."
    
    return StreamingResponse(
        stream_analysis(text, default_job_description),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/mock-panel")
async def mock_panel(
    job_description: str = Form(default=""),
    resume_text: str = Form(default=""),
    resume_file: UploadFile = File(default=None),
):
    text = resume_text.strip()

    if resume_file and resume_file.filename:
        raw = await resume_file.read()
        if resume_file.filename.lower().endswith(".pdf"):
            text = extract_pdf_text(raw)
        else:
            text = raw.decode("utf-8", errors="ignore")

    if not text:
        raise HTTPException(status_code=400, detail="Provide resume_text or upload a resume file.")
        
    jd_text = job_description.strip()
        
    if not jd_text:
        raise HTTPException(status_code=400, detail="Provide job_description.")

    async def stream_panel(resume_txt: str, jd: str) -> AsyncGenerator[str, None]:
        def sse(event: str, data: dict) -> str:
            return f"data: {json.dumps({'event': event, **data})}\n\n"

        yield sse("panel_start", {"message": "Panel discussion started"})

        state: PanelState = {
            "resume_text": resume_txt,
            "job_description": jd,
            "messages": [],
            "turn_count": 0,
            "final_decision": None,
            "error": None
        }

        try:
            # First try async stream
            if hasattr(compiled_panel_graph, "astream"):
                async for output in compiled_panel_graph.astream(state):
                    for node_name, node_state in output.items():
                        if "messages" in node_state and node_state["messages"]:
                            last_msg = node_state["messages"][-1]
                            yield sse("node_complete", {
                                "agent": last_msg["agent"], 
                                "content": last_msg["content"], 
                                "thinking": last_msg.get("thinking", ""),
                                "node": node_name
                            })
                    await asyncio.sleep(0.1)
                yield sse("panel_complete", {
                    "decision": node_state.get("final_decision", "Undecided"),
                    "confidence": node_state.get("confidence", 0)
                })
            else:
                # Fallback to sync stream
                last_state = state
                for output in compiled_panel_graph.stream(state):
                    for node_name, node_state in output.items():
                        last_state = node_state
                        if "messages" in node_state and node_state["messages"]:
                            last_msg = node_state["messages"][-1]
                            yield sse("node_complete", {
                                "agent": last_msg["agent"], 
                                "content": last_msg["content"], 
                                "thinking": last_msg.get("thinking", ""),
                                "node": node_name
                            })
                yield sse("panel_complete", {
                    "decision": last_state.get("final_decision", "Undecided"),
                    "confidence": last_state.get("confidence", 0)
                })

        except Exception as e:
            yield sse("panel_error", {"error": str(e)})

    return StreamingResponse(
        stream_panel(text, job_description),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": "Resume Analyser API"}
