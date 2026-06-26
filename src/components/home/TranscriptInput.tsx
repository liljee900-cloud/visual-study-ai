"use client";

import { useState } from "react";
import { useGeneratePack } from "@/lib/hooks/useGeneratePack";

export default function TranscriptInput() {
  const [transcript, setTranscript] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const { status, statusMsg, error, generate, reset } = useGeneratePack();

  const loading = status === "generating";
  const charCount = transcript.length;
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const isReady = transcript.trim().length >= 100;

  async function handleGenerate() {
    if (!isReady) return;
    await generate({
      videoUrl: sourceUrl || "local://manual-transcript",
      transcript,
      videoTitle,
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={videoTitle}
          onChange={(e) => { setVideoTitle(e.target.value); reset(); }}
          placeholder="Title or topic (optional)"
          className="bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
        />
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => { setSourceUrl(e.target.value); reset(); }}
          placeholder="Source URL (optional)"
          className="bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
        />
      </div>

      <div className="relative">
        <textarea
          value={transcript}
          onChange={(e) => { setTranscript(e.target.value); reset(); }}
          placeholder="Paste your transcript here…&#10;&#10;You can get transcripts from:&#10;• YouTube → ⋯ → Show transcript&#10;• yt-dlp --write-auto-sub&#10;• Any text transcript or lecture notes"
          rows={12}
          className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-2xl px-5 py-4 text-sm text-white/80 placeholder-white/20 outline-none resize-none transition-colors font-mono leading-relaxed"
        />
        {/* Word/char count */}
        <div className="absolute bottom-3 right-4 flex items-center gap-3 text-[10px] text-white/20 pointer-events-none">
          {wordCount > 0 && (
            <>
              <span>{wordCount.toLocaleString()} words</span>
              <span>{charCount.toLocaleString()} chars</span>
            </>
          )}
        </div>
      </div>

      {/* Readiness hint */}
      {transcript.length > 0 && transcript.length < 100 && (
        <p className="text-xs text-yellow-400/60 flex items-center gap-1.5">
          <span>⚠</span> Transcript too short — paste at least a few paragraphs for good results.
        </p>
      )}

      {error && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
          <span className="flex-shrink-0">⚠️</span> {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !isReady}
        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            {statusMsg}
          </span>
        ) : (
          `✨ Generate Study Pack${isReady ? "" : " (paste transcript first)"}`
        )}
      </button>
    </div>
  );
}
