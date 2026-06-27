"use client";

import { useState, useEffect, useRef } from "react";
import { useGeneratePack } from "@/lib/hooks/useGeneratePack";
import GeneratingGuide from "./GeneratingGuide";

type TxPhase =
  | "idle"          // no URL yet
  | "checking"      // URL detected, debounce in progress
  | "fetching"      // API call in flight
  | "found"         // transcript ready, auto-starting generation
  | "unavailable"   // no captions on this video
  | "error";        // network / rate-limit error

type Mode = "youtube" | "upload" | "pdf" | "url" | "transcript" | "topic";

export default function YouTubeInput({ onSwitchMode }: { onSwitchMode?: (m: Mode) => void }) {
  const [url, setUrl]               = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [phase, setPhase]           = useState<TxPhase>("idle");
  const [phaseMsg, setPhaseMsg]     = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { status, statusMsg, error, generate, reset, guideMeta, streamedSteps, progress } =
    useGeneratePack();

  const generating = status === "generating" || status === "streaming";

  // ── Auto-fetch 700 ms after the URL stops changing ──────────────────────
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = url.trim();
    const isYT = /youtu\.?be/.test(trimmed) || trimmed.includes("youtube.com");

    if (!trimmed || !isYT) {
      setPhase("idle");
      setTranscript("");
      return;
    }

    setPhase("checking");
    setPhaseMsg("Checking video…");

    timerRef.current = setTimeout(async () => {
      setPhase("fetching");
      setPhaseMsg("Looking for transcript…");

      try {
        const res = await fetch("/api/transcript-youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: trimmed }),
        });
        const data = await res.json();

        if (data.success) {
          setTranscript(data.transcript);
          setPhase("found");
          setPhaseMsg(
            data.isAsr
              ? "Auto-generated transcript found — starting guide…"
              : "Transcript found — starting guide…"
          );
          // Auto-start guide generation immediately
          await generate({
            videoUrl: trimmed,
            transcript: data.transcript,
            videoTitle,
            inputType: "tutorial",
          });
        } else {
          setTranscript("");
          setPhase(data.unavailable ? "unavailable" : "error");
          setPhaseMsg(data.error ?? "Could not fetch transcript.");
          if (!data.unavailable) setShowManual(true);
        }
      } catch {
        setTranscript("");
        setPhase("error");
        setPhaseMsg("Network error — check your connection.");
        setShowManual(true);
      }
    }, 700);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  function handleUrlChange(val: string) {
    setUrl(val);
    setShowManual(false);
    reset();
  }

  // Manual generate (used when user pastes transcript themselves)
  async function handleManualGenerate() {
    if (!url.trim() || !transcript.trim()) return;
    await generate({ videoUrl: url, transcript, videoTitle, inputType: "tutorial" });
  }

  // ── Status bar ──────────────────────────────────────────────────────────
  function StatusBar() {
    if (phase === "idle") return null;

    const cfg: Record<TxPhase, { cls: string; icon: React.ReactNode }> = {
      idle:        { cls: "",                                                       icon: null },
      checking:    { cls: "border-white/10 bg-white/3 text-white/45",              icon: <Spinner /> },
      fetching:    { cls: "border-white/10 bg-white/3 text-white/45",              icon: <Spinner /> },
      found:       { cls: "border-emerald-500/25 bg-emerald-500/6 text-emerald-400", icon: "✓" },
      unavailable: { cls: "border-amber-500/20 bg-amber-500/5 text-amber-400",     icon: "⚠" },
      error:       { cls: "border-red-500/20 bg-red-500/6 text-red-400",           icon: "⚠" },
    };
    const { cls, icon } = cfg[phase];

    return (
      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs border transition-all ${cls}`}>
        <span className="flex-shrink-0">{icon}</span>
        {phaseMsg}
      </div>
    );
  }

  // ── Unavailable card with alternatives ──────────────────────────────────
  function UnavailableCard() {
    return (
      <div className="border border-amber-500/20 bg-amber-500/4 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-amber-400">No captions available for this video</p>
        <p className="text-[11px] text-white/35 leading-relaxed">
          This video has no captions or auto-generated transcript on YouTube.
          Choose an option below:
        </p>
        <div className="flex flex-col gap-2">
          {onSwitchMode && (
            <button
              onClick={() => onSwitchMode("topic")}
              className="w-full text-left px-3 py-2.5 rounded-lg bg-white/4 hover:bg-white/7 border border-white/8 hover:border-yellow-400/25 transition-all"
            >
              <p className="text-xs font-semibold text-white/80">✨ Generate from topic instead</p>
              <p className="text-[11px] text-white/30 mt-0.5">
                Describe what this video covers — AI builds the guide from scratch
              </p>
            </button>
          )}
          {onSwitchMode && (
            <button
              onClick={() => onSwitchMode("upload")}
              className="w-full text-left px-3 py-2.5 rounded-lg bg-white/4 hover:bg-white/7 border border-white/8 hover:border-yellow-400/25 transition-all"
            >
              <p className="text-xs font-semibold text-white/80">🎬 Upload the video file</p>
              <p className="text-[11px] text-white/30 mt-0.5">
                Download the video, upload it here — audio transcribed via Whisper
              </p>
            </button>
          )}
          <button
            onClick={() => setShowManual(true)}
            className="w-full text-left px-3 py-2.5 rounded-lg bg-white/4 hover:bg-white/7 border border-white/8 hover:border-yellow-400/25 transition-all"
          >
            <p className="text-xs font-semibold text-white/80">📝 Paste transcript manually</p>
            <p className="text-[11px] text-white/30 mt-0.5">
              On YouTube: click ⋯ → Show transcript, copy and paste below
            </p>
          </button>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {generating && (
        <GeneratingGuide
          meta={guideMeta}
          steps={streamedSteps}
          progress={progress}
          statusMsg={statusMsg}
          onCancel={reset}
        />
      )}

      <div className="space-y-4">
        {/* URL input */}
        <div className="relative group">
          <div className="absolute inset-0 bg-yellow-400/5 rounded-2xl blur-xl group-focus-within:bg-yellow-400/10 transition-all pointer-events-none" />
          <div className="relative bg-[#161b22] border border-white/10 group-focus-within:border-yellow-400/40 rounded-2xl transition-all">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-lg flex-shrink-0">▶️</span>
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=… — paste to auto-fetch"
                className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
              />
              {url && (
                <button
                  onClick={() => { handleUrlChange(""); setPhase("idle"); setShowManual(false); }}
                  className="text-white/20 hover:text-white/50 text-xs px-2"
                >✕</button>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <StatusBar />

        {/* Unavailable alternatives */}
        {phase === "unavailable" && !showManual && <UnavailableCard />}

        {/* Title (always visible when URL is set) */}
        {url && (
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Video title (optional)"
            className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
          />
        )}

        {/* Manual transcript toggle */}
        {phase !== "idle" && (
          <button
            onClick={() => setShowManual((v) => !v)}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white/55 transition-colors"
          >
            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] transition-colors ${showManual ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400" : "border-white/20"}`}>
              {showManual ? "✓" : ""}
            </span>
            Paste transcript manually
          </button>
        )}

        {/* Manual paste area */}
        {showManual && (
          <div className="space-y-2">
            <p className="text-[11px] text-white/35 px-1 leading-relaxed">
              On YouTube: click <strong className="text-white/55">⋯ → Show transcript</strong> under the video, then copy all text and paste below.
            </p>
            <textarea
              value={transcript}
              onChange={(e) => { setTranscript(e.target.value); reset(); }}
              placeholder="Paste the video transcript here…"
              rows={7}
              className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/25 outline-none resize-none transition-colors font-mono leading-relaxed"
            />
            {/* Manual generate button — only shown when user has pasted text */}
            {transcript.trim().length > 20 && (
              <button
                onClick={handleManualGenerate}
                disabled={generating}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-[0.98]"
              >
                ✨ Generate Guide from Transcript
              </button>
            )}
          </div>
        )}

        {/* API/generation error */}
        {error && (
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
            <span className="flex-shrink-0">⚠️</span> {error}
          </div>
        )}

        {/* Hint when idle */}
        {phase === "idle" && (
          <p className="text-[11px] text-white/20 text-center leading-relaxed">
            Paste a YouTube URL above — transcript fetches automatically
          </p>
        )}
      </div>
    </>
  );
}

function Spinner() {
  return (
    <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin flex-shrink-0" />
  );
}
