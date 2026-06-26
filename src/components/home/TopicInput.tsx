"use client";

import { useState } from "react";
import { useGeneratePack } from "@/lib/hooks/useGeneratePack";
import GeneratingGuide from "./GeneratingGuide";

const EXAMPLES = [
  "How do I create realistic water in Blender?",
  "Texture a stone wall with procedural nodes",
  "Create a cel-shaded cartoon material",
  "Build a procedural brick wall with Geometry Nodes",
  "Make realistic hair with Blender's hair system",
  "Set up a studio lighting rig in Blender",
];

export default function TopicInput() {
  const [topic, setTopic] = useState("");
  const { status, statusMsg, error, generate, reset, guideMeta, streamedSteps, progress } = useGeneratePack();

  const loading = status === "generating" || status === "streaming";

  async function handleGenerate() {
    const trimmed = topic.trim();
    if (!trimmed) return;
    await generate({
      videoUrl: `topic://${encodeURIComponent(trimmed)}`,
      videoTitle: trimmed,
      topic: trimmed,
      inputType: "topic",
    });
  }

  return (
    <>
    {loading && (
      <GeneratingGuide meta={guideMeta} steps={streamedSteps} progress={progress} statusMsg={statusMsg} onCancel={reset} />
    )}
    <div className="space-y-4">
      {/* Topic textarea */}
      <div className="relative">
        <textarea
          value={topic}
          onChange={(e) => { setTopic(e.target.value); reset(); }}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
          placeholder="Describe what you want to learn…&#10;&#10;e.g. How do I create realistic water in Blender?"
          rows={4}
          className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/40 rounded-2xl px-4 py-4 text-sm text-white placeholder-white/25 outline-none resize-none transition-colors leading-relaxed"
        />
        <div className="absolute bottom-3 right-3 text-[10px] text-white/15">⌘↵ to generate</div>
      </div>

      {/* Example topics */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">Examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setTopic(ex); reset(); }}
              className="text-[10px] bg-white/[0.04] border border-white/[0.08] hover:border-yellow-400/25 hover:text-yellow-400/70 text-white/35 rounded-full px-3 py-1.5 transition-colors text-left"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || loading}
        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            {statusMsg}
          </span>
        ) : (
          "✨ Generate Guide"
        )}
      </button>

      <p className="text-[11px] text-white/20 text-center leading-relaxed">
        No video required — the AI creates a complete step-by-step guide from scratch.
      </p>
    </div>
    </>
  );
}
