from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from utils.mongodb import db
from utils.auth import get_password_hash, verify_password, create_access_token, get_current_user_email
from datetime import datetime

router = APIRouter(tags=["authentication"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    print(f"👤 Registering user: {user_in.email}")
    collection = await db.get_collection("users")
    print("🔍 Checking for existing user...")
    existing_user = await collection.find_one({"email": user_in.email})
    if existing_user:
        print("❌ User already exists")
        raise HTTPException(status_code=400, detail="User already exists")
    
    print("🔐 Hashing password...")
    hashed_password = get_password_hash(user_in.password)
    user_dict = {
        "email": user_in.email,
        "password": hashed_password,
        "username": user_in.username,
        "created_at": datetime.utcnow().isoformat()
    }
    
    print("📝 Inserting into DB...")
    result = await collection.insert_one(user_dict)
    
    print("🎟 Creating token...")
    access_token = create_access_token(data={"sub": user_in.email})
    print("✅ Registration complete")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin):
    collection = await db.get_collection("users")
    user = await collection.find_one({"email": user_in.email})
    
    if not user or not verify_password(user_in.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def get_me(token: str):
    email = await get_current_user_email(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    collection = await db.get_collection("users")
    user = await collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.pop("password", None)
    user.pop("_id", None)
    return user
