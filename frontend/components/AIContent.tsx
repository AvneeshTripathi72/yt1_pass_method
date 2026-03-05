"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Sparkles, Brain, ListChecks, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AIContentProps {
  type: string;
  transcript: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AIContent({ type, transcript }: AIContentProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAIContent = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = `${API_BASE}/${type}`;
        const res = await axios.post(endpoint, { transcript });
        setContent(res.data[type] || res.data.summary || res.data.insights || res.data.mindmap || "");
      } catch (err) {
        console.error(err);
        setError("Failed to generate AI content. Make sure your GROQ_API_KEY is configured in the backend .env file.");
      } finally {
        setLoading(false);
      }
    };

    if (transcript) {
      fetchAIContent();
    }
  }, [type, transcript]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
        <Loader2 className="text-blue-500 animate-spin" size={40} />
        <p className="text-gray-400 font-medium font-inter">
          GROQ AI is analyzing the transcript...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                   <Sparkles className="text-red-500" size={24} />
        </div>
        <p className="text-red-400 text-sm font-medium">{error}</p>
      </div>
    );
  }

  const getIcon = () => {
    switch (type) {
      case "summary": return <ListChecks size={24} className="text-blue-500" />;
      case "insights": return <Sparkles size={24} className="text-purple-500" />;
      case "mindmap": return <Brain size={24} className="text-orange-500" />;
      default: return null;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white/5 rounded-2xl">
          {getIcon()}
        </div>
        <h3 className="text-lg font-bold capitalize">AI Generated {type}</h3>
      </div>
      <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
