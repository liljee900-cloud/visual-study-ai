"use client";

import { useState } from "react";
import YouTubeInput from "./YouTubeInput";
import TranscriptInput from "./TranscriptInput";
import VideoUpload from "./VideoUpload";

type Mode = "youtube" | "transcript" | "upload";

const MODES: { id: Mode; icon: string; label: string; sublabel: string }[] = [
  {
    id: "youtube",
    icon: "▶️",
    label: "YouTube URL",
    sublabel: "Paste any YouTube link",
  },
  {
    id: "transcript",
    icon: "📄",
    label: "Paste Transcript",
    sublabel: "Already have the text",
  },
  {
    id: "upload",
    icon: "🎬",
    label: "Upload Video",
    sublabel: "MP4, MOV, MKV, WEBM",
  },
];

export default function InputPanel() {
  const [mode, setMode] = useState<Mode>("youtube");

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`relative flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-2xl border text-center transition-all
              ${mode === m.id
                ? "border-yellow-400/40 bg-yellow-400/8 shadow-[0_0_20px_rgba(250,204,21,0.08)]"
                : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"
              }`}
          >
            {mode === m.id && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-yellow-400" />
            )}
            <span className="text-xl">{m.icon}</span>
            <span className={`text-xs font-bold leading-tight ${mode === m.id ? "text-yellow-400" : "text-white/70"}`}>
              {m.label}
            </span>
            <span className="text-[10px] text-white/25 leading-tight hidden sm:block">
              {m.sublabel}
            </span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-[10px] text-white/20 uppercase tracking-widest">
          {mode === "youtube" && "YouTube URL"}
          {mode === "transcript" && "Paste Transcript"}
          {mode === "upload" && "Upload Video File"}
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Active panel */}
      <div className="animate-fade-in" key={mode}>
        {mode === "youtube" && <YouTubeInput />}
        {mode === "transcript" && <TranscriptInput />}
        {mode === "upload" && <VideoUpload />}
      </div>

      <p className="text-center text-xs text-white/20 mt-5">
        Powered by Claude AI · No login required · Results saved locally
      </p>
    </div>
  );
}
