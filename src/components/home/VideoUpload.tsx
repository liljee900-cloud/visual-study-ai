"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { savePack } from "@/lib/storage";
import type { GenerateResponse, GenerateError } from "@/lib/types/api";

// ── Processing pipeline stages ──────────────────────────────────────────────

type Stage =
  | "idle"
  | "uploading"
  | "extracting-audio"
  | "transcribing"
  | "generating"
  | "done"
  | "error";

interface StageConfig {
  label: string;
  detail: string;
  icon: string;
  color: string;
}

const STAGES: Record<Exclude<Stage, "idle" | "done" | "error">, StageConfig> = {
  uploading: {
    label: "Uploading",
    detail: "Sending video to server...",
    icon: "⬆️",
    color: "text-blue-400",
  },
  "extracting-audio": {
    label: "Extracting Audio",
    detail: "Stripping video track with FFmpeg...",
    icon: "🎵",
    color: "text-purple-400",
  },
  transcribing: {
    label: "Transcribing",
    detail: "Converting speech to text with Whisper...",
    icon: "🎙️",
    color: "text-emerald-400",
  },
  generating: {
    label: "Generating Notes",
    detail: "AI is building your visual study pack...",
    icon: "✨",
    color: "text-yellow-400",
  },
};

const STAGE_ORDER: Array<Exclude<Stage, "idle" | "done" | "error">> = [
  "uploading",
  "extracting-audio",
  "transcribing",
  "generating",
];

const ACCEPTED = ".mp4,.mov,.mkv,.webm,.avi";
const ACCEPTED_MIME = ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm", "video/avi"];
const MAX_MB = 500;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FileIcon({ ext }: { ext: string }) {
  const colors: Record<string, string> = {
    mp4: "text-blue-400",
    mov: "text-purple-400",
    mkv: "text-emerald-400",
    webm: "text-orange-400",
    avi: "text-red-400",
  };
  return (
    <div className={`text-2xl font-black tracking-tighter ${colors[ext] ?? "text-white/40"}`}>
      {ext.toUpperCase()}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function VideoUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const ext = file?.name.split(".").pop()?.toLowerCase() ?? "";

  // ── File validation ────────────────────────────────────────────────────
  function validateFile(f: File): string | null {
    const validExt = /\.(mp4|mov|mkv|webm|avi)$/i.test(f.name);
    const validMime = ACCEPTED_MIME.includes(f.type) || f.type.startsWith("video/");
    if (!validExt && !validMime) return `Unsupported format. Please upload MP4, MOV, MKV, or WEBM.`;
    if (f.size > MAX_MB * 1024 * 1024) return `File too large. Maximum size is ${MAX_MB} MB.`;
    return null;
  }

  function pickFile(f: File) {
    const err = validateFile(f);
    if (err) { setErrorMsg(err); return; }
    setErrorMsg("");
    setFile(f);
    setStage("idle");
    if (!videoTitle) setVideoTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  }

  // ── Drag-and-drop ─────────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragOver(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoTitle]);

  // ── Simulated upload progress (XHR gives real progress) ───────────────
  function simulateProgress(onDone: () => void) {
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 12 + 3;
      if (pct >= 95) {
        clearInterval(iv);
        setUploadProgress(95);
        onDone();
      } else {
        setUploadProgress(Math.min(pct, 95));
      }
    }, 200);
  }

  // ── Main pipeline ─────────────────────────────────────────────────────
  async function handleProcess() {
    if (!file) return;
    setErrorMsg("");
    setUploadProgress(0);

    // Stage 1 — Upload
    setStage("uploading");
    simulateProgress(() => setUploadProgress(100));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", videoTitle || file.name);

    let transcript = "";
    let resolvedTitle = videoTitle;

    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error ?? "Upload failed.");
        setStage("error");
        return;
      }

      transcript = data.transcript;
      if (!resolvedTitle) resolvedTitle = data.title;
    } catch {
      setErrorMsg("Upload failed — check your connection and try again.");
      setStage("error");
      return;
    }

    // Stage 2 — Extracting audio (UI only in V1 — happens server-side in pipeline)
    setStage("extracting-audio");
    await delay(900);

    // Stage 3 — Transcribing (UI only in V1)
    setStage("transcribing");
    await delay(1200);

    // Stage 4 — Generating study pack
    setStage("generating");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: `local://${file.name}`,
          transcript,
          videoTitle: resolvedTitle,
        }),
      });
      const data: GenerateResponse | GenerateError = await res.json();

      if (!data.success) {
        setErrorMsg((data as GenerateError).error);
        setStage("error");
        return;
      }

      const pack = (data as GenerateResponse).studyPack;
      savePack(pack);
      setStage("done");
      router.push(`/study/${pack.id}`);
    } catch {
      setErrorMsg("Generation failed — please try again.");
      setStage("error");
    }
  }

  function reset() {
    setFile(null);
    setVideoTitle("");
    setStage("idle");
    setErrorMsg("");
    setUploadProgress(0);
  }

  const isProcessing = !["idle", "done", "error"].includes(stage);
  const currentStageIdx = STAGE_ORDER.indexOf(stage as typeof STAGE_ORDER[number]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Drop zone */}
      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer border-2 border-dashed rounded-2xl transition-all
            ${isDragOver
              ? "border-yellow-400/60 bg-yellow-400/5 scale-[1.01]"
              : "border-white/10 hover:border-white/20 hover:bg-white/2"
            }`}
        >
          <div className="flex flex-col items-center justify-center gap-4 py-14 px-6 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all
              ${isDragOver ? "bg-yellow-400/15 scale-110" : "bg-white/4"}`}>
              {isDragOver ? "📥" : "🎬"}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                {isDragOver ? "Drop to upload" : "Drag & drop your video here"}
              </p>
              <p className="text-white/35 text-xs mt-1">
                or click to browse — MP4, MOV, MKV, WEBM up to {MAX_MB} MB
              </p>
            </div>
            <div className="flex items-center gap-2">
              {["MP4", "MOV", "MKV", "WEBM"].map((f) => (
                <span key={f} className="text-[10px] font-bold bg-white/5 border border-white/10 text-white/30 px-2 py-1 rounded">
                  {f}
                </span>
              ))}
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
          />
        </div>
      ) : (
        /* File selected card */
        <div className="bg-[#161b22] border border-white/10 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center flex-shrink-0">
              <FileIcon ext={ext} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{file.name}</p>
              <p className="text-xs text-white/35 mt-0.5">{formatBytes(file.size)}</p>
            </div>
            {!isProcessing && (
              <button
                onClick={reset}
                className="text-white/20 hover:text-white/60 transition-colors text-lg flex-shrink-0"
                title="Remove file"
              >✕</button>
            )}
          </div>

          {/* Processing pipeline progress */}
          {isProcessing && (
            <div className="mt-5 space-y-3">
              {/* Overall progress bar */}
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                  style={{
                    width: stage === "uploading"
                      ? `${uploadProgress * 0.25}%`
                      : stage === "extracting-audio"
                      ? "40%"
                      : stage === "transcribing"
                      ? "65%"
                      : stage === "generating"
                      ? "85%"
                      : "100%",
                  }}
                />
              </div>

              {/* Stage steps */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {STAGE_ORDER.map((s, i) => {
                  const cfg = STAGES[s];
                  const isPast = i < currentStageIdx;
                  const isCurrent = i === currentStageIdx;
                  return (
                    <div key={s} className="flex flex-col items-center gap-1.5 text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all
                        ${isPast ? "bg-emerald-400/15 text-emerald-400" : ""}
                        ${isCurrent ? "bg-yellow-400/15 text-yellow-400 ring-2 ring-yellow-400/30" : ""}
                        ${!isPast && !isCurrent ? "bg-white/4 text-white/20" : ""}`}>
                        {isPast ? "✓" : cfg.icon}
                      </div>
                      <span className={`text-[10px] font-medium leading-tight
                        ${isPast ? "text-emerald-400/70" : ""}
                        ${isCurrent ? "text-yellow-400" : ""}
                        ${!isPast && !isCurrent ? "text-white/20" : ""}`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Current detail */}
              <div className="flex items-center gap-2 pt-1">
                <span className="w-3 h-3 rounded-full bg-yellow-400/40 flex-shrink-0">
                  <span className="block w-3 h-3 rounded-full bg-yellow-400/60 animate-ping" />
                </span>
                <p className="text-xs text-white/50">
                  {stage !== "idle" && stage !== "done" && stage !== "error"
                    ? STAGES[stage]?.detail
                    : ""}
                  {stage === "uploading" && uploadProgress > 0 && uploadProgress < 100
                    ? ` (${Math.round(uploadProgress)}%)`
                    : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Title field */}
      {file && !isProcessing && (
        <input
          type="text"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          placeholder="Video title (optional — auto-detected from filename)"
          className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
        />
      )}

      {errorMsg && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
          <span className="flex-shrink-0">⚠️</span>
          <div>
            <p>{errorMsg}</p>
            <button onClick={reset} className="text-xs text-red-300/60 hover:text-red-300 mt-1 underline">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* V1 notice */}
      {!file && (
        <div className="bg-yellow-400/4 border border-yellow-400/10 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-yellow-400/60 flex-shrink-0 text-sm mt-0.5">ℹ</span>
          <p className="text-xs text-white/35 leading-relaxed">
            <span className="text-yellow-400/60 font-medium">V1 — Transcription stub:</span>{" "}
            Video upload UI is fully functional. FFmpeg audio extraction and Whisper transcription
            are scaffolded in <code className="text-white/30">/api/transcribe/route.ts</code> and
            ready to wire in. The same visual study pack is generated once transcription returns real text.
          </p>
        </div>
      )}

      <button
        onClick={handleProcess}
        disabled={!file || isProcessing}
        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/25 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Processing video...
          </span>
        ) : (
          `🎬 ${file ? "Process Video & Generate Study Pack" : "Select a Video First"}`
        )}
      </button>
    </div>
  );
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
