from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import models  # Import models to register them with Base
import uvicorn
import os
from .routes import auth, resume
from fastapi import Depends, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
from datetime import datetime

# Create tables if not exists
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Resume Score Checker & Builder",
    description="API for parsing, scoring, and building resumes",
    version="1.0.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Resume Builder API"}


@app.post("/analyze")
async def analyze_resume(
    resume_text: str = None,
    job_description: str = None,
):
    """Direct analyze endpoint - forwards to resume router"""
    from .routes.resume import analyze_resume as resume_analyze
    from .database import get_db
    
    db = next(get_db())
    try:
        return await resume_analyze(
            resume_text=resume_text,
            job_description=job_description,
            user=None,
            db=db
        )
    finally:
        db.close()


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

