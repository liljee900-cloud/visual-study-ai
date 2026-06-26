"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GenerateResponse, GenerateError } from "@/lib/types/api";
import { savePack } from "@/lib/storage";

export default function URLInput() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");

  const loadingMessages = [
    "Reading transcript...",
    "Identifying key concepts...",
    "Structuring concept cards...",
    "Writing step-by-step notes...",
    "Building cheat sheet...",
    "Generating quiz questions...",
    "Assembling study pack...",
  ];

  async function handleGenerate() {
    if (!url.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }
    setError("");
    setLoading(true);

    let msgIdx = 0;
    setLoadingMsg(loadingMessages[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[msgIdx]);
    }, 2500);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: url, transcript, videoTitle }),
      });
      const data: GenerateResponse | GenerateError = await res.json();

      if (!data.success) {
        setError((data as GenerateError).error);
        return;
      }

      const pack = (data as GenerateResponse).studyPack;
      savePack(pack);
      router.push(`/study/${pack.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* URL field */}
      <div className="relative group">
        <div className="absolute inset-0 bg-yellow-400/5 rounded-2xl blur-xl group-focus-within:bg-yellow-400/10 transition-all" />
        <div className="relative bg-[#161b22] border border-white/10 group-focus-within:border-yellow-400/40 rounded-2xl p-1 transition-all">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-xl flex-shrink-0">▶️</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Paste a YouTube URL — e.g. https://youtube.com/watch?v=..."
              className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Optional title */}
      <input
        type="text"
        value={videoTitle}
        onChange={(e) => setVideoTitle(e.target.value)}
        placeholder="Video title (optional — helps AI generate better content)"
        className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors"
      />

      {/* Transcript toggle */}
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <span className="w-4 h-4 rounded border border-white/20 flex items-center justify-center text-xs">
          {showTranscript ? "✓" : ""}
        </span>
        Paste transcript manually (required if auto-fetch fails)
      </button>

      {showTranscript && (
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste the video transcript here... You can get it from YouTube's transcript panel or tools like yt-dlp."
          rows={8}
          className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/30 outline-none resize-none transition-colors font-mono"
        />
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full relative overflow-hidden bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/40 text-black font-bold py-4 rounded-2xl text-base transition-all active:scale-[0.98] disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            {loadingMsg}
          </span>
        ) : (
          "✨ Generate Study Pack"
        )}
      </button>

      <p className="text-center text-xs text-white/25">
        Powered by Claude AI · No login required · Results saved locally
      </p>
    </div>
  );
}
