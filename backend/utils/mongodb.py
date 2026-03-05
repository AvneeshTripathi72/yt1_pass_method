import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "youtube_transcript_ai"

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect_to_storage(cls):
        cls.client = AsyncIOMotorClient(MONGODB_URI)
        cls.db = cls.client[DB_NAME]
        print(f"✅ Connected to MongoDB at {MONGODB_URI}")

    @classmethod
    async def close_storage(cls):
        if cls.client:
            cls.client.close()

    @classmethod
    async def get_collection(cls, name: str):
        return cls.db[name]

db = MongoDB
