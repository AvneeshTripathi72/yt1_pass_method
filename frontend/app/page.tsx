"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Youtube, 
  FileText, 
  Settings, 
  Share2, 
  Download, 
  Copy, 
  Languages,
  Clock,
  Sparkles,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import dynamic from "next/dynamic";
// ReactPlayer replaced by standard iframe for cross-browser stability
import axios from "axios";

// Components
import TranscriptPanel from "../components/TranscriptPanel";
import AIContent from "../components/AIContent";
import ExportButtons from "../components/ExportButtons";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://yt1-pass-method.onrender.com/api";
console.log("🚀 API Base initialized to:", API_BASE);

export default function Home() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=RFi5HIZLx8U&t=3s");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("transcript");
  const [currentTime, setCurrentTime] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setHasMounted(true);
    // Check for existing token
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetchUser(token);
    }
    // Load YouTube IFrame API
    if (!document.getElementById("youtube-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-api";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me?token=${token}`);
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem("auth_token");
    }
  };

  const handleAuth = async () => {
    setAuthLoading(true);
    try {
      const endpoint = isSignup ? "/auth/register" : "/auth/login";
      const res = await axios.post(`${API_BASE}${endpoint}`, {
        email: authEmail,
        password: authPassword
      });
      localStorage.setItem("auth_token", res.data.access_token);
      await fetchUser(res.data.access_token);
      setIsAuthOpen(false);
      setAuthEmail("");
      setAuthPassword("");
    } catch (err: any) {
      console.error("❌ Auth Error:", err);
      const msg = err.response?.data?.detail || err.message || "Authentication failed";
      alert(`Auth Error: ${msg}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  const handleGenerate = async () => {
    if (!url) return;
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/transcript`, { url });
      setData(res.data);
      // Wait for React to render the tabs before potentially switching (though we stay on transcript)
    } catch (err: any) {
      console.error("❌ Transcript Error:", err);
      const msg = err.response?.data?.detail || err.message || "Failed to fetch transcript.";
      alert(`API Error: ${msg}\n\nCheck console for details.`);
    } finally {
      setIsLoading(false);
    }
  };

  const jumpToTime = (seconds: number) => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }),
        "*"
      );
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "playVideo" }),
        "*"
      );
      setCurrentTime(seconds);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Youtube className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">Unified Transcript</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10">{user.email}</span>
              <button 
                onClick={handleLogout}
                className="px-6 py-2.5 bg-red-600/10 text-red-400 rounded-full hover:bg-red-600/20 transition-all font-semibold border border-red-600/20"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-2.5 bg-white text-black rounded-full hover:bg-gray-200 transition-all font-semibold"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <AnimatePresence mode="wait">
        {!data && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto text-center pt-24 pb-32 px-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs font-bold mb-8">
              <Sparkles size={14} />
              AI-Powered Transcription
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tighter text-gradient leading-tight">
              YouTube to Text
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
              Free AI-Powered YouTube Transcript Generator with Summaries & Timestamps
            </p>
            
            <div className="relative max-w-2xl mx-auto glass-morphism p-2 rounded-2xl border-white/10 group focus-within:border-blue-500/50 transition-all shadow-2xl">
              <div className="flex items-center px-4 py-3 gap-3">
                <Youtube className="text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Paste a YouTube link and get a clean, timestamped transcript..."
                  className="bg-transparent border-none outline-none flex-1 text-lg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-500 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <ChevronRight size={14} className="text-blue-500" />
                Example: youtube.com/watch?v=dQw4w9WgXcQ
              </div>
              <div className="flex items-center gap-2 hover:text-gray-300 cursor-pointer transition-colors">
                <Share2 size={14} className="text-purple-500" />
                Try Bulk Request
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main App Content */}
      <AnimatePresence>
        {data && (
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1400px] mx-auto px-6 pb-20"
          >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setData(null)}
                  className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold line-clamp-1">{data.metadata.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {Number(data.metadata.viewCount).toLocaleString()} views • {data.metadata.author}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ExportButtons data={data} />
                <button className="p-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors text-white">
                  <Share2 size={20} />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Video & Metadata */}
              <div className="lg:col-span-7 space-y-6">
                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group relative">
                  {hasMounted && data?.metadata?.videoId && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 group">
                      <iframe 
                        ref={iframeRef}
                        key={data.metadata.videoId}
                        src={`https://www.youtube.com/embed/${data.metadata.videoId}?enablejsapi=1&autoplay=0&rel=0`}
                        width="100%"
                        height="100%"
                        className="w-full h-full border-0 absolute inset-0 z-10"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube Video Player"
                      />
                      <div className="flex flex-col items-center gap-4 text-gray-500">
                        <Youtube size={48} />
                        <p className="text-sm font-medium">Reconnecting to YouTube...</p>
                        <button 
                          onClick={() => {
                            if (iframeRef.current) {
                              const src = iframeRef.current.src;
                              iframeRef.current.src = "";
                              setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src; }, 100);
                            }
                          }}
                          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg text-xs font-bold transition-all border border-blue-600/20"
                        >
                          Refresh Player
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-6 glass-morphism rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                      <Clock size={24} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Video Duration</p>
                      <p className="text-lg font-bold">{Math.floor(data.metadata.lengthSeconds / 60)}:{(data.metadata.lengthSeconds % 60).toString().padStart(2, '0')}</p>
                    </div>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                      <FileText size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Segments</p>
                      <p className="text-lg font-bold">{data.segments.length}</p>
                    </div>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10"></div>
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5">
                        <Languages size={18} />
                        <span className="text-sm font-semibold">Translate</span>
                      </button>
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#17171a] border border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all p-2 z-50">
                        {["Hindi", "Spanish", "French", "German", "Japanese"].map((lang) => (
                           <button 
                            key={lang}
                            onClick={async () => {
                              try {
                                const btn = document.getElementById('resTranscript');
                                if (btn) btn.innerText = "Translating...";
                                const res = await axios.post(`${API_BASE}/translate`, { 
                                  text: data.fullText, 
                                  target_lang: lang 
                                });
                                setData({ ...data, fullText: res.data.translated });
                              } catch (err) {
                                alert("Translation failed. Make sure GROQ_API_KEY is active.");
                              }
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"
                           >
                            {lang}
                           </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Tabbed Content */}
              <div className="lg:col-span-5 glass-morphism rounded-3xl overflow-hidden flex flex-col h-[700px]">
                <div className="p-4 flex gap-1 border-b border-white/10 overflow-x-auto no-scrollbar">
                  {["transcript", "summary", "insights", "mindmap"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                        activeTab === tab 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "text-gray-500 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 relative">
                  {activeTab === "transcript" ? (
                    <TranscriptPanel 
                      segments={data.segments} 
                      currentTime={currentTime} 
                      jumpToTime={jumpToTime} 
                    />
                  ) : (
                    <AIContent 
                      type={activeTab} 
                      transcript={data.fullText} 
                    />
                  )}
                </div>

                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Live Sync</span>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(data.fullText)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all text-sm font-bold"
                  >
                    <Copy size={16} />
                    Copy All
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="mt-20 border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-gray-500 text-sm">
            © 2026 Unified Transcript AI. Build for Speed.
          </div>
          <div className="flex items-center gap-8 text-gray-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Legal</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#17171a] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">{isSignup ? "Create Account" : "Welcome Back"}</h3>
                <button 
                  onClick={() => setIsAuthOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-inter">Email Address</label>
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-inter">Password</label>
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <button 
                  onClick={handleAuth}
                  disabled={authLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    isSignup ? "Sign Up" : "Sign In"
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  {isSignup ? "Already have an account?" : "Don't have an account?"} {" "}
                  <button 
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-blue-400 font-bold hover:underline"
                  >
                    {isSignup ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
