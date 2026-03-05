# Unified Transcript: Full Project Documentation 📖

This document provides a deep dive into the architecture, features, and internal logic of the **Unified Transcript AI** project.

---

## 🏗️ System Architecture

### 1. Frontend: The Brain of the UI
Built with **Next.js 16** (App Router), the frontend is designed for speed and responsiveness.
- **`app/page.tsx`**: The main entry point. Houses the core dashboard state, authentication modal, and video player logic.
- **Framer Motion**: Used for fluid, app-like transitions between transcript tabs (Summary, Insights, Mindmap).
- **YouTube IFrame API**: Integrated with `postMessage` for low-latency timestamp syncing, allowing video jumps without page refreshes.

### 2. Backend: The Secure Processing Hub
Powered by **FastAPI (Python)**, the backend is highly modular and asynchronous.
- **`api/routes.py`**: Handles video transcription, AI generation, and caching.
- **`api/auth.py`**: Manages secure user registration, login, and profile retrieval.
- **`services/transcript_service.py`**: A robust scraper that extracts YouTube transcripts by mimicking official API calls and using fallback methods.
- **`services/ai_service.py`**: Communicates with the **Groq API** using Meta's `llama-3.3-70b-versatile` model for lightning-fast analysis.

### 3. Database: Persistent Storage
Uses **MongoDB Atlas** for high-performance, schema-less storage.
- **Collection `transcripts`**: Caches previously scraped video transcripts to save API calls and ensure 1s load times on repeat requests.
- **Collection `users`**: Stores encrypted user credentials (using `bcrypt`) and creation timestamps.

---

## 🔒 Security & Authentication
- **JWT (JSON Web Tokens)**: Secure, signed tokens are used for session management.
- **Bcrypt**: All user passwords are salted and hashed before being stored in MongoDB.
- **CORS Policies**: Explicitly configured for `localhost`, `127.0.0.1`, and IPv6 `[::1]` to prevent cross-origin blocks while maintaining security.

---

## 🧠 AI Capabilities
All AI features are powered by production-ready Llama 3 models on Groq:
- **Bullet-point Summaries**: Condenses long videos into readable points.
- **Key Insights**: Identifies major takeaways and critical data.
- **Hierarchical Mindmaps**: Organizes video content into a logical markdown outline.
- **Multi-language Translation**: Translates transcripts while preserving tone and nuance.

---

## 📦 Directory Structure
```text
.
├── backend/
│   ├── api/          # Route handlers (auth, transcripts)
│   ├── services/     # Core business logic (AI, scraping)
│   ├── utils/        # MongoDB & Auth utilities
│   ├── .env          # Secrets & Config
│   └── main.py       # FastAPI entry point
└── frontend/
    ├── app/          # Next.js pages & layouts
    ├── public/       # Static assets
    └── tailwind.config.ts
```

© 2026 Unified Transcript AI. Build for Speed.
