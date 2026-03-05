"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useEffect, useRef } from "react";

interface Segment {
  start: number;
  duration: number;
  text: string;
}

interface TranscriptPanelProps {
  segments: Segment[];
  currentTime: number;
  jumpToTime: (seconds: number) => void;
}

export default function TranscriptPanel({ segments, currentTime, jumpToTime }: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {segments.map((segment, idx) => {
        const isActive = currentTime >= segment.start && currentTime < (segment.start + segment.duration + 0.5);
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.01 }}
            onClick={() => jumpToTime(segment.start)}
            className={`group p-4 rounded-2xl cursor-pointer transition-all border ${
              isActive 
              ? "bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/20" 
              : "border-transparent hover:bg-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-start gap-4">
              <span className={`text-xs font-bold leading-5 ${isActive ? "text-blue-400" : "text-gray-500 group-hover:text-blue-400"}`}>
                {formatTime(segment.start)}
              </span>
              <p className={`text-sm leading-relaxed transition-colors ${isActive ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-200"}`}>
                {segment.text}
              </p>
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
