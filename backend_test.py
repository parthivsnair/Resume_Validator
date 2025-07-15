#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Resume and Job Description Matcher
Tests all FastAPI endpoints with realistic data scenarios
"""

import asyncio
import aiohttp
import json
import base64
import os
from typing import Dict, Any, Optional
import sys

# Get backend URL from frontend environment
BACKEND_URL = "http://localhost:8001"  # From frontend/.env REACT_APP_BACKEND_URL

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = None
        self.test_results = []
        self.resume_id = None
        self.job_id = None
        self.match_id = None
    
    async def setup(self):
        """Setup test session"""
        self.session = aiohttp.ClientSession()
        print(f"🚀 Starting backend API tests for: {self.base_url}")
        print("=" * 60)
    
    async def cleanup(self):
        """Cleanup test session"""
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
    
    async def test_health_check(self):
        """Test health check endpoint"""
        try:
            async with self.session.get(f"{self.base_url}/api/health") as response:
                if response.status == 200:
                    data = await response.json()
                    if "status" in data and data["status"] == "healthy":
                        self.log_test("Health Check", True, f"Status: {data['status']}")
                        return True
                    else:
                        self.log_test("Health Check", False, f"Invalid response: {data}")
                        return False
                else:
                    self.log_test("Health Check", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False
    
    async def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            async with self.session.get(f"{self.base_url}/") as response:
                if response.status == 200:
                    data = await response.json()
                    if "message" in data:
                        self.log_test("Root Endpoint", True, f"Message: {data['message']}")
                        return True
                    else:
                        self.log_test("Root Endpoint", False, f"Invalid response: {data}")
                        return False
                else:
                    self.log_test("Root Endpoint", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def create_sample_resume_text(self) -> str:
        """Create realistic resume text for testing"""
        return """
        SARAH JOHNSON
        Senior Software Engineer
        Email: sarah.johnson@email.com | Phone: (555) 123-4567
        LinkedIn: linkedin.com/in/sarahjohnson
        
        PROFESSIONAL SUMMARY
        Experienced software engineer with 5+ years developing scalable web applications using Python, JavaScript, and cloud technologies. Proven track record in full-stack development, API design, and team leadership.
        
        TECHNICAL SKILLS
        • Programming Languages: Python, JavaScript, TypeScript, Java, SQL
        • Frameworks: FastAPI, React, Node.js, Django, Flask
        • Databases: PostgreSQL, MongoDB, Redis
        • Cloud Platforms: AWS, Google Cloud Platform, Docker, Kubernetes
        • Tools: Git, Jenkins, Jira, Postman
        
        PROFESSIONAL EXPERIENCE
        
        Senior Software Engineer | TechCorp Inc. | 2021 - Present
        • Led development of microservices architecture serving 1M+ users
        • Implemented RESTful APIs using FastAPI and Python
        • Collaborated with cross-functional teams to deliver features on time
        • Mentored junior developers and conducted code reviews
        
        Software Engineer | StartupXYZ | 2019 - 2021
        • Developed full-stack web applications using React and Node.js
        • Designed and optimized database schemas for improved performance
        • Implemented automated testing and CI/CD pipelines
        
        EDUCATION
        Bachelor of Science in Computer Science
        University of Technology | 2015 - 2019
        
        CERTIFICATIONS
        • AWS Certified Solutions Architect
        • Google Cloud Professional Developer
        """
    
    def create_sample_job_description(self) -> str:
        """Create realistic job description for testing"""
        return """
        Senior Full-Stack Developer - Remote
        
        Company: InnovateTech Solutions
        Location: Remote (US timezone)
        Salary: $120,000 - $150,000
        
        ABOUT THE ROLE
        We are seeking a talented Senior Full-Stack Developer to join our growing engineering team. You will be responsible for building scalable web applications, designing APIs, and working closely with product teams to deliver exceptional user experiences.
        
        REQUIRED SKILLS & QUALIFICATIONS
        • 4+ years of professional software development experience
        • Strong proficiency in Python and JavaScript/TypeScript
        • Experience with modern web frameworks (React, FastAPI, Django)
        • Solid understanding of database design (PostgreSQL, MongoDB)
        • Experience with cloud platforms (AWS, GCP) and containerization (Docker)
        • Knowledge of RESTful API design and microservices architecture
        • Familiarity with version control systems (Git) and CI/CD pipelines
        • Bachelor's degree in Computer Science or related field
        
        PREFERRED QUALIFICATIONS
        • Experience with Kubernetes and container orchestration
        • Knowledge of Redis and caching strategies
        • Experience with automated testing frameworks
        • Previous experience in a startup environment
        • AWS or GCP certifications
        
        RESPONSIBILITIES
        • Design and develop scalable web applications
        • Build and maintain RESTful APIs
        • Collaborate with product managers and designers
        • Participate in code reviews and technical discussions
        • Mentor junior team members
        • Contribute to architectural decisions
        
        BENEFITS
        • Competitive salary and equity package
        • Comprehensive health insurance
        • Flexible work arrangements
        • Professional development budget
        • Modern tech stack and tools
        """
    
    async def test_upload_resume(self):
        """Test resume upload and analysis"""
        try:
            # Create sample resume text and encode it
            resume_text = self.create_sample_resume_text()
            resume_base64 = base64.b64encode(resume_text.encode('utf-8')).decode('utf-8')
            
            payload = {
                "file_content": resume_base64,
                "filename": "sarah_johnson_resume.txt",
                "file_type": "txt"
            }
            
            async with self.session.post(
                f"{self.base_url}/api/upload-resume",
                json=payload,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if "resume_id" in data and "extracted_skills" in data:
                        self.resume_id = data["resume_id"]
                        skills_count = len(data.get("extracted_skills", []))
                        self.log_test("Resume Upload", True, 
                                    f"Resume ID: {self.resume_id[:8]}..., Skills extracted: {skills_count}")
                        return True
                    else:
                        self.log_test("Resume Upload", False, f"Invalid response structure: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Resume Upload", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Resume Upload", False, f"Exception: {str(e)}")
            return False
    
    async def test_analyze_job(self):
        """Test job description analysis"""
        try:
            job_description = self.create_sample_job_description()
            
            payload = {
                "title": "Senior Full-Stack Developer",
                "description": job_description
            }
            
            async with self.session.post(
                f"{self.base_url}/api/analyze-job",
                json=payload,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if "job_id" in data and "required_skills" in data:
                        self.job_id = data["job_id"]
                        skills_count = len(data.get("required_skills", []))
                        self.log_test("Job Analysis", True, 
                                    f"Job ID: {self.job_id[:8]}..., Required skills: {skills_count}")
                        return True
                    else:
                        self.log_test("Job Analysis", False, f"Invalid response structure: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Job Analysis", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Job Analysis", False, f"Exception: {str(e)}")
            return False
    
    async def test_match_resume_job(self):
        """Test resume-job matching"""
        if not self.resume_id or not self.job_id:
            self.log_test("Resume-Job Matching", False, "Missing resume_id or job_id from previous tests")
            return False
        
        try:
            payload = {
                "resume_id": self.resume_id,
                "job_id": self.job_id
            }
            
            async with self.session.post(
                f"{self.base_url}/api/match",
                json=payload,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if "match_id" in data and "overall_score" in data:
                        self.match_id = data["match_id"]
                        score = data.get("overall_score", 0)
                        self.log_test("Resume-Job Matching", True, 
                                    f"Match ID: {self.match_id[:8]}..., Score: {score}%")
                        return True
                    else:
                        self.log_test("Resume-Job Matching", False, f"Invalid response structure: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Resume-Job Matching", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Resume-Job Matching", False, f"Exception: {str(e)}")
            return False
    
    async def test_get_resumes(self):
        """Test getting all resumes"""
        try:
            async with self.session.get(f"{self.base_url}/api/resumes") as response:
                if response.status == 200:
                    data = await response.json()
                    if "resumes" in data and isinstance(data["resumes"], list):
                        count = len(data["resumes"])
                        self.log_test("Get Resumes", True, f"Retrieved {count} resumes")
                        return True
                    else:
                        self.log_test("Get Resumes", False, f"Invalid response structure: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Get Resumes", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Get Resumes", False, f"Exception: {str(e)}")
            return False
    
    async def test_get_jobs(self):
        """Test getting all jobs"""
        try:
            async with self.session.get(f"{self.base_url}/api/jobs") as response:
                if response.status == 200:
                    data = await response.json()
                    if "jobs" in data and isinstance(data["jobs"], list):
                        count = len(data["jobs"])
                        self.log_test("Get Jobs", True, f"Retrieved {count} jobs")
                        return True
                    else:
                        self.log_test("Get Jobs", False, f"Invalid response structure: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Get Jobs", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Get Jobs", False, f"Exception: {str(e)}")
            return False
    
    async def test_get_matches(self):
        """Test getting all matches"""
        try:
            async with self.session.get(f"{self.base_url}/api/matches") as response:
                if response.status == 200:
                    data = await response.json()
                    if "matches" in data and isinstance(data["matches"], list):
                        count = len(data["matches"])
                        self.log_test("Get Matches", True, f"Retrieved {count} matches")
                        return True
                    else:
                        self.log_test("Get Matches", False, f"Invalid response structure: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Get Matches", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Get Matches", False, f"Exception: {str(e)}")
            return False
    
    async def test_get_match_details(self):
        """Test getting match details"""
        if not self.match_id:
            self.log_test("Get Match Details", False, "Missing match_id from previous tests")
            return False
        
        try:
            async with self.session.get(f"{self.base_url}/api/match/{self.match_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if "match" in data and "resume" in data and "job" in data:
                        self.log_test("Get Match Details", True, 
                                    f"Retrieved detailed match info for {self.match_id[:8]}...")
                        return True
                    else:
                        self.log_test("Get Match Details", False, f"Invalid response structure: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Get Match Details", False, f"HTTP {response.status}: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Get Match Details", False, f"Exception: {str(e)}")
            return False
    
    async def test_error_handling(self):
        """Test error handling scenarios"""
        error_tests_passed = 0
        total_error_tests = 4
        
        # Test 1: Invalid resume upload
        try:
            payload = {
                "file_content": "invalid_base64",
                "filename": "test.txt",
                "file_type": "txt"
            }
            async with self.session.post(f"{self.base_url}/api/upload-resume", json=payload) as response:
                if response.status >= 400:
                    error_tests_passed += 1
        except:
            pass
        
        # Test 2: Invalid job analysis
        try:
            payload = {"title": "", "description": ""}
            async with self.session.post(f"{self.base_url}/api/analyze-job", json=payload) as response:
                if response.status >= 400:
                    error_tests_passed += 1
        except:
            pass
        
        # Test 3: Invalid match request
        try:
            payload = {"resume_id": "invalid", "job_id": "invalid"}
            async with self.session.post(f"{self.base_url}/api/match", json=payload) as response:
                if response.status >= 400:
                    error_tests_passed += 1
        except:
            pass
        
        # Test 4: Invalid match details
        try:
            async with self.session.get(f"{self.base_url}/api/match/invalid_id") as response:
                if response.status >= 400:
                    error_tests_passed += 1
        except:
            pass
        
        success = error_tests_passed >= 3  # Allow some flexibility
        self.log_test("Error Handling", success, 
                     f"Passed {error_tests_passed}/{total_error_tests} error scenarios")
        return success
    
    async def run_all_tests(self):
        """Run all backend tests"""
        await self.setup()
        
        try:
            # Core functionality tests
            tests = [
                ("Root Endpoint", self.test_root_endpoint),
                ("Health Check", self.test_health_check),
                ("Resume Upload", self.test_upload_resume),
                ("Job Analysis", self.test_analyze_job),
                ("Resume-Job Matching", self.test_match_resume_job),
                ("Get Resumes", self.test_get_resumes),
                ("Get Jobs", self.test_get_jobs),
                ("Get Matches", self.test_get_matches),
                ("Get Match Details", self.test_get_match_details),
                ("Error Handling", self.test_error_handling)
            ]
            
            for test_name, test_func in tests:
                print(f"\n🧪 Running: {test_name}")
                await test_func()
                await asyncio.sleep(0.5)  # Small delay between tests
            
            # Summary
            print("\n" + "=" * 60)
            print("📊 TEST SUMMARY")
            print("=" * 60)
            
            passed = sum(1 for result in self.test_results if result["success"])
            total = len(self.test_results)
            
            print(f"Total Tests: {total}")
            print(f"Passed: {passed}")
            print(f"Failed: {total - passed}")
            print(f"Success Rate: {(passed/total)*100:.1f}%")
            
            if passed == total:
                print("\n🎉 ALL TESTS PASSED! Backend API is working correctly.")
                return True
            else:
                print(f"\n⚠️  {total - passed} tests failed. Check the details above.")
                return False
                
        finally:
            await self.cleanup()

async def main():
    """Main test runner"""
    tester = BackendTester()
    success = await tester.run_all_tests()
    return success

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test runner failed: {e}")
        sys.exit(1)