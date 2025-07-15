from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class ResumeAnalysis(BaseModel):
    id: str = None
    filename: str
    original_text: str
    extracted_skills: List[str]
    extracted_experience: List[str]
    extracted_qualifications: List[str]
    extracted_keywords: List[str]
    created_at: datetime = None
    
    def __init__(self, **data):
        if 'id' not in data or data['id'] is None:
            data['id'] = str(uuid.uuid4())
        if 'created_at' not in data or data['created_at'] is None:
            data['created_at'] = datetime.now()
        super().__init__(**data)

class JobDescription(BaseModel):
    id: str = None
    title: str
    description: str
    required_skills: List[str]
    required_experience: List[str]
    required_qualifications: List[str]
    extracted_keywords: List[str]
    created_at: datetime = None
    
    def __init__(self, **data):
        if 'id' not in data or data['id'] is None:
            data['id'] = str(uuid.uuid4())
        if 'created_at' not in data or data['created_at'] is None:
            data['created_at'] = datetime.now()
        super().__init__(**data)

class MatchingResult(BaseModel):
    id: str = None
    resume_id: str
    job_id: str
    overall_score: float
    skills_match: Dict[str, Any]
    experience_match: Dict[str, Any]
    qualifications_match: Dict[str, Any]
    matched_keywords: List[str]
    missing_skills: List[str]
    suggestions: List[str]
    detailed_analysis: str
    created_at: datetime = None
    
    def __init__(self, **data):
        if 'id' not in data or data['id'] is None:
            data['id'] = str(uuid.uuid4())
        if 'created_at' not in data or data['created_at'] is None:
            data['created_at'] = datetime.now()
        super().__init__(**data)

class UploadRequest(BaseModel):
    file_content: str
    filename: str
    file_type: str

class JobDescriptionRequest(BaseModel):
    title: str
    description: str

class MatchRequest(BaseModel):
    resume_id: str
    job_id: str