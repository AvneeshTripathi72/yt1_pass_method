from fastapi import APIRouter, HTTPException
from services.transcript_service import TranscriptService
from services.ai_service import AIService
from utils.mongodb import db
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()
transcript_service = TranscriptService()
ai_service = AIService()

class URLRequest(BaseModel):
    url: str

class SummaryRequest(BaseModel):
    transcript: str

class TranslateRequest(BaseModel):
    text: str
    target_lang: str

@router.post("/transcript")
async def get_transcript(request: URLRequest):
    try:
        print(f"🎥 Extracting transcript for URL: {request.url}")
        video_id = transcript_service.extract_video_id(request.url)
        print(f"🆔 Video ID: {video_id}")
        
        # Check cache in MongoDB
        print("📦 Checking cache...")
        collection = await db.get_collection("transcripts")
        existing = await collection.find_one({"metadata.videoId": video_id})
        if existing:
            print(f"✅ Cache Hit for {video_id}")
            # Remove _id for JSON serialization
            existing.pop("_id", None)
            return existing
        
        print("🌍 Cache Miss. Scraping YouTube...")
        # Scrape if not in cache
        print("🔑 Getting API Key...")
        api_key = transcript_service.get_api_key(video_id)
        print(f"📄 Getting Player Response for {video_id}...")
        player_response = transcript_service.get_player_response(video_id, api_key)
        print("🎬 Extracting Caption Info...")
        info = transcript_service.extract_caption_info(player_response)
        print(f"🔗 Fetching text from: {info['caption_url'][:50]}...")
        transcript_data = transcript_service.fetch_transcript(info['caption_url'])
        
        result = {
            "metadata": info['metadata'],
            "fullText": transcript_data['full_text'],
            "segments": transcript_data['segments'],
            "createdAt": datetime.utcnow().isoformat()
        }
        
        print("💾 Saving to database...")
        # Save to MongoDB
        await collection.insert_one(result.copy())
        print("🎉 Success! Returning data.")
        return result
    except Exception as e:
        print(f"❌ ERROR in transcript extraction: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/summary")
async def get_summary(request: SummaryRequest):
    try:
        summary = await ai_service.generate_summary(request.transcript)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/insights")
async def get_insights(request: SummaryRequest):
    try:
        insights = await ai_service.generate_insights(request.transcript)
        return {"insights": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mindmap")
async def get_mindmap(request: SummaryRequest):
    try:
        mindmap = await ai_service.generate_mindmap(request.transcript)
        return {"mindmap": mindmap}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translate")
async def translate_text(request: TranslateRequest):
    try:
        translated = await ai_service.translate(request.text, request.target_lang)
        return {"translated": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/youtube")
async def check_youtube_health():
    try:
        # Simple head request to see if we're blocked
        service = TranscriptService()
        res = service.session.get("https://www.youtube.com", timeout=5)
        return {
            "status": "connected" if res.status_code == 200 else "blocked",
            "status_code": res.status_code,
            "using_proxy": bool(service.proxy)
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}
