"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGeneratePack } from "@/lib/hooks/useGeneratePack";
import { useTranscriptionJob } from "@/lib/hooks/useTranscriptionJob";
import GeneratingGuide from "./GeneratingGuide";
import TranscriptCenter from "@/components/transcript/TranscriptCenter";
import type { TranscriptData } from "@/components/transcript/TranscriptCenter";

type Phase = "idle" | "checking" | "fetching" | "found" | "unavailable" | "error";
type Mode  = "youtube" | "upload" | "pdf" | "url" | "transcript" | "topic";

export default function YouTubeInput({ onSwitchMode }: { onSwitchMode?: (m: Mode) => void }) {
  const [url, setUrl]                 = useState("");
  const [videoTitle, setVideoTitle]   = useState("");
  const [phase, setPhase]             = useState<Phase>("idle");
  const [phaseMsg, setPhaseMsg]       = useState("");
  const [transcript, setTranscript]   = useState<TranscriptData | null>(null);
  const [showManual, setShowManual]   = useState(false);
  const [manualText, setManualText]   = useState("");
  const [isDragOver, setIsDragOver]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  const { status, statusMsg, error: genError, generate, reset: resetGen, guideMeta, streamedSteps, progress } = useGeneratePack();
  const { status: txStatus, statusMsg: txMsg, transcript: audioTx, error: txErr, startJob, reset: resetTx } = useTranscriptionJob("audio-transcription");

  const generating   = status === "generating" || status === "streaming";
  const transcribing = ["uploading","queued","processing"].includes(txStatus);

  // Merge caption transcript or audio transcript into one display object
  const activeTranscript: TranscriptData | null = transcript ?? audioTx ?? null;

  // ── Auto-fetch captions 700 ms after URL settles ──────────────────────
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const trimmed = url.trim();
    const isYT = /youtu\.?be/.test(trimmed) || trimmed.includes("youtube.com");
    if (!trimmed || !isYT) {
      setPhase("idle");
      setTranscript(null);
      setShowManual(false);
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
          setTranscript({
            text: data.transcript,
            source: data.isAsr ? "youtube-asr" : "youtube-captions",
          });
          setPhase("found");
          setPhaseMsg(data.isAsr ? "Auto-generated captions found" : "Captions found");
        } else {
          setPhase(data.unavailable ? "unavailable" : "error");
          setPhaseMsg(data.error ?? "Could not fetch transcript.");
        }
      } catch {
        setPhase("error");
        setPhaseMsg("Network error — check your connection.");
      }
    }, 700);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  function handleUrlChange(val: string) {
    setUrl(val);
    setTranscript(null);
    setShowManual(false);
    setManualText("");
    resetGen();
    resetTx();
  }

  async function handleGenerate(text: string) {
    await generate({ videoUrl: url || "audio://upload", transcript: text, videoTitle, inputType: "tutorial" });
  }

  function handlePickAudio(file: File) {
    startJob(file, videoTitle || url);
  }

  const onAudioDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handlePickAudio(f);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoTitle, url]);

  // ── Status pill ───────────────────────────────────────────────────────
  const statusPillCfg =
    phase === "checking" || phase === "fetching"
      ? { cls: "border-white/10 bg-white/3 text-white/45", spin: true }
      : phase === "found"
      ? { cls: "border-emerald-500/25 bg-emerald-500/6 text-emerald-400", spin: false }
      : phase === "unavailable"
      ? { cls: "border-amber-500/20 bg-amber-500/5 text-amber-400", spin: false }
      : phase === "error"
      ? { cls: "border-red-500/20 bg-red-500/6 text-red-400", spin: false }
      : null;

  return (
    <>
      {generating && (
        <GeneratingGuide meta={guideMeta} steps={streamedSteps} progress={progress} statusMsg={statusMsg} onCancel={resetGen} />
      )}

      <div className="space-y-4">

        {/* ── URL input ──────────────────────────────────────────────── */}
        <div className="relative group">
          <div className="absolute inset-0 bg-yellow-400/5 rounded-2xl blur-xl group-focus-within:bg-yellow-400/10 transition-all pointer-events-none" />
          <div className="relative bg-[#161b22] border border-white/10 group-focus-within:border-yellow-400/40 rounded-2xl transition-all">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-lg flex-shrink-0">▶️</span>
              <input
                type="url"
                value={url}
                onChange={e => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=… — transcript auto-fetches"
                className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
              />
              {url && (
                <button onClick={() => { handleUrlChange(""); setPhase("idle"); }} className="text-white/20 hover:text-white/50 text-xs px-2">✕</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Caption status pill ─────────────────────────────────────── */}
        {statusPillCfg && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${statusPillCfg.cls}`}>
            {statusPillCfg.spin
              ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin flex-shrink-0" />
              : <span>{phase === "found" ? "✓" : "⚠"}</span>}
            {phaseMsg}
          </div>
        )}

        {/* ── Optional video title ────────────────────────────────────── */}
        {url && phase !== "idle" && (
          <input
            type="text" value={videoTitle} onChange={e => setVideoTitle(e.target.value)}
            placeholder="Video title (optional)"
            className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
          />
        )}

        {/* ── TRANSCRIPT CENTER (captions or audio transcript ready) ──── */}
        {activeTranscript && (
          <TranscriptCenter
            data={activeTranscript}
            onEdit={text => setTranscript(prev => prev ? { ...prev, text } : null)}
            onRegenerate={phase !== "found" ? () => { resetTx(); } : undefined}
            onUseForGuide={handleGenerate}
            generating={generating}
          />
        )}

        {/* ── NO CAPTIONS: "Generate Transcript From Audio" ──────────── */}
        {(phase === "unavailable" || phase === "error") && !activeTranscript && (
          <div className="space-y-3">

            {/* Primary CTA */}
            {!transcribing && (
              <div className="border border-white/10 rounded-2xl overflow-hidden">
                {/* Audio drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={onAudioDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`cursor-pointer transition-all ${isDragOver ? "bg-purple-400/8" : "hover:bg-white/2"}`}
                >
                  <div className="flex flex-col items-center gap-3 py-8 px-6 text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${isDragOver ? "bg-purple-400/15" : "bg-white/5"}`}>
                      {isDragOver ? "📥" : "🎙️"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {isDragOver ? "Drop to transcribe" : "Generate Transcript From Audio"}
                      </p>
                      <p className="text-xs text-white/35 mt-1">
                        Drop the video or audio file here
                      </p>
                      <p className="text-[10px] text-white/20 mt-1">
                        MP4 · MOV · MP3 · WAV · M4A · WEBM · MKV
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-purple-400/60 border border-purple-400/20 bg-purple-400/6 px-2 py-1 rounded-full">
                        AssemblyAI · High accuracy · Timestamps
                      </span>
                    </div>
                  </div>
                  <input
                    ref={fileRef} type="file" className="hidden"
                    accept=".mp4,.mov,.mkv,.webm,.avi,.m4a,.mp3,.wav,.ogg,.flac"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handlePickAudio(f); }}
                  />
                </div>

                {/* Or click to browse */}
                <div className="border-t border-white/6 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-white/25">or click the area above to browse files</span>
                  {onSwitchMode && (
                    <button onClick={() => onSwitchMode("topic")} className="text-[10px] text-white/30 hover:text-yellow-400/70 transition-colors">
                      ✨ Use Topic AI instead
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Transcription in progress */}
            {transcribing && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-purple-500/20 bg-purple-500/6 text-purple-400 text-xs">
                <span className="w-3.5 h-3.5 rounded-full border border-current border-t-transparent animate-spin flex-shrink-0" />
                <span>{txMsg || "Transcribing audio…"}</span>
                <span className="ml-auto text-purple-400/40">AssemblyAI</span>
              </div>
            )}

            {txErr && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/6 text-red-400 text-xs">
                <span>⚠</span> {txErr}
              </div>
            )}
          </div>
        )}

        {/* ── MANUAL PASTE (collapsed by default, always available) ───── */}
        {phase !== "idle" && (
          <div>
            <button
              onClick={() => setShowManual(v => !v)}
              className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/45 transition-colors"
            >
              <span className={`w-3 h-3 rounded border flex items-center justify-center text-[8px] transition-colors ${showManual ? "border-yellow-400/40 bg-yellow-400/8 text-yellow-400" : "border-white/15"}`}>
                {showManual ? "✓" : ""}
              </span>
              Paste transcript manually (backup)
            </button>

            {showManual && (
              <div className="mt-2 space-y-2">
                <p className="text-[10px] text-white/30 leading-relaxed">
                  On YouTube: click <strong className="text-white/50">⋯ → Show transcript</strong>, copy all text, paste below.
                </p>
                <textarea
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  placeholder="Paste transcript here…"
                  rows={6}
                  className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 outline-none resize-none font-mono leading-relaxed"
                />
                {manualText.trim().length > 20 && (
                  <button
                    onClick={() => handleGenerate(manualText)}
                    disabled={generating}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 text-black font-bold py-3 rounded-2xl text-sm transition-all"
                  >
                    ✨ Generate Guide from Pasted Transcript
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {genError && (
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
            <span>⚠️</span> {genError}
          </div>
        )}

        {phase === "idle" && (
          <p className="text-[11px] text-white/20 text-center">
            Paste a YouTube URL — transcript fetches automatically
          </p>
        )}
      </div>
    </>
  );
}
