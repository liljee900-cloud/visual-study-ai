"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGeneratePack } from "@/lib/hooks/useGeneratePack";
import { useTranscriptionJob } from "@/lib/hooks/useTranscriptionJob";
import GeneratingGuide from "./GeneratingGuide";
import TranscriptCenter from "@/components/transcript/TranscriptCenter";
import type { TranscriptData } from "@/components/transcript/TranscriptCenter";

type TxPhase = "idle" | "checking" | "fetching" | "found" | "unavailable" | "error";
type Mode = "youtube" | "upload" | "pdf" | "url" | "transcript" | "topic";

export default function YouTubeInput({ onSwitchMode }: { onSwitchMode?: (m: Mode) => void }) {
  const [url, setUrl]                   = useState("");
  const [videoTitle, setVideoTitle]     = useState("");
  const [phase, setPhase]               = useState<TxPhase>("idle");
  const [phaseMsg, setPhaseMsg]         = useState("");
  const [captionData, setCaptionData]   = useState<TranscriptData | null>(null);
  const [showManual, setShowManual]     = useState(false);
  const [manualText, setManualText]     = useState("");
  const [isDragOver, setIsDragOver]     = useState(false);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  const { status, statusMsg, error: genError, generate, reset: resetGen, guideMeta, streamedSteps, progress } = useGeneratePack();
  const { status: txStatus, statusMsg: txMsg, transcript: txResult, error: txError, startJob, reset: resetJob } = useTranscriptionJob("audio-transcription");

  const generating = status === "generating" || status === "streaming";
  const transcribing = txStatus === "uploading" || txStatus === "queued" || txStatus === "processing";

  // ── Auto-fetch captions 700ms after URL changes ─────────────────────────
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const trimmed = url.trim();
    if (!trimmed || (!/youtube\.com/.test(trimmed) && !/youtu\.be/.test(trimmed))) {
      setPhase("idle");
      setCaptionData(null);
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
          const td: TranscriptData = {
            text: data.transcript,
            source: data.isAsr ? "youtube-asr" : "youtube-captions",
          };
          setCaptionData(td);
          setPhase("found");
          setPhaseMsg(data.isAsr ? "Auto-generated captions found" : "Transcript found");
          // Auto-start guide
          await generate({ videoUrl: trimmed, transcript: data.transcript, videoTitle, inputType: "tutorial" });
        } else {
          setCaptionData(null);
          setPhase(data.unavailable ? "unavailable" : "error");
          setPhaseMsg(data.error ?? "Could not fetch transcript.");
        }
      } catch {
        setCaptionData(null);
        setPhase("error");
        setPhaseMsg("Network error — check your connection.");
      }
    }, 700);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  function handleUrlChange(val: string) {
    setUrl(val);
    setCaptionData(null);
    setShowManual(false);
    resetGen();
    resetJob();
  }

  // ── Audio file drop / pick for "transcribe from audio" ──────────────────
  function pickAudioFile(file: File) {
    const ok = /\.(mp4|mov|mkv|webm|avi|m4a|mp3|wav|ogg|flac)$/i.test(file.name)
      || file.type.startsWith("video/") || file.type.startsWith("audio/");
    if (!ok) return;
    startJob(file, videoTitle || url);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) pickAudioFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoTitle, url]);

  // When audio transcription completes, show transcript center (no auto-generate — user reviews first)
  const activeTranscript: TranscriptData | null = captionData ?? txResult ?? null;

  async function handleUseForGuide(text: string) {
    await generate({ videoUrl: url || "audio://upload", transcript: text, videoTitle, inputType: "tutorial" });
  }

  // ── Status pill ─────────────────────────────────────────────────────────
  function StatusPill() {
    if (phase === "idle") return null;
    const busy = phase === "checking" || phase === "fetching";
    const cls = busy ? "border-white/10 bg-white/3 text-white/40"
      : phase === "found" ? "border-emerald-500/25 bg-emerald-500/6 text-emerald-400"
      : phase === "unavailable" ? "border-amber-500/20 bg-amber-500/5 text-amber-400"
      : "border-red-500/20 bg-red-500/6 text-red-400";
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${cls}`}>
        {busy && <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin flex-shrink-0" />}
        {!busy && <span className="flex-shrink-0">{phase === "found" ? "✓" : "⚠"}</span>}
        {phaseMsg}
      </div>
    );
  }

  // ── Transcription job status pill ───────────────────────────────────────
  function TranscribePill() {
    if (txStatus === "idle" || txStatus === "completed") return null;
    if (txStatus === "error") {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border border-red-500/20 bg-red-500/6 text-red-400">
          <span>⚠</span> {txError}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border border-purple-500/20 bg-purple-500/6 text-purple-400">
        <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin flex-shrink-0" />
        {txMsg || "Transcribing…"}
        <span className="text-purple-400/50 ml-auto">AssemblyAI</span>
      </div>
    );
  }

  return (
    <>
      {generating && (
        <GeneratingGuide meta={guideMeta} steps={streamedSteps} progress={progress} statusMsg={statusMsg} onCancel={resetGen} />
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
                placeholder="https://youtube.com/watch?v=… — transcript auto-fetches"
                className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
              />
              {url && (
                <button onClick={() => { handleUrlChange(""); setPhase("idle"); }} className="text-white/20 hover:text-white/50 text-xs px-2">✕</button>
              )}
            </div>
          </div>
        </div>

        <StatusPill />
        <TranscribePill />

        {/* Transcript center — shown when captions found or audio transcribed */}
        {activeTranscript && !generating && (
          <TranscriptCenter
            data={activeTranscript}
            onEdit={(text) => {
              if (captionData) setCaptionData({ ...captionData, text });
            }}
            onRegenerate={phase === "found" ? undefined : () => { resetJob(); }}
            onUseForGuide={handleUseForGuide}
            generating={generating}
          />
        )}

        {/* "No captions" card */}
        {phase === "unavailable" && !txResult && (
          <div className="border border-amber-500/20 bg-amber-500/4 rounded-2xl overflow-hidden">
            <div className="px-4 pt-4 pb-3">
              <p className="text-xs font-semibold text-amber-400 mb-1">No captions available</p>
              <p className="text-[11px] text-white/35 leading-relaxed">
                This video has no YouTube captions. You can transcribe it from audio by dropping the video or audio file below — no other website needed.
              </p>
            </div>

            {/* Audio drop zone */}
            {!transcribing && !txResult && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`mx-4 mb-4 cursor-pointer border-2 border-dashed rounded-xl flex flex-col items-center gap-2 py-6 transition-all ${
                  isDragOver ? "border-purple-400/60 bg-purple-400/5" : "border-white/10 hover:border-white/20"
                }`}
              >
                <span className="text-2xl">{isDragOver ? "📥" : "🎙️"}</span>
                <p className="text-xs text-white/60 font-semibold">
                  {isDragOver ? "Drop to transcribe" : "Transcribe from Audio"}
                </p>
                <p className="text-[10px] text-white/30 text-center px-4">
                  Drop the video or audio file here — MP4, MOV, MP3, WAV, M4A
                  <br />Transcribed with AssemblyAI · High accuracy · Timestamps included
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".mp4,.mov,.mkv,.webm,.avi,.m4a,.mp3,.wav,.ogg,.flac"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) pickAudioFile(f); }}
                />
              </div>
            )}

            {/* Alternatives */}
            <div className="border-t border-white/6 px-4 py-3 flex flex-wrap gap-2">
              {onSwitchMode && (
                <button onClick={() => onSwitchMode("topic")} className="text-[10px] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all">
                  ✨ Use Topic AI
                </button>
              )}
              <button onClick={() => setShowManual((v) => !v)} className="text-[10px] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all">
                📝 Paste manually
              </button>
            </div>
          </div>
        )}

        {/* Title */}
        {url && phase !== "idle" && (
          <input type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Video title (optional)" className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors" />
        )}

        {/* Manual paste toggle */}
        {phase !== "idle" && (
          <button onClick={() => setShowManual((v) => !v)} className="flex items-center gap-2 text-xs text-white/30 hover:text-white/55 transition-colors">
            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] transition-colors ${showManual ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400" : "border-white/20"}`}>{showManual ? "✓" : ""}</span>
            Paste transcript manually
          </button>
        )}

        {showManual && (
          <div className="space-y-2">
            <p className="text-[11px] text-white/35 px-1 leading-relaxed">
              On YouTube: click <strong className="text-white/55">⋯ → Show transcript</strong>, copy all text, paste below.
            </p>
            <textarea value={manualText} onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste transcript here…" rows={7}
              className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/25 outline-none resize-none font-mono leading-relaxed" />
            {manualText.trim().length > 20 && (
              <button onClick={() => handleUseForGuide(manualText)} disabled={generating}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 text-black font-bold py-3.5 rounded-2xl text-sm transition-all">
                ✨ Generate Guide from Transcript
              </button>
            )}
          </div>
        )}

        {genError && (
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
            <span>⚠️</span> {genError}
          </div>
        )}

        {phase === "idle" && (
          <p className="text-[11px] text-white/20 text-center">Paste a YouTube URL — transcript fetches automatically</p>
        )}
      </div>
    </>
  );
}
