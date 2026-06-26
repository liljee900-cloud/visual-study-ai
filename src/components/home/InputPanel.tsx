"use client";

import { useState } from "react";
import YouTubeInput from "./YouTubeInput";
import TranscriptInput from "./TranscriptInput";
import VideoUpload from "./VideoUpload";
import PdfInput from "./PdfInput";
import URLInput from "./URLInput";
import TopicInput from "./TopicInput";

type Mode = "youtube" | "upload" | "pdf" | "url" | "transcript" | "topic";

const MODES: { id: Mode; icon: string; label: string; sublabel: string }[] = [
  { id: "youtube",    icon: "▶️",  label: "YouTube",    sublabel: "Paste any YouTube link" },
  { id: "upload",     icon: "🎬",  label: "Video File", sublabel: "MP4, MOV, MKV, WEBM" },
  { id: "pdf",        icon: "📄",  label: "PDF",        sublabel: "Tutorial or docs" },
  { id: "url",        icon: "🌐",  label: "Website",    sublabel: "Any tutorial page" },
  { id: "topic",      icon: "✨",  label: "Topic AI",   sublabel: "Ask anything" },
  { id: "transcript", icon: "📝",  label: "Transcript", sublabel: "Paste raw text" },
];

export default function InputPanel() {
  const [mode, setMode] = useState<Mode>("youtube");

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode selector — 6 modes in 2 rows on mobile, 1 row on sm+ */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-5">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`relative flex flex-col items-center gap-1 px-2 py-3 rounded-xl border text-center transition-all ${
              mode === m.id
                ? "border-yellow-400/40 bg-yellow-400/8 shadow-[0_0_16px_rgba(250,204,21,0.06)]"
                : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"
            }`}
          >
            {mode === m.id && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400" />
            )}
            <span className="text-lg">{m.icon}</span>
            <span className={`text-[10px] font-bold leading-tight ${mode === m.id ? "text-yellow-400" : "text-white/60"}`}>
              {m.label}
            </span>
            <span className="text-[9px] text-white/20 leading-tight hidden sm:block">{m.sublabel}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-[10px] text-white/20 uppercase tracking-widest">
          {MODES.find(m => m.id === mode)?.label}
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Active panel */}
      <div key={mode}>
        {mode === "youtube"    && <YouTubeInput />}
        {mode === "upload"     && <VideoUpload />}
        {mode === "pdf"        && <PdfInput />}
        {mode === "url"        && <URLInput />}
        {mode === "topic"      && <TopicInput />}
        {mode === "transcript" && <TranscriptInput />}
      </div>

      <p className="text-center text-xs text-white/20 mt-5">
        Powered by Claude AI · No login required · Results saved locally
      </p>
    </div>
  );
}
