"use client";

import { useState } from "react";

export type TranscriptSource =
  | "youtube-captions"
  | "youtube-asr"
  | "audio-transcription"
  | "manual";

export interface TranscriptData {
  text: string;
  timestamped?: string;
  source: TranscriptSource;
  durationSeconds?: number;
  wordCount?: number;
}

const SOURCE_LABELS: Record<TranscriptSource, { label: string; color: string; icon: string }> = {
  "youtube-captions":     { label: "YouTube captions",          color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/6",  icon: "▶️" },
  "youtube-asr":          { label: "Auto-generated captions",   color: "text-blue-400 border-blue-500/25 bg-blue-500/6",            icon: "🤖" },
  "audio-transcription":  { label: "AI audio transcription",    color: "text-purple-400 border-purple-500/25 bg-purple-500/6",      icon: "🎙️" },
  "manual":               { label: "Manually pasted",           color: "text-white/50 border-white/15 bg-white/4",                  icon: "📝" },
};

interface Props {
  data: TranscriptData;
  onEdit: (text: string) => void;
  onRegenerate?: () => void;
  onUseForGuide: (text: string) => void;
  generating?: boolean;
}

export default function TranscriptCenter({
  data,
  onEdit,
  onRegenerate,
  onUseForGuide,
  generating = false,
}: Props) {
  const [showTimestamped, setShowTimestamped] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(data.text);
  const src = SOURCE_LABELS[data.source];
  const displayText = showTimestamped && data.timestamped ? data.timestamped : data.text;

  function handleSaveEdit() {
    onEdit(draft);
    setEditMode(false);
  }

  function handleDownload() {
    const content = showTimestamped && data.timestamped ? data.timestamped : data.text;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/8 bg-white/2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${src.color}`}>
            {src.icon} {src.label}
          </span>
          {data.durationSeconds && (
            <span className="text-[10px] text-white/30">
              {Math.round(data.durationSeconds / 60)} min
            </span>
          )}
          {data.wordCount && data.wordCount > 0 && (
            <span className="text-[10px] text-white/30">{data.wordCount.toLocaleString()} words</span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {data.timestamped && (
            <button
              onClick={() => setShowTimestamped((v) => !v)}
              className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all ${
                showTimestamped
                  ? "border-yellow-400/30 bg-yellow-400/8 text-yellow-400"
                  : "border-white/10 text-white/35 hover:text-white/60"
              }`}
            >
              ⏱ Timestamps
            </button>
          )}
          <button
            onClick={() => { setEditMode((v) => !v); setDraft(data.text); }}
            className="text-[10px] px-2.5 py-1.5 rounded-lg border border-white/10 text-white/35 hover:text-white/60 transition-all"
          >
            ✏️ Edit
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="text-[10px] px-2.5 py-1.5 rounded-lg border border-white/10 text-white/35 hover:text-white/60 transition-all"
            >
              🔄 Redo
            </button>
          )}
          <button
            onClick={handleDownload}
            className="text-[10px] px-2.5 py-1.5 rounded-lg border border-white/10 text-white/35 hover:text-white/60 transition-all"
          >
            ⬇ Download
          </button>
        </div>
      </div>

      {/* Transcript body */}
      <div className="relative">
        {editMode ? (
          <div className="p-3 space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={10}
              className="w-full bg-[#0d1117] border border-white/10 focus:border-yellow-400/30 rounded-xl px-3 py-2.5 text-xs text-white/80 font-mono outline-none resize-none leading-relaxed"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="text-xs bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-lg transition-all"
              >
                Save changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="text-xs text-white/40 hover:text-white/70 px-3 py-2 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="max-h-52 overflow-y-auto px-4 py-3">
            <pre className="text-xs text-white/55 font-mono leading-relaxed whitespace-pre-wrap break-words">
              {displayText}
            </pre>
          </div>
        )}
      </div>

      {/* Footer — Use for guide */}
      {!editMode && (
        <div className="px-4 py-3 border-t border-white/8 bg-white/1">
          <button
            onClick={() => onUseForGuide(data.text)}
            disabled={generating}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Generating guide…
              </span>
            ) : (
              "✨ Generate Guide from This Transcript"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
