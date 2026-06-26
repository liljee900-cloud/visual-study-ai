"use client";

import { useState, useRef, useCallback } from "react";
import { useGeneratePack } from "@/lib/hooks/useGeneratePack";
import GeneratingGuide from "./GeneratingGuide";

export default function PdfInput() {
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { status, statusMsg, error, generate, reset, guideMeta, streamedSteps, progress } = useGeneratePack();

  const loading = status === "generating" || extracting || status === "streaming";

  function pickFile(f: File) {
    if (!f.name.match(/\.pdf$/i)) {
      setExtractError("Please select a PDF file.");
      return;
    }
    setFile(f);
    setExtractError("");
    reset();
    if (!topic) setTopic(f.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    if (!file) return;
    setExtractError("");
    setExtracting(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
      const data = await res.json();

      if (!data.success) {
        setExtractError(data.error ?? "Failed to extract PDF text.");
        setExtracting(false);
        return;
      }

      setExtracting(false);
      await generate({
        videoUrl: `pdf://${file.name}`,
        transcript: data.text,
        videoTitle: topic || data.title,
      });
    } catch {
      setExtractError("Failed to process PDF. Please try again.");
      setExtracting(false);
    }
  }

  const displayError = extractError || error;

  return (
    <>
    {(status === "generating" || status === "streaming") && (
      <GeneratingGuide meta={guideMeta} steps={streamedSteps} progress={progress} statusMsg={statusMsg} onCancel={reset} />
    )}
    <div className="space-y-4">
      {/* Drop zone */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl transition-all ${
            isDragOver
              ? "border-yellow-400/60 bg-yellow-400/5"
              : "border-white/10 hover:border-white/20 hover:bg-white/2"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all ${isDragOver ? "bg-yellow-400/15" : "bg-white/4"}`}>
              📄
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                {isDragOver ? "Drop PDF here" : "Drag & drop a PDF"}
              </p>
              <p className="text-white/35 text-xs mt-1">or click to browse — tutorials, documentation, notes</p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
          />
        </div>
      ) : (
        <div className="bg-[#161b22] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black text-red-400">PDF</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{file.name}</p>
            <p className="text-xs text-white/35 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          {!loading && (
            <button onClick={() => { setFile(null); setExtractError(""); reset(); }} className="text-white/20 hover:text-white/60 text-lg">✕</button>
          )}
        </div>
      )}

      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Topic or document title (optional)"
        className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
      />

      {displayError && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
          <span>⚠️</span> {displayError}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!file || loading}
        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
      >
        {extracting ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Extracting PDF text…
          </span>
        ) : loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            {statusMsg}
          </span>
        ) : (
          "📄 Generate Guide from PDF"
        )}
      </button>
    </div>
    </>
  );
}
