import os
from groq import Groq
from typing import Dict, Any

class AIService:
    def __init__(self):
        self._client = None

    def get_client(self):
        if not self._client:
            api_key = os.getenv("GROQ_API_KEY")
            if api_key:
                self._client = Groq(api_key=api_key)
        return self._client

    async def generate_summary(self, transcript: str) -> str:
        client = self.get_client()
        if not client:
            return "GROQ API Key missing. Please configure it in .env"
            
        try:
            prompt = f"Summarize the following YouTube transcript in bullet points:\n\n{transcript[:15000]}"
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"AI Error: {str(e)}"

    async def generate_insights(self, transcript: str) -> str:
        client = self.get_client()
        if not client:
            return "GROQ API Key missing."
            
        try:
            prompt = f"Extract key insights and major takeaways from the following transcript:\n\n{transcript[:15000]}"
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"AI Error: {str(e)}"

    async def generate_mindmap(self, transcript: str) -> str:
        client = self.get_client()
        if not client:
            return "GROQ API Key missing."
            
        try:
            prompt = f"Create a structured mind map or hierarchical outline of the main topics in this transcript. Use markdown levels (#, ##, -):\n\n{transcript[:15000]}"
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"AI Error: {str(e)}"

    async def translate(self, text: str, target_lang: str) -> str:
        client = self.get_client()
        if not client:
            return "GROQ API Key missing."
            
        try:
            prompt = f"Translate the following text to {target_lang}. Maintain the tone and nuances:\n\n{text[:5000]}"
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"AI Error: {str(e)}"
