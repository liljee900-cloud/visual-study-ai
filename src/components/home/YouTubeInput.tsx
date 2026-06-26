"use client";

import { useState } from "react";
import { useGeneratePack } from "@/lib/hooks/useGeneratePack";
import GeneratingGuide from "./GeneratingGuide";

export default function YouTubeInput() {
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const { status, statusMsg, error, generate, reset, guideMeta, streamedSteps, progress } = useGeneratePack();

  const loading = status === "generating" || status === "streaming";

  async function handleGenerate() {
    if (!url.trim()) return;
    await generate({ videoUrl: url, transcript, videoTitle, inputType: "tutorial" });
  }

  return (
    <>
      {/* Live streaming overlay */}
      {loading && (
        <GeneratingGuide
          meta={guideMeta}
          steps={streamedSteps}
          progress={progress}
          statusMsg={statusMsg}
          onCancel={reset}
        />
      )}

      <div className="space-y-4">
        {/* URL field */}
        <div className="relative group">
          <div className="absolute inset-0 bg-yellow-400/5 rounded-2xl blur-xl group-focus-within:bg-yellow-400/10 transition-all pointer-events-none" />
          <div className="relative bg-[#161b22] border border-white/10 group-focus-within:border-yellow-400/40 rounded-2xl transition-all">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-lg flex-shrink-0">▶️</span>
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); reset(); }}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
              />
              {url && (
                <button onClick={() => { setUrl(""); reset(); }} className="text-white/20 hover:text-white/50 text-xs px-2">✕</button>
              )}
            </div>
          </div>
        </div>

        <input
          type="text"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          placeholder="Video title (optional — improves AI output)"
          className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
        />

        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="flex items-center gap-2 text-xs text-white/35 hover:text-white/60 transition-colors"
        >
          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] transition-colors ${showTranscript ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400" : "border-white/20"}`}>
            {showTranscript ? "✓" : ""}
          </span>
          Paste transcript manually (use if auto-fetch fails)
        </button>

        {showTranscript && (
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste the video transcript here..."
            rows={7}
            className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/25 outline-none resize-none transition-colors font-mono leading-relaxed"
          />
        )}

        {error && (
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
            <span className="flex-shrink-0">⚠️</span> {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !url.trim()}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
        >
          ✨ Generate Step-by-Step Guide
        </button>
      </div>
    </>
  );
}
