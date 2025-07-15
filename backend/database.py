import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/resume_matcher")

# Async MongoDB client for FastAPI
client = AsyncIOMotorClient(MONGO_URL)
database = client.get_default_database()

# Collections
resumes_collection = database.resumes
jobs_collection = database.jobs
matches_collection = database.matches

# Sync client for initialization
sync_client = MongoClient(MONGO_URL)
sync_db = sync_client.get_default_database()

async def init_database():
    """Initialize database with indexes"""
    try:
        # Create indexes for better performance
        await resumes_collection.create_index("id")
        await jobs_collection.create_index("id")
        await matches_collection.create_index("resume_id")
        await matches_collection.create_index("job_id")
        await matches_collection.create_index("created_at")
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")

async def close_database():
    """Close database connection"""
    client.close()