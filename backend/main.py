from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import routes, auth
import uvicorn
import os
from dotenv import load_dotenv

from utils.mongodb import db

load_dotenv()

app = FastAPI(title="YouTube Transcript AI API")

@app.on_event("startup")
async def startup_db_client():
    await db.connect_to_storage()

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.close_storage()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://[::1]:3000",
        "http://[::1]:3001",
        "https://yt1-pass-method.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
@app.get("/api")
async def api_root():
    return {"message": "Unified Transcript API is active", "v": "1.0.0"}

app.include_router(routes.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")

@app.get("/")
async def root():
    return {"message": "YouTube Transcript AI Backend is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
