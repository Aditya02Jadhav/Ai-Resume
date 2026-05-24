from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Plan(Base):
    __tablename__ = "plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True) # e.g. "free", "premium"
    limit_count = Column(Integer, default=5) # e.g. 5 parses/builds
    users = relationship("User", back_populates="plan")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True)
    hashed_password = Column(String(200))
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    plan = relationship("Plan", back_populates="users")
    resumes = relationship("Resume", back_populates="owner")
    scores = relationship("Score", back_populates="user")

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150))
    original_filename = Column(String(200))
    # Stored extracted text or structured JSON
    extracted_text = Column(Text, nullable=True)
    structured_data = Column(Text, nullable=True) 
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="resumes")
    scores = relationship("Score", back_populates="resume", cascade="all, delete-orphan")

class Score(Base):
    __tablename__ = "scores"
    
    id = Column(Integer, primary_key=True, index=True)
    overall_score = Column(Integer)
    breakdown = Column(Text) # JSON string of breakdown
    keyword_matches = Column(Text) 
    suggestions = Column(Text) # JSON string of suggestions
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # nullable for guests
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resume = relationship("Resume", back_populates="scores")
    user = relationship("User", back_populates="scores")

class UsageLimit(Base):
    __tablename__ = "usage_limits"
    
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(50), index=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    used_count = Column(Integer, default=0)
    last_used = Column(DateTime, default=datetime.utcnow)

class JobDescription(Base):
    __tablename__ = "job_descriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=True)
    description_text = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", foreign_keys=[user_id])
    analyses = relationship("Analysis", back_populates="job_description", cascade="all, delete-orphan")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Analysis pipeline outputs
    parser_output = Column(Text, nullable=True)  # JSON string
    scoring_output = Column(Text, nullable=True)  # JSON string
    critique_output = Column(Text, nullable=True)  # JSON string
    final_analysis = Column(Text, nullable=True)  # JSON string
    
    # Summary scores
    overall_score = Column(Integer, nullable=True)
    grade = Column(String(2), nullable=True)  # A, B, C, D, F
    
    # Node execution status
    node_statuses = Column(Text, nullable=True)  # JSON string
    node_details = Column(Text, nullable=True)  # JSON string
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    resume = relationship("Resume", foreign_keys=[resume_id])
    job_description = relationship("JobDescription", back_populates="analyses", foreign_keys=[job_description_id])
    user = relationship("User", foreign_keys=[user_id])

    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    resume = relationship("Resume", foreign_keys=[resume_id])
    job_description = relationship("JobDescription", back_populates="analyses")
    user = relationship("User", foreign_keys=[user_id])
