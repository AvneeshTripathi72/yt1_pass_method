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

# Configure CORS with dynamic origin validation
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class DynamicCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.method == "OPTIONS":
            origin = request.headers.get("origin")
            response = Response(status_code=204)
            if origin:
                allowed_origins = [
                    "http://localhost:3000", "http://localhost:3001",
                    "http://127.0.0.1:3000", "http://127.0.0.1:3001",
                    "http://[::1]:3000", "http://[::1]:3001"
                ]
                if origin in allowed_origins or origin.endswith(".vercel.app") or origin.endswith(".onrender.com"):
                    response.headers["Access-Control-Allow-Origin"] = origin
                    response.headers["Access-Control-Allow-Credentials"] = "true"
                    response.headers["Access-Control-Allow-Methods"] = "*"
                    response.headers["Access-Control-Allow-Headers"] = "*"
            return response

        origin = request.headers.get("origin")
        response = await call_next(request)
        
        if origin:
            allowed_origins = [
                "http://localhost:3000", "http://localhost:3001",
                "http://127.0.0.1:3000", "http://127.0.0.1:3001",
                "http://[::1]:3000", "http://[::1]:3001"
            ]
            if origin in allowed_origins or origin.endswith(".vercel.app") or origin.endswith(".onrender.com"):
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = "*"
                response.headers["Access-Control-Allow-Headers"] = "*"
        
        return response

app.add_middleware(DynamicCORSMiddleware)

# Include routes
app.include_router(routes.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")

@app.get("/")
async def root():
    return {"message": "YouTube Transcript AI Backend is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
