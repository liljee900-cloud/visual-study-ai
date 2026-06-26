"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  "Road on terrain", "Procedural forest", "Neon city lights",
  "Stone wall material", "Scatter rocks on landscape", "Glass water droplets",
  "Cartoon character shader", "Growing vines on building",
];

export default function TopicGenerator() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setStatusMsg("Understanding your topic...");

    try {
      const res = await fetch("/api/blender/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6));
          if (event.type === "status") setStatusMsg(event.message);
          if (event.type === "error") { setError(event.error); setLoading(false); return; }
          if (event.type === "complete") {
            // Store lesson in sessionStorage and navigate
            sessionStorage.setItem("blender-topic-lesson", JSON.stringify(event.lesson));
            sessionStorage.setItem("blender-topic-query", topic);
            router.push("/blender/topic");
            return;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-yellow-400/8 via-yellow-400/4 to-transparent border border-yellow-400/15 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/20 flex items-center justify-center text-xl">🤖</div>
        <div>
          <h3 className="font-black text-white text-base">AI Topic Generator</h3>
          <p className="text-xs text-white/40">Describe what you want to create — AI builds a complete lesson from our Blender library</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleGenerate()}
          placeholder='Try "Road on terrain" or "Procedural forest"...'
          className="flex-1 bg-[#0d1117] border border-white/10 focus:border-yellow-400/40 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 disabled:cursor-not-allowed text-black font-bold px-5 py-3 rounded-xl text-sm transition-all flex-shrink-0"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              {statusMsg}
            </span>
          ) : "Generate Lesson →"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">⚠ {error}</p>}

      {/* Example chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => setTopic(ex)}
            className="text-xs bg-white/4 hover:bg-white/8 border border-white/8 hover:border-yellow-400/20 text-white/40 hover:text-white/70 rounded-full px-3 py-1 transition-all"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
