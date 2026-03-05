import re
import requests
import json
import html
from typing import List, Dict, Any

class TranscriptService:
    def __init__(self):
        self.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        self.session = requests.Session()

    def _get_headers(self, extra_headers=None):
        headers = {
            'User-Agent': self.user_agent,
            'Accept-Language': 'en-US,en;q=0.9',
        }
        if extra_headers:
            headers.update(extra_headers)
        return headers

    def extract_video_id(self, url: str) -> str:
        regex = r"(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|watch\?v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})"
        match = re.search(regex, url)
        if not match:
            raise ValueError("Invalid YouTube URL")
        return match.group(1)

    def get_api_key(self, video_id: str) -> str:
        url = f"https://www.youtube.com/watch?v={video_id}"
        response = self.session.get(url, headers=self._get_headers(), timeout=10)
        
        if response.status_code == 429:
            raise Exception("YouTube Rate Limited (429). Use a residential proxy to bypass.")
        
        match = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', response.text)
        if not match:
            match = re.search(r'ytcfg\.set\({"INNERTUBE_API_KEY":"([^"]+)"', response.text)
            if not match:
                raise Exception("Could not find InnerTube API Key")
        return match.group(1)

    def get_player_response(self, video_id: str, api_key: str) -> Dict[str, Any]:
        url = f"https://www.youtube.com/youtubei/v1/player?key={api_key}"
        payload = {
            "context": {
                "client": {
                    "clientName": "ANDROID",
                    "clientVersion": "20.10.38",
                    "hl": "en",
                    "gl": "US"
                }
            },
            "videoId": video_id
        }
        headers = self._get_headers({
            'Content-Type': 'application/json',
            'User-Agent': 'com.google.android.youtube/17.31.35 (Linux; U; Android 12; en_US) gzip'
        })
        response = self.session.post(url, json=payload, headers=headers, timeout=10)
        return response.json()

    def extract_caption_info(self, player_response: Dict[str, Any]) -> Dict[str, Any]:
        captions = player_response.get('captions', {}).get('playerCaptionsTracklistRenderer', {}).get('captionTracks', [])
        video_details = player_response.get('video_details', player_response.get('videoDetails', {}))

        if not captions:
            # Check if video is age restricted
            playability = player_response.get('playabilityStatus', {})
            if playability.get('status') == 'LOGIN_REQUIRED':
                raise Exception("YouTube blocked this request: Age Restricted or Login Required. Use a Proxy or Cookies.")
            raise Exception("No transcript found for this video. (Check if captions are disabled)")

        # Default to first track
        track = captions[0]
        return {
            "caption_url": track['baseUrl'],
            "metadata": {
                "videoId": video_details.get('videoId'),
                "title": video_details.get('title'),
                "author": video_details.get('author'),
                "channelId": video_details.get('channelId'),
                "viewCount": video_details.get('viewCount'),
                "lengthSeconds": video_details.get('lengthSeconds')
            }
        }

    def fetch_transcript(self, caption_url: str) -> Dict[str, Any]:
        response = self.session.get(caption_url, headers=self._get_headers(), timeout=10)
        xml_content = response.text
        
        segments = []
        
        # Try standard XML format
        matches = re.finditer(r'<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>', xml_content)
        for match in matches:
            segments.append({
                "start": float(match.group(1)),
                "duration": float(match.group(2)),
                "text": html.unescape(match.group(3)).strip()
            })
            
        # Try SRV3 format fallback
        if not segments:
            matches = re.finditer(r'<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>', xml_content)
            for match in matches:
                clean_text = re.sub(r'<[^>]+>', '', match.group(3)).strip()
                if clean_text:
                    segments.append({
                        "start": int(match.group(1)) / 1000,
                        "duration": int(match.group(2)) / 1000,
                        "text": html.unescape(clean_text)
                    })

        full_text = " ".join([s['text'] for s in segments])
        return {"full_text": full_text, "segments": segments}
