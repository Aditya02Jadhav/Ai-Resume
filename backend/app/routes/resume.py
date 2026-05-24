from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models, schemas
from ..services.extractor import extract_text_from_pdf, extract_text_from_docx
from ..services.scorer import score_resume
from .auth import create_access_token # Maybe not needed here, but keeping standard
from ..services.limits import check_usage_limits
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import StreamingResponse
import json
from typing import List
from datetime import datetime

router = APIRouter(prefix="/resume", tags=["resume"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_current_user_optional(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        return None
    import jwt
    from ..services.auth import SECRET_KEY, ALGORITHM
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        user = db.query(models.User).filter(models.User.email == email).first()
        return user
    except Exception:
        return None

# Old SQL-based endpoint - DEPRECATED, use /upload in main.py instead
# @router.post("/upload", response_model=schemas.ScoreResponse)
# async def upload_and_score_resume(
#     request: Request,
#     file: UploadFile = File(...), 
#     db: Session = Depends(get_db),
#     user: models.User = Depends(get_current_user_optional)
# ):
#     """DEPRECATED: Use /upload endpoint in main.py with LLM agent instead"""
#     pass

@router.get("/history", response_model=List[schemas.ResumeHistoryResponse])
def get_resume_history(user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return db.query(models.Resume).filter(models.Resume.owner_id == user.id).order_by(models.Resume.created_at.desc()).all()

@router.delete("/{resume_id}")
def delete_resume(resume_id: int, user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.owner_id == user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}


@router.post("/analyze")
async def analyze_resume(
    resume_text: str = None,
    job_description: str = None,
    user: models.User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Analyze resume against job description and save results to database"""
    from ..agent.graph import create_analysis_graph
    
    if not resume_text or not job_description:
        raise HTTPException(status_code=400, detail="resume_text and job_description are required")
    
    # Save resume to database
    resume_obj = models.Resume(
        title="Analyzed Resume",
        original_filename="resume.txt",
        extracted_text=resume_text,
        owner_id=user.id if user else None,
        created_at=datetime.utcnow()
    )
    db.add(resume_obj)
    db.flush()  # Get the resume ID without committing
    
    # Save job description to database
    job_desc_obj = models.JobDescription(
        title="Position Description",
        description_text=job_description,
        user_id=user.id if user else None,
        created_at=datetime.utcnow()
    )
    db.add(job_desc_obj)
    db.flush()
    
    # Create analysis record
    analysis = models.Analysis(
        resume_id=resume_obj.id,
        job_description_id=job_desc_obj.id,
        user_id=user.id if user else None,
        created_at=datetime.utcnow()
    )
    db.add(analysis)
    db.flush()
    
    async def generate():
        """Generator for streaming responses"""
        try:
            # Create and run the graph
            graph = create_analysis_graph()
            
            # Initial state
            input_state = {
                "resume_text": resume_text,
                "job_description": job_description,
                "node_statuses": {},
                "node_details": {}
            }
            
            # Stream results
            for output in graph.stream(input_state):
                # Extract node name and output
                for node_name, node_output in output.items():
                    if node_name not in ["resume_text", "job_description"]:
                        # Update analysis with node output
                        if node_name == "parser_node":
                            analysis.parser_output = json.dumps(node_output)
                        elif node_name == "scoring_node":
                            analysis.scoring_output = json.dumps(node_output)
                        elif node_name == "critique_node":
                            analysis.critique_output = json.dumps(node_output)
                        elif node_name == "finalizer_node":
                            analysis.final_analysis = json.dumps(node_output)
                            # Extract score and grade
                            if isinstance(node_output, dict):
                                analysis.overall_score = node_output.get("overall_score")
                                analysis.grade = node_output.get("grade")
                        
                        # Send to client
                        yield f"data: {json.dumps({'node': node_name, 'data': node_output})}\n\n"
                
                # Update node statuses
                analysis.node_statuses = json.dumps(output.get("node_statuses", {}))
                analysis.node_details = json.dumps(output.get("node_details", {}))
            
            # Commit to database
            db.commit()
            yield f"data: {json.dumps({'status': 'complete'})}\n\n"
            
        except Exception as e:
            db.rollback()
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

