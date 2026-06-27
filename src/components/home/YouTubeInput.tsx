"use client";

import { useState, useEffect, useRef } from "react";
import { useGeneratePack } from "@/lib/hooks/useGeneratePack";
import GeneratingGuide from "./GeneratingGuide";

type TranscriptStatus = "idle" | "fetching" | "found" | "unavailable" | "error";
type Mode = "youtube" | "upload" | "pdf" | "url" | "transcript" | "topic";

export default function YouTubeInput({ onSwitchMode }: { onSwitchMode?: (m: Mode) => void }) {
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [txStatus, setTxStatus] = useState<TranscriptStatus>("idle");
  const [txError, setTxError] = useState("");
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { status, statusMsg, error, generate, reset, guideMeta, streamedSteps, progress } = useGeneratePack();
  const loading = status === "generating" || status === "streaming";

  // Auto-fetch transcript 800 ms after the URL stops changing
  useEffect(() => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    const trimmed = url.trim();
    if (!trimmed || !trimmed.includes("youtube") && !trimmed.includes("youtu.be")) {
      setTxStatus("idle");
      setTranscript("");
      return;
    }
    setTxStatus("fetching");
    fetchTimerRef.current = setTimeout(() => fetchTranscript(trimmed), 800);
    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  async function fetchTranscript(videoUrl: string) {
    try {
      const res = await fetch("/api/transcript-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setTranscript(data.transcript);
        setTxStatus("found");
        setTxError("");
      } else {
        setTranscript("");
        setTxStatus(data.unavailable ? "unavailable" : "error");
        setTxError(data.error ?? "Could not fetch transcript.");
        setShowManual(true);
      }
    } catch {
      setTranscript("");
      setTxStatus("error");
      setTxError("Network error while fetching transcript.");
      setShowManual(true);
    }
  }

  async function handleGenerate() {
    if (!url.trim()) return;
    await generate({ videoUrl: url, transcript, videoTitle, inputType: "tutorial" });
  }

  function handleUrlChange(val: string) {
    setUrl(val);
    reset();
    setShowManual(false);
    setTxError("");
  }

  const canGenerate = url.trim() && (txStatus === "found" || showManual) && !loading;

  return (
    <>
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
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canGenerate && handleGenerate()}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
              />
              {url && (
                <button
                  onClick={() => { handleUrlChange(""); setTxStatus("idle"); }}
                  className="text-white/20 hover:text-white/50 text-xs px-2"
                >✕</button>
              )}
            </div>
          </div>
        </div>

        {/* Transcript status */}
        {txStatus === "fetching" && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs border border-white/10 bg-white/3 text-white/40">
            <span className="w-3 h-3 rounded-full border border-white/30 border-t-white/70 animate-spin flex-shrink-0" />
            Finding transcript…
          </div>
        )}
        {txStatus === "found" && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
            <span className="flex-shrink-0">✓</span>Transcript found — ready to generate
          </div>
        )}
        {txStatus === "error" && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs border border-red-500/20 bg-red-500/5 text-red-400">
            <span className="flex-shrink-0">⚠️</span>{txError}
          </div>
        )}
        {txStatus === "unavailable" && (
          <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 space-y-3">
            <p className="text-xs text-amber-400 font-medium">
              This video has no captions available.
            </p>
            <p className="text-xs text-white/40 leading-relaxed">
              Choose an alternative:
            </p>
            <div className="flex flex-col gap-2">
              {onSwitchMode && (
                <button
                  onClick={() => onSwitchMode("topic")}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-white/4 hover:bg-white/7 border border-white/8 hover:border-yellow-400/25 transition-all"
                >
                  <p className="text-xs font-semibold text-white/80">✨ Generate from topic</p>
                  <p className="text-[11px] text-white/35 mt-0.5">Describe what this video covers — the AI builds a guide from scratch</p>
                </button>
              )}
              {onSwitchMode && (
                <button
                  onClick={() => onSwitchMode("upload")}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-white/4 hover:bg-white/7 border border-white/8 hover:border-yellow-400/25 transition-all"
                >
                  <p className="text-xs font-semibold text-white/80">🎬 Upload the video file</p>
                  <p className="text-[11px] text-white/35 mt-0.5">Download the video, then upload it here — audio is transcribed with Whisper</p>
                </button>
              )}
              <button
                onClick={() => setShowManual(true)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-white/4 hover:bg-white/7 border border-white/8 hover:border-yellow-400/25 transition-all"
              >
                <p className="text-xs font-semibold text-white/80">📝 Paste transcript manually</p>
                <p className="text-[11px] text-white/35 mt-0.5">On YouTube: click ⋯ → Show transcript, copy the text and paste below</p>
              </button>
            </div>
          </div>
        )}

        <input
          type="text"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          placeholder="Video title (optional — improves AI output)"
          className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
        />

        {/* Manual transcript toggle */}
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-2 text-xs text-white/35 hover:text-white/60 transition-colors"
        >
          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] transition-colors ${showManual ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400" : "border-white/20"}`}>
            {showManual ? "✓" : ""}
          </span>
          Paste transcript manually
        </button>

        {showManual && (
          <div className="space-y-2">
            {(txStatus === "unavailable" || txStatus === "error") && (
              <p className="text-xs text-white/40 px-1 leading-relaxed">
                On YouTube, click <strong className="text-white/60">⋯ → Show transcript</strong> under the video, then copy and paste the text below.
              </p>
            )}
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the video transcript here…"
              rows={7}
              className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/25 outline-none resize-none transition-colors font-mono leading-relaxed"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
            <span className="flex-shrink-0">⚠️</span> {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !url.trim() || txStatus === "fetching"}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
        >
          {txStatus === "fetching" ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Finding transcript…
            </span>
          ) : loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              {statusMsg}
            </span>
          ) : (
            "✨ Generate Step-by-Step Guide"
          )}
        </button>
      </div>
    </>
  );
}
