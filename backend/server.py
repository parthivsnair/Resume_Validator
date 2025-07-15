from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from typing import List, Optional
from datetime import datetime
import json

# Import our modules
from models import ResumeAnalysis, JobDescription, MatchingResult, UploadRequest, JobDescriptionRequest, MatchRequest
from database import init_database, close_database, resumes_collection, jobs_collection, matches_collection
from nlp_processor import NLPProcessor
from file_processor import FileProcessor

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_database()
    yield
    # Shutdown
    await close_database()

app = FastAPI(
    title="Resume and Job Description Matcher",
    description="AI-powered resume and job description matching system",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processors
nlp_processor = NLPProcessor()
file_processor = FileProcessor()

@app.get("/")
async def root():
    return {"message": "Resume and Job Description Matcher API", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/upload-resume")
async def upload_resume(request: UploadRequest):
    """Upload and process a resume file"""
    try:
        # Validate file size (100MB limit)
        if not file_processor.validate_file_size(request.file_content, 100):
            raise HTTPException(status_code=413, detail="File size exceeds 100MB limit")
        
        # Validate file type
        if request.file_type.lower() not in file_processor.get_supported_formats():
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Supported formats: {file_processor.get_supported_formats()}"
            )
        
        # Extract text from file
        extracted_text = file_processor.extract_text_from_base64(
            request.file_content, 
            request.file_type
        )
        
        if not extracted_text:
            raise HTTPException(status_code=400, detail="Failed to extract text from file")
        
        # Process with NLP
        resume_info = await nlp_processor.extract_resume_info(extracted_text)
        
        # Create resume analysis object
        resume_analysis = ResumeAnalysis(
            filename=request.filename,
            original_text=extracted_text,
            extracted_skills=resume_info.get("skills", []),
            extracted_experience=resume_info.get("experience", []),
            extracted_qualifications=resume_info.get("qualifications", []),
            extracted_keywords=resume_info.get("keywords", [])
        )
        
        # Save to database
        await resumes_collection.insert_one(resume_analysis.model_dump())
        
        return {
            "message": "Resume processed successfully",
            "resume_id": resume_analysis.id,
            "extracted_skills": resume_analysis.extracted_skills,
            "extracted_experience": resume_analysis.extracted_experience,
            "extracted_qualifications": resume_analysis.extracted_qualifications,
            "extracted_keywords": resume_analysis.extracted_keywords
        }
        
    except Exception as e:
        print(f"Error processing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@app.post("/api/analyze-job")
async def analyze_job_description(request: JobDescriptionRequest):
    """Analyze a job description"""
    try:
        # Process with NLP
        job_info = await nlp_processor.extract_job_info(request.description)
        
        # Create job description object
        job_description = JobDescription(
            title=request.title,
            description=request.description,
            required_skills=job_info.get("required_skills", []),
            required_experience=job_info.get("required_experience", []),
            required_qualifications=job_info.get("required_qualifications", []),
            extracted_keywords=job_info.get("keywords", [])
        )
        
        # Save to database
        await jobs_collection.insert_one(job_description.model_dump())
        
        return {
            "message": "Job description analyzed successfully",
            "job_id": job_description.id,
            "required_skills": job_description.required_skills,
            "required_experience": job_description.required_experience,
            "required_qualifications": job_description.required_qualifications,
            "extracted_keywords": job_description.extracted_keywords
        }
        
    except Exception as e:
        print(f"Error analyzing job description: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing job description: {str(e)}")

@app.post("/api/match")
async def match_resume_job(request: MatchRequest):
    """Match a resume with a job description"""
    try:
        # Get resume from database
        resume_doc = await resumes_collection.find_one({"id": request.resume_id})
        if not resume_doc:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Get job from database
        job_doc = await jobs_collection.find_one({"id": request.job_id})
        if not job_doc:
            raise HTTPException(status_code=404, detail="Job description not found")
        
        # Prepare data for matching
        resume_info = {
            "skills": resume_doc.get("extracted_skills", []),
            "experience": resume_doc.get("extracted_experience", []),
            "qualifications": resume_doc.get("extracted_qualifications", []),
            "keywords": resume_doc.get("extracted_keywords", [])
        }
        
        job_info = {
            "required_skills": job_doc.get("required_skills", []),
            "required_experience": job_doc.get("required_experience", []),
            "required_qualifications": job_doc.get("required_qualifications", []),
            "keywords": job_doc.get("extracted_keywords", [])
        }
        
        # Calculate match score
        match_result = await nlp_processor.calculate_match_score(resume_info, job_info)
        
        # Create matching result object
        matching_result = MatchingResult(
            resume_id=request.resume_id,
            job_id=request.job_id,
            overall_score=match_result.get("overall_score", 0.0),
            skills_match=match_result.get("skills_match", {}),
            experience_match=match_result.get("experience_match", {}),
            qualifications_match=match_result.get("qualifications_match", {}),
            matched_keywords=match_result.get("matched_keywords", []),
            missing_skills=match_result.get("missing_skills", []),
            suggestions=match_result.get("suggestions", []),
            detailed_analysis=match_result.get("detailed_analysis", "")
        )
        
        # Save to database
        await matches_collection.insert_one(matching_result.model_dump())
        
        return {
            "message": "Match analysis completed",
            "match_id": matching_result.id,
            "overall_score": matching_result.overall_score,
            "skills_match": matching_result.skills_match,
            "experience_match": matching_result.experience_match,
            "qualifications_match": matching_result.qualifications_match,
            "matched_keywords": matching_result.matched_keywords,
            "missing_skills": matching_result.missing_skills,
            "suggestions": matching_result.suggestions,
            "detailed_analysis": matching_result.detailed_analysis
        }
        
    except Exception as e:
        print(f"Error matching resume and job: {e}")
        raise HTTPException(status_code=500, detail=f"Error matching resume and job: {str(e)}")

@app.get("/api/resumes")
async def get_resumes():
    """Get all processed resumes"""
    try:
        cursor = resumes_collection.find({})
        resumes = []
        async for doc in cursor:
            # Remove MongoDB ObjectId and convert datetime
            doc.pop('_id', None)
            if 'created_at' in doc:
                doc['created_at'] = doc['created_at'].isoformat()
            resumes.append(doc)
        
        return {"resumes": resumes}
    except Exception as e:
        print(f"Error getting resumes: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting resumes: {str(e)}")

@app.get("/api/jobs")
async def get_jobs():
    """Get all analyzed job descriptions"""
    try:
        cursor = jobs_collection.find({})
        jobs = []
        async for doc in cursor:
            # Remove MongoDB ObjectId and convert datetime
            doc.pop('_id', None)
            if 'created_at' in doc:
                doc['created_at'] = doc['created_at'].isoformat()
            jobs.append(doc)
        
        return {"jobs": jobs}
    except Exception as e:
        print(f"Error getting jobs: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting jobs: {str(e)}")

@app.get("/api/matches")
async def get_matches():
    """Get all matching results"""
    try:
        cursor = matches_collection.find({})
        matches = []
        async for doc in cursor:
            # Remove MongoDB ObjectId and convert datetime
            doc.pop('_id', None)
            if 'created_at' in doc:
                doc['created_at'] = doc['created_at'].isoformat()
            matches.append(doc)
        
        return {"matches": matches}
    except Exception as e:
        print(f"Error getting matches: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting matches: {str(e)}")

@app.get("/api/match/{match_id}")
async def get_match_details(match_id: str):
    """Get detailed match information"""
    try:
        match_doc = await matches_collection.find_one({"id": match_id})
        if not match_doc:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Get resume and job details
        resume_doc = await resumes_collection.find_one({"id": match_doc["resume_id"]})
        job_doc = await jobs_collection.find_one({"id": match_doc["job_id"]})
        
        # Remove MongoDB ObjectId and convert datetime
        match_doc.pop('_id', None)
        if 'created_at' in match_doc:
            match_doc['created_at'] = match_doc['created_at'].isoformat()
        
        if resume_doc:
            resume_doc.pop('_id', None)
            if 'created_at' in resume_doc:
                resume_doc['created_at'] = resume_doc['created_at'].isoformat()
        
        if job_doc:
            job_doc.pop('_id', None)
            if 'created_at' in job_doc:
                job_doc['created_at'] = job_doc['created_at'].isoformat()
        
        return {
            "match": match_doc,
            "resume": resume_doc,
            "job": job_doc
        }
    except Exception as e:
        print(f"Error getting match details: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting match details: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)