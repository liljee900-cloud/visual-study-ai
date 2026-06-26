"use client";

import { useState } from "react";
import { useGeneratePack } from "@/lib/hooks/useGeneratePack";
import GeneratingGuide from "./GeneratingGuide";

export default function URLInput() {
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const { status, statusMsg, error, generate, reset, guideMeta, streamedSteps, progress } = useGeneratePack();

  const loading = status === "generating" || fetching || status === "streaming";

  async function handleGenerate() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setFetchError("");
    setFetching(true);

    try {
      const res = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();

      if (!data.success) {
        setFetchError(data.error ?? "Failed to fetch page.");
        setFetching(false);
        return;
      }

      setFetching(false);
      await generate({
        videoUrl: trimmed,
        transcript: data.text,
        videoTitle: topic || data.title,
      });
    } catch {
      setFetchError("Could not fetch the URL. Please check your connection.");
      setFetching(false);
    }
  }

  const displayError = fetchError || error;

  return (
    <>
    {(status === "generating" || status === "streaming") && (
      <GeneratingGuide meta={guideMeta} steps={streamedSteps} progress={progress} statusMsg={statusMsg} onCancel={reset} />
    )}
    <div className="space-y-4">
      <div className="bg-[#161b22] border border-white/10 focus-within:border-yellow-400/40 rounded-2xl transition-all">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="text-lg flex-shrink-0">🌐</span>
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setFetchError(""); reset(); }}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="https://docs.blender.org/manual/..."
            className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
          />
          {url && (
            <button onClick={() => { setUrl(""); setFetchError(""); reset(); }} className="text-white/20 hover:text-white/50 text-xs px-2">✕</button>
          )}
        </div>
      </div>

      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Topic title (optional)"
        className="w-full bg-[#161b22] border border-white/10 focus:border-yellow-400/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
      />

      <p className="text-xs text-white/25 leading-relaxed px-1">
        Paste any tutorial page, docs URL, or blog post. The AI will extract the content and turn it into a step-by-step guide.
      </p>

      {displayError && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
          <span>⚠️</span> {displayError}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!url.trim() || loading}
        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
      >
        {fetching ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Fetching page…
          </span>
        ) : loading ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            {statusMsg}
          </span>
        ) : (
          "🌐 Generate Guide from URL"
        )}
      </button>
    </div>
    </>
  );
}
