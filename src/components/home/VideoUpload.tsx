"use client";

import { useState, useRef, useCallback } from "react";
import { useGeneratePack } from "@/lib/hooks/useGeneratePack";
import { useTranscriptionJob } from "@/lib/hooks/useTranscriptionJob";
import GeneratingGuide from "./GeneratingGuide";
import TranscriptCenter from "@/components/transcript/TranscriptCenter";

const ACCEPTED = ".mp4,.mov,.mkv,.webm,.avi,.m4a,.mp3,.wav,.ogg,.flac";
const MAX_MB = 500; // AssemblyAI supports up to 5 GB; Vercel Hobby body limit is ~4.5 MB

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ExtBadge({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const colors: Record<string, string> = { mp4: "text-blue-400", mov: "text-purple-400", mkv: "text-emerald-400", webm: "text-orange-400", mp3: "text-pink-400", wav: "text-cyan-400" };
  return <span className={`text-2xl font-black tracking-tighter ${colors[ext] ?? "text-white/40"}`}>{ext.toUpperCase()}</span>;
}

export default function VideoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState("");

  const { status, statusMsg, error: genError, generate, reset: resetGen, guideMeta, streamedSteps, progress } = useGeneratePack();
  const { status: txStatus, statusMsg: txMsg, transcript: txResult, error: txError, startJob, reset: resetJob } = useTranscriptionJob("audio-transcription");

  const generating = status === "generating" || status === "streaming";
  const transcribing = txStatus === "uploading" || txStatus === "queued" || txStatus === "processing";

  function validateFile(f: File): string | null {
    if (f.size > MAX_MB * 1024 * 1024) return `File too large (${formatBytes(f.size)}). Max is ${MAX_MB} MB.`;
    return null;
  }

  function pickFile(f: File) {
    const err = validateFile(f);
    if (err) { setFileError(err); return; }
    setFileError("");
    setFile(f);
    resetJob();
    resetGen();
    if (!videoTitle) setVideoTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoTitle]);

  async function handleTranscribe() {
    if (!file) return;
    await startJob(file, videoTitle || file.name);
  }

  async function handleUseForGuide(text: string) {
    await generate({ videoUrl: `local://${file?.name ?? "upload"}`, transcript: text, videoTitle, inputType: "tutorial" });
  }

  function reset() {
    setFile(null);
    setVideoTitle("");
    setFileError("");
    resetJob();
    resetGen();
  }

  // ── Stage label for progress pill ────────────────────────────────────────
  const txLabel =
    txStatus === "uploading"   ? "Uploading to transcription service…" :
    txStatus === "queued"      ? "Job queued — AssemblyAI is processing…" :
    txStatus === "processing"  ? "Transcribing audio…" :
    txStatus === "completed"   ? "Transcript ready ✓" :
    txStatus === "error"       ? txError :
    null;

  const txColor =
    txStatus === "completed"   ? "border-emerald-500/25 bg-emerald-500/6 text-emerald-400" :
    txStatus === "error"       ? "border-red-500/20 bg-red-500/6 text-red-400" :
                                 "border-purple-500/20 bg-purple-500/6 text-purple-400";

  return (
    <>
      {generating && (
        <GeneratingGuide meta={guideMeta} steps={streamedSteps} progress={progress} statusMsg={statusMsg} onCancel={resetGen} />
      )}

      <div className="space-y-4">
        {/* Drop zone */}
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl transition-all ${isDragOver ? "border-yellow-400/60 bg-yellow-400/5" : "border-white/10 hover:border-white/20"}`}
          >
            <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all ${isDragOver ? "bg-yellow-400/15" : "bg-white/4"}`}>
                {isDragOver ? "📥" : "🎬"}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{isDragOver ? "Drop to upload" : "Drag & drop video or audio"}</p>
                <p className="text-white/35 text-xs mt-1">MP4, MOV, MKV, WEBM, MP3, WAV, M4A — up to {MAX_MB} MB</p>
              </div>
              <p className="text-[10px] text-white/20">Transcribed with AssemblyAI · Timestamps included · High accuracy</p>
            </div>
            <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
          </div>
        ) : (
          /* File card */
          <div className="bg-[#161b22] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center flex-shrink-0">
              <ExtBadge name={file.name} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{file.name}</p>
              <p className="text-xs text-white/35 mt-0.5">{formatBytes(file.size)}</p>
            </div>
            {!transcribing && !generating && (
              <button onClick={reset} className="text-white/20 hover:text-white/60 text-lg flex-shrink-0">✕</button>
            )}
          </div>
        )}

        {/* Title */}
        {file && !transcribing && !txResult && (
          <input type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Title (optional — auto-detected)" className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors" />
        )}

        {/* Status pill */}
        {txLabel && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${txColor}`}>
            {transcribing && <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin flex-shrink-0" />}
            {txLabel}
            {(txStatus === "queued" || txStatus === "processing") && <span className="text-current/40 ml-auto">AssemblyAI</span>}
          </div>
        )}

        {/* Transcript center */}
        {txResult && !generating && (
          <TranscriptCenter
            data={txResult}
            onEdit={(text) => { /* transcript is immutable from hook — user edits in TranscriptCenter */ void text; }}
            onRegenerate={() => { resetJob(); }}
            onUseForGuide={handleUseForGuide}
            generating={generating}
          />
        )}

        {/* Errors */}
        {(fileError || genError) && (
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <p>{fileError || genError}</p>
              <button onClick={reset} className="text-xs text-red-300/50 hover:text-red-300 mt-1 underline">Start over</button>
            </div>
          </div>
        )}

        {/* Transcribe button */}
        {file && !txResult && txStatus !== "error" && (
          <button onClick={handleTranscribe} disabled={transcribing || generating}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/25 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]">
            {transcribing ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {txMsg || "Transcribing…"}
              </span>
            ) : "🎙️ Transcribe & Generate Guide"}
          </button>
        )}
      </div>
    </>
  );
}
