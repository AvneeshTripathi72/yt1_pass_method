"use client";

import { Download, FileText, Code, FileCode, Printer } from "lucide-react";

interface ExportButtonsProps {
  data: any;
}

export default function ExportButtons({ data }: ExportButtonsProps) {
  
  const exportTxt = () => {
    const text = data.segments.map((s: any) => `${s.start} - ${s.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.metadata.title}.txt`;
    a.click();
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.metadata.title}.json`;
    a.click();
  };

  const exportSrt = () => {
    const srt = data.segments.map((s: any, i: number) => {
      const h = Math.floor(s.start / 3600).toString().padStart(2, '0');
      const m = Math.floor((s.start % 3600) / 60).toString().padStart(2, '0');
      const sc = Math.floor(s.start % 60).toString().padStart(2, '0');
      const ms = Math.floor((s.start % 1) * 1000).toString().padStart(3, '0');
      
      const eh = Math.floor((s.start + s.duration) / 3600).toString().padStart(2, '0');
      const em = Math.floor(((s.start + s.duration) % 3600) / 60).toString().padStart(2, '0');
      const esc = Math.floor((s.start + s.duration) % 60).toString().padStart(2, '0');
      const ems = Math.floor(((s.start + s.duration) % 1) * 1000).toString().padStart(3, '0');
      
      return `${i + 1}\n${h}:${m}:${sc},${ms} --> ${eh}:${em}:${esc},${ems}\n${s.text}\n`;
    }).join('\n');

    const blob = new Blob([srt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.metadata.title}.srt`;
    a.click();
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
      <button 
        onClick={exportTxt}
        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all group"
        title="Export as Text"
      >
        <FileText size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-white">TXT</span>
      </button>
      <button 
        onClick={exportJson}
        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all group"
        title="Export as JSON"
      >
        <Code size={18} className="text-green-400 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-white">JSON</span>
      </button>
      <button 
        onClick={exportSrt}
        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all group"
        title="Export as SRT"
      >
        <FileCode size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-white">SRT</span>
      </button>
    </div>
  );
}
