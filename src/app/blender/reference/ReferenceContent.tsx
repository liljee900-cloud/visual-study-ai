"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Callout from "@/components/study/Callout";
import ScreenshotPlaceholder from "@/components/study/ScreenshotPlaceholder";

type Status = "idle" | "generating" | "done" | "error";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Reference = Record<string, any>;

export default function ReferenceContent() {
  const params = useSearchParams();
  const type = params.get("type") ?? "node";
  const name = params.get("name") ?? "";
  const category = params.get("category") ?? undefined;

  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [reference, setReference] = useState<Reference | null>(null);
  const [error, setError] = useState("");
  const hasStarted = useRef(false);

  const cacheKey = `blender-ref-${type}-${name.toLowerCase().replace(/\s+/g, "-")}`;

  useEffect(() => {
    if (!name || hasStarted.current) return;
    hasStarted.current = true;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setReference(JSON.parse(cached)); setStatus("done"); return; } catch { localStorage.removeItem(cacheKey); }
    }
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  async function generate() {
    setStatus("generating");
    setError("");
    try {
      const res = await fetch("/api/blender/reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, category }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "status") setStatusMsg(event.message);
            if (event.type === "complete") { setReference(event.reference); setStatus("done"); localStorage.setItem(cacheKey, JSON.stringify(event.reference)); }
            if (event.type === "error") { setError(event.error); setStatus("error"); }
          } catch {}
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStatus("error");
    }
  }

  if (!name) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-white/30">
          <p className="text-4xl">🔍</p>
          <p>No feature name provided.</p>
          <Link href="/blender" className="text-yellow-400 hover:text-yellow-300 text-sm">← Back to Library</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="border-b border-white/5 bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-white/30">
          <Link href="/blender" className="hover:text-white/60 transition-colors">Library</Link>
          <span>/</span>
          <span className="text-white/60">AI Reference: {name}</span>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {status === "generating" && (
          <div className="bg-yellow-400/5 border border-yellow-400/15 rounded-2xl p-8 text-center">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-yellow-400 font-medium">{statusMsg || `Generating reference for "${name}"…`}</p>
            <p className="text-white/30 text-sm mt-2">Claude is researching this Blender feature</p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-400/5 border border-red-400/15 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-medium mb-3">Generation failed: {error}</p>
            <button onClick={() => { setStatus("idle"); hasStarted.current = false; generate(); }}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-xl text-sm transition-colors">
              Try Again
            </button>
          </div>
        )}

        {status === "done" && reference && (
          <>
            <div className="bg-gradient-to-br from-yellow-400/10 via-yellow-400/4 to-transparent border border-yellow-400/15 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-4xl">{reference.icon ?? "🔷"}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-[10px] text-yellow-400/60 font-bold uppercase tracking-widest">AI-Generated Reference</div>
                    <button onClick={() => { localStorage.removeItem(cacheKey); hasStarted.current = false; generate(); }}
                      className="text-[10px] text-white/20 hover:text-white/40 transition-colors ml-2">↺ Regenerate</button>
                  </div>
                  <h1 className="text-2xl font-black text-white">{reference.name ?? name}</h1>
                  <p className="text-white/55 mt-1 leading-relaxed">{reference.description ?? ""}</p>
                </div>
              </div>
            </div>

            {reference.screenshotPlaceholder && (
              <ScreenshotPlaceholder description={reference.screenshotPlaceholder} size="lg" label={reference.name ?? name} />
            )}

            {(reference.whyItExists || reference.whenToUse || reference.purpose) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(reference.whyItExists || reference.purpose) && (
                  <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/60 mb-2">Why it exists</p>
                    <p className="text-sm text-white/70 leading-relaxed">{reference.whyItExists ?? reference.purpose}</p>
                  </div>
                )}
                {reference.whenToUse && (
                  <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60 mb-2">When to use it</p>
                    <p className="text-sm text-white/70 leading-relaxed">{reference.whenToUse}</p>
                  </div>
                )}
              </div>
            )}

            {(reference.beginnerExplanation || reference.advancedExplanation) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reference.beginnerExplanation && (
                  <div className="bg-green-400/5 border border-green-400/15 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-400/60 mb-3">🟢 Beginner</p>
                    <p className="text-sm text-white/75 leading-relaxed italic">&ldquo;{reference.beginnerExplanation}&rdquo;</p>
                  </div>
                )}
                {reference.advancedExplanation && (
                  <div className="bg-purple-400/5 border border-purple-400/15 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400/60 mb-3">🟣 Advanced</p>
                    <p className="text-sm text-white/75 leading-relaxed">{reference.advancedExplanation}</p>
                  </div>
                )}
              </div>
            )}

            {(reference.parameters?.length > 0 || reference.inputs?.length > 0) && (
              <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">⚙️ Parameters / Inputs</p>
                <div className="space-y-2">
                  {(reference.parameters ?? reference.inputs ?? []).map((p: Record<string, string>, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[10px] font-bold border rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5 bg-blue-400/10 text-blue-300 border-blue-400/20">{p.type ?? "param"}</span>
                      <div>
                        <span className="text-xs font-semibold text-white">{p.name}</span>
                        {p.default && <span className="ml-2 text-[10px] font-mono text-white/30">{p.default}</span>}
                        <p className="text-xs text-white/40 leading-relaxed">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reference.commonUseCases?.length > 0 && (
              <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Common Use Cases</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {reference.commonUseCases.map((uc: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/65">
                      <span className="text-yellow-400 flex-shrink-0 mt-0.5">→</span>{uc}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reference.exampleWorkflow && (
              <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">📋 Example Workflow</p>
                <p className="text-sm text-white/70 font-mono leading-relaxed">{reference.exampleWorkflow}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reference.commonMistakes?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-2">⚠️ Common Mistakes</p>
                  {reference.commonMistakes.map((m: string, i: number) => <Callout key={i} type="warning" text={m} />)}
                </div>
              )}
              {(reference.performanceTips ?? reference.tips)?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60 mb-2">💡 Tips</p>
                  {(reference.performanceTips ?? reference.tips).map((t: string, i: number) => <Callout key={i} type="tip" text={t} />)}
                </div>
              )}
            </div>

            {reference.quiz?.length > 0 && (
              <div className="bg-[#161b22] border border-white/8 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">🧠 Quick Quiz</p>
                <div className="space-y-4">
                  {reference.quiz.map((q: { question: string; answer: string }, i: number) => (
                    <details key={i} className="group">
                      <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-white/70 hover:text-white transition-colors list-none">
                        <span className="w-5 h-5 rounded-full bg-yellow-400/15 text-yellow-400 text-[10px] flex items-center justify-center flex-shrink-0 font-bold">Q</span>
                        {q.question}
                      </summary>
                      <div className="mt-2 ml-7 text-sm text-emerald-300/80 bg-emerald-400/5 border border-emerald-400/15 rounded-xl px-4 py-3">✓ {q.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {reference.practiceExercise && <Callout type="best-practice" text={`Practice: ${reference.practiceExercise}`} />}

            {reference.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {reference.tags.map((t: string) => (
                  <span key={t} className="text-xs bg-white/4 border border-white/8 text-white/30 rounded-full px-3 py-1">{t}</span>
                ))}
              </div>
            )}

            <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-xl p-3 text-center">
              <p className="text-[11px] text-yellow-400/60">
                AI-generated reference · cached locally ·{" "}
                <button onClick={() => { localStorage.removeItem(cacheKey); hasStarted.current = false; generate(); }}
                  className="underline hover:text-yellow-400 transition-colors">regenerate</button>
              </p>
            </div>
          </>
        )}

        <div className="pt-4">
          <Link href="/blender" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Back to Library
          </Link>
        </div>
      </main>
    </div>
  );
}
