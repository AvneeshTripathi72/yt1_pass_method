# Unified Transcript: Deployment Guide 🌐

Follow these steps to deploy **Unified Transcript AI** for the first time or for production.

---

## 🛠 Prerequisites
1. **Node.js** (v18 or higher)
2. **Python** (3.10 or higher)
3. **MongoDB Atlas Account** (for production database)
4. **Groq Cloud API Key** (for Llama 3 generation)

---

## 🚀 Step 1: Backend Deployment (FastAPI)

### 1. Configure `.env`
Create a `.env` in `backend/` with the following:
```env
GROQ_API_KEY=your_groq_api_key
MONGODB_URI=your_mongodb_connection_string
PORT=8000
AUTH_SECRET=your_super_secret_string
```

### 2. Install Dependencies
```bash
cd backend
python -m pip install -r requirements.txt
```

### 3. Run for Production (Uvicorn)
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```
> **Tip**: Use `0.0.0.0` to allow external connections (on Cloud providers like Render, AWS, or DigitalOcean).

---

## 🖥️ Step 2: Frontend Deployment (Next.js)

### 1. Configure Environment Variables
Create a `.env.local` in `frontend/` with:
```env
NEXT_PUBLIC_API_URL=http://your-backend-url.com/api
```

### 2. Build the Application
```bash
cd frontend
npm install
npm run build
```

### 3. Start Production Server
```bash
npm start
```
> **Tip**: For Vercel or Netlify, simply push your code to GitHub and connect the repository.

---

## 🌍 Recommended Hosting Platforms

| Component | Recommended Platform | Why? |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | Native Next.js support, edge caching. |
| **Backend** | [Render](https://render.com) | Native FastAPI support, easy Auto-Deploy. |
| **Database** | [MongoDB Atlas](https://mongodb.com/atlas) | Free managed tier, global clusters. |

---

## 🔒 Post-Deployment Security Check
1.  **CORS**: Ensure your backend `main.py` includes your production domain in `allow_origins`.
2.  **HTTPS**: Always use an SSL certificate (Render and Vercel provide this for free).
3.  **Secrets**: Never commit your `.env` file to version control. Use a `.gitignore` file.

© 2026 Unified Transcript AI. Deployment Ready.
