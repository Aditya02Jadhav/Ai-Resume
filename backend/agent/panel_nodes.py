import json
from .nodes import _call_gemini
from .panel_state import PanelState

def format_history(messages):
    if not messages:
        return "None"
    return "\n".join([f"{m['agent']}: {m['content']}" for m in messages])

def validate_resume(resume_text: str) -> dict:
    """Returns {'valid': bool, 'message': str}"""
    prompt = f"""You are a document classifier. Is the following text a RESUME or CV?
Return ONLY JSON: {{"is_resume": true or false, "document_type": "what this document is"}}

TEXT (first 1500 chars):
{resume_text[:1500]}"""
    try:
        result = _call_gemini(prompt)
        if not result.get("is_resume", True):
            return {"valid": False, "message": f"This doesn't look like a resume (detected: {result.get('document_type','unknown')}). Please upload a valid resume or CV."}
    except Exception:
        pass
    return {"valid": True, "message": ""}

def hr_node(state: PanelState) -> PanelState:
    history = format_history(state["messages"])
    if not state["messages"]:
        validation = validate_resume(state["resume_text"])
        if not validation["valid"]:
            new_msg = {"agent": "HR", "content": validation["message"], "thinking": "Checking if file is a resume."}
            return {**state, "messages": state["messages"] + [new_msg]}

    prompt = f"""You are a skeptical HR Manager. You prioritize culture fit, communication, and longevity. You are critical of job-hopping and vague soft skills.
CRITICAL RULE: If the candidate's background (Resume) does NOT align AT ALL with the Job Description (e.g. IT resume for a Sales role, or vice versa), you must explicitly call out this complete mismatch and suggest immediate rejection.
Review the resume and discussion. If you disagree with the Technical Manager or Hiring Manager, explicitly state your disagreement. 
Keep your spoken response EXTREMELY concise (1-2 short sentences max).

JOB DESCRIPTION: {state["job_description"]}
RESUME: {state["resume_text"]}
DISCUSSION SO FAR:
{history}

Return ONLY a JSON object:
{{
  "thinking": "Briefly state what specific section of the resume you are analyzing or what skill/red flag you are evaluating right now.",
  "response": "your short spoken text"
}}"""
    
    res = _call_gemini(prompt)
    new_msg = {
        "agent": "HR", 
        "content": res.get("response", "I have some concerns."),
        "thinking": res.get("thinking", "Analyzing candidate background...")
    }
    return {
        **state,
        "messages": state["messages"] + [new_msg]
    }

def tech_node(state: PanelState) -> PanelState:
    history = format_history(state["messages"])
    prompt = f"""You are a strict Technical Manager. You only care about technical excellence, deep domain skills, and project experience. 
CRITICAL RULE: If the candidate's core skills and experience (Resume) are completely irrelevant to the Job Description (e.g. IT skills for a Sales role), you must vigorously reject the candidate and point out the complete lack of relevant domain skills.
You often disagree with HR, believing that hard skills outweigh soft skills. Push back if HR is too focused on minor red flags, UNLESS the resume is a complete mismatch. 
Keep your spoken response EXTREMELY concise (1-2 short sentences max).

JOB DESCRIPTION: {state["job_description"]}
RESUME: {state["resume_text"]}
DISCUSSION SO FAR:
{history}

Return ONLY a JSON object:
{{
  "thinking": "Briefly state what technical skills or projects you are verifying, or why you are disregarding HR's point.",
  "response": "your short spoken text"
}}"""
    
    res = _call_gemini(prompt)
    new_msg = {
        "agent": "Technical Manager", 
        "content": res.get("response", "Technically, it looks fine."),
        "thinking": res.get("thinking", "Scanning tech stack and GitHub projects...")
    }
    return {
        **state,
        "messages": state["messages"] + [new_msg]
    }

def manager_node(state: PanelState) -> PanelState:
    history = format_history(state["messages"])
    turn_count = state.get("turn_count", 0) + 1
    
    is_final = turn_count >= 2
    
    if is_final:
        prompt = f"""You are the Hiring Manager making the final decision.
Review the intense debate between HR and Technical Manager. Resolve the conflict and declare your final verdict based on project impact and business value.
CRITICAL RULE: If the candidate's resume is fundamentally irrelevant to the Job Description (e.g. an IT developer applying for a Business Sales role), your final decision MUST be 'No Hire' with a very high confidence score (e.g. 95-100). Do not pass a candidate if their core background is a complete mismatch.
Keep your spoken response concise (2-3 sentences).

JOB DESCRIPTION: {state["job_description"]}
RESUME: {state["resume_text"]}
DISCUSSION SO FAR:
{history}

Return ONLY a JSON object:
{{
  "thinking": "Briefly state how you are weighing the technical pros against the cultural/soft skill cons.",
  "response": "your final spoken text",
  "decision": "Hire" or "No Hire",
  "confidence": <integer from 0 to 100 representing confidence in this decision>
}}"""
        res = _call_gemini(prompt)
        new_msg = {
            "agent": "Hiring Manager", 
            "content": res.get("response", "Let's decide."),
            "thinking": res.get("thinking", "Weighing business impact vs risks...")
        }
        return {
            **state,
            "messages": state["messages"] + [new_msg],
            "turn_count": turn_count,
            "final_decision": res.get("decision", "Undecided"),
            "confidence": res.get("confidence", 50)
        }
    else:
        prompt = f"""You are the Hiring Manager. You focus on impact, leadership, and overall value.
Mediate the disagreement between HR and the Technical Manager. You want someone who solves business problems. Call out if either HR or Tech is being too rigid.
CRITICAL RULE: If the candidate is clearly applying for the wrong role (e.g. IT resume for Sales), explicitly state that you are leaning towards rejection due to complete lack of relevant experience.
Keep your spoken response EXTREMELY concise (1-2 short sentences max).

JOB DESCRIPTION: {state["job_description"]}
RESUME: {state["resume_text"]}
DISCUSSION SO FAR:
{history}

Return ONLY a JSON object:
{{
  "thinking": "Briefly state what business metrics or leadership qualities you are checking right now.",
  "response": "your short spoken text"
}}"""
        res = _call_gemini(prompt)
        new_msg = {
            "agent": "Hiring Manager", 
            "content": res.get("response", "Let's focus on the impact."),
            "thinking": res.get("thinking", "Evaluating leadership and ROI...")
        }
        return {
            **state,
            "messages": state["messages"] + [new_msg],
            "turn_count": turn_count
        }
