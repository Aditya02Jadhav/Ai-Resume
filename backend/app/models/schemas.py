from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    email: str
    plan_id: Optional[int]
    is_active: bool

    class Config:
        from_attributes = True

# --- Resume Schemas ---
class ResumeBase(BaseModel):
    title: str

class ResumeCreate(ResumeBase):
    pass

class ResumeResponse(ResumeBase):
    id: int
    original_filename: str
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True

# --- Score Schemas ---
class Breakdown(BaseModel):
    keywords: int
    skills: int
    experience: int
    formatting: int
    education: int

class ScoreResponse(BaseModel):
    id: int
    overall_score: int
    breakdown: dict
    suggestions: List[str]
    resume_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ResumeHistoryResponse(BaseModel):
    id: int
    title: str
    original_filename: str
    created_at: datetime
    scores: List[ScoreResponse]

    class Config:
        from_attributes = True

# --- JobDescription Schemas ---
class JobDescriptionCreate(BaseModel):
    title: Optional[str] = None
    description_text: str

class JobDescriptionResponse(BaseModel):
    id: int
    title: Optional[str]
    description_text: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Analysis Schemas ---
class AnalysisBase(BaseModel):
    parser_output: Optional[Any] = None
    scoring_output: Optional[Any] = None
    critique_output: Optional[Any] = None
    final_analysis: Optional[Any] = None
    overall_score: Optional[int] = None
    grade: Optional[str] = None
    node_statuses: Optional[dict] = None
    node_details: Optional[dict] = None

class AnalysisCreate(AnalysisBase):
    resume_id: Optional[int] = None
    job_description_id: Optional[int] = None

class AnalysisResponse(AnalysisBase):
    id: int
    resume_id: Optional[int]
    job_description_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AnalysisHistoryResponse(BaseModel):
    id: int
    overall_score: Optional[int]
    grade: Optional[str]
    created_at: datetime
    job_description: Optional[JobDescriptionResponse] = None

    class Config:
        from_attributes = True
