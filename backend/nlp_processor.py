import os
import json
import re
from typing import List, Dict, Any, Tuple
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv
import uuid
import asyncio

load_dotenv()

class NLPProcessor:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    async def extract_resume_info(self, resume_text: str) -> Dict[str, List[str]]:
        """Extract skills, experience, and qualifications from resume"""
        
        session_id = str(uuid.uuid4())
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message="You are an expert resume analyzer. Extract information from resumes and provide structured JSON responses."
        ).with_model("gemini", "gemini-1.5-flash")
        
        prompt = f"""
        Analyze the following resume and extract information in JSON format:
        
        Resume Text:
        {resume_text}
        
        Please provide a JSON response with the following structure:
        {{
            "skills": ["skill1", "skill2", ...],
            "experience": ["experience1", "experience2", ...],
            "qualifications": ["qualification1", "qualification2", ...],
            "keywords": ["keyword1", "keyword2", ...]
        }}
        
        Guidelines:
        - Extract all technical skills, soft skills, and tools mentioned
        - Include work experience descriptions, job titles, and achievements
        - Extract educational qualifications, certifications, and degrees
        - Include relevant keywords that would be important for job matching
        - Be comprehensive but avoid duplicates
        - Only return the JSON, no additional text
        """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        try:
            # Clean the response and extract JSON
            cleaned_response = self._clean_json_response(response)
            extracted_info = json.loads(cleaned_response)
            
            return {
                "skills": extracted_info.get("skills", []),
                "experience": extracted_info.get("experience", []),
                "qualifications": extracted_info.get("qualifications", []),
                "keywords": extracted_info.get("keywords", [])
            }
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Response: {response}")
            return {
                "skills": [],
                "experience": [],
                "qualifications": [],
                "keywords": []
            }
    
    async def extract_job_info(self, job_description: str) -> Dict[str, List[str]]:
        """Extract required skills, experience, and qualifications from job description"""
        
        session_id = str(uuid.uuid4())
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message="You are an expert job description analyzer. Extract requirements from job descriptions and provide structured JSON responses."
        ).with_model("gemini", "gemini-1.5-flash")
        
        prompt = f"""
        Analyze the following job description and extract requirements in JSON format:
        
        Job Description:
        {job_description}
        
        Please provide a JSON response with the following structure:
        {{
            "required_skills": ["skill1", "skill2", ...],
            "required_experience": ["experience1", "experience2", ...],
            "required_qualifications": ["qualification1", "qualification2", ...],
            "keywords": ["keyword1", "keyword2", ...]
        }}
        
        Guidelines:
        - Extract all required technical skills, soft skills, and tools
        - Include required experience levels, years, and specific experience types
        - Extract educational requirements, certifications, and degrees
        - Include important keywords that candidates should have
        - Be comprehensive but avoid duplicates
        - Only return the JSON, no additional text
        """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        try:
            # Clean the response and extract JSON
            cleaned_response = self._clean_json_response(response)
            extracted_info = json.loads(cleaned_response)
            
            return {
                "required_skills": extracted_info.get("required_skills", []),
                "required_experience": extracted_info.get("required_experience", []),
                "required_qualifications": extracted_info.get("required_qualifications", []),
                "keywords": extracted_info.get("keywords", [])
            }
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Response: {response}")
            return {
                "required_skills": [],
                "required_experience": [],
                "required_qualifications": [],
                "keywords": []
            }
    
    async def calculate_match_score(self, resume_info: Dict, job_info: Dict) -> Dict[str, Any]:
        """Calculate semantic matching score between resume and job requirements"""
        
        session_id = str(uuid.uuid4())
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message="You are an expert resume-job matching analyzer. Calculate semantic matches and provide detailed analysis."
        ).with_model("gemini", "gemini-1.5-flash")
        
        prompt = f"""
        Analyze the semantic match between this resume and job requirements:
        
        Resume Information:
        Skills: {resume_info.get('skills', [])}
        Experience: {resume_info.get('experience', [])}
        Qualifications: {resume_info.get('qualifications', [])}
        Keywords: {resume_info.get('keywords', [])}
        
        Job Requirements:
        Required Skills: {job_info.get('required_skills', [])}
        Required Experience: {job_info.get('required_experience', [])}
        Required Qualifications: {job_info.get('required_qualifications', [])}
        Keywords: {job_info.get('keywords', [])}
        
        Please provide a JSON response with the following structure:
        {{
            "overall_score": 85.5,
            "skills_match": {{
                "score": 80.0,
                "matched": ["skill1", "skill2"],
                "missing": ["skill3", "skill4"]
            }},
            "experience_match": {{
                "score": 90.0,
                "matched": ["experience1"],
                "missing": ["experience2"]
            }},
            "qualifications_match": {{
                "score": 85.0,
                "matched": ["qualification1"],
                "missing": ["qualification2"]
            }},
            "matched_keywords": ["keyword1", "keyword2"],
            "missing_skills": ["skill3", "skill4"],
            "suggestions": ["suggestion1", "suggestion2"],
            "detailed_analysis": "Detailed analysis of the match..."
        }}
        
        Guidelines:
        - Use semantic matching, not just exact keyword matching
        - Overall score should be 0-100 based on weighted average
        - Consider similar skills as matches (e.g., "JavaScript" and "JS")
        - Provide actionable suggestions for improvement
        - Give detailed analysis explaining the scores
        - Only return the JSON, no additional text
        """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        try:
            # Clean the response and extract JSON
            cleaned_response = self._clean_json_response(response)
            match_result = json.loads(cleaned_response)
            
            return match_result
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Response: {response}")
            return {
                "overall_score": 0.0,
                "skills_match": {"score": 0.0, "matched": [], "missing": []},
                "experience_match": {"score": 0.0, "matched": [], "missing": []},
                "qualifications_match": {"score": 0.0, "matched": [], "missing": []},
                "matched_keywords": [],
                "missing_skills": [],
                "suggestions": ["Unable to analyze match at this time"],
                "detailed_analysis": "Analysis failed due to processing error"
            }
    
    def _clean_json_response(self, response: str) -> str:
        """Clean the response to extract valid JSON"""
        # Remove any markdown formatting
        response = re.sub(r'```json\s*', '', response)
        response = re.sub(r'```\s*', '', response)
        
        # Find JSON object
        json_start = response.find('{')
        json_end = response.rfind('}')
        
        if json_start != -1 and json_end != -1:
            return response[json_start:json_end + 1]
        
        return response.strip()