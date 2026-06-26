"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import StepCard from "@/components/guide/StepCard";
import CheckpointBanner from "@/components/guide/CheckpointBanner";
import GuideSummarySection from "@/components/guide/GuideSummarySection";
import { loadPack } from "@/lib/storage";
import type { BuildGuide } from "@/lib/types/buildGuide";

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  Intermediate: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  Advanced: "bg-red-400/10 text-red-400 border-red-400/20",
};

export default function StudyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [guide, setGuide] = useState<BuildGuide | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const stepRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const found = loadPack(id);
    if (!found) { router.replace("/"); return; }

    // Handle old v1.0 format — show upgrade message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((found as any).version !== "2.0") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setGuide({ ...found, _legacy: true } as unknown as BuildGuide);
      return;
    }
    setGuide(found as BuildGuide);
  }, [id, router]);

  // Track active step while scrolling
  useEffect(() => {
    if (!guide || guide.steps?.length === 0) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const num = Number(entry.target.getAttribute("data-step"));
            if (!isNaN(num)) setActiveStep(num);
          }
        }
      },
      { threshold: 0.3 }
    );
    Object.values(stepRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [guide]);

  const scrollToStep = (num: number) => {
    stepRefs.current[num]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080a0f]">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Legacy v1.0 pack — show upgrade prompt
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((guide as any)._legacy) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-4">
            <span className="text-4xl">📦</span>
            <h2 className="text-xl font-black text-white">This is an older study pack</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              This pack was generated with the old format (v1.0 concept cards). The new format creates detailed step-by-step build guides. Re-generate this video to get a full guide.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/" className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Generate New Guide
              </Link>
              <Link href="/library" className="bg-white/5 hover:bg-white/10 text-white/60 px-5 py-2.5 rounded-xl text-sm transition-colors">
                My Library
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Build checkpoint lookup map
  const checkpointAfterStep = new Map(guide.checkpoints.map(c => [c.afterStep, c]));

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0c12]">
      <Header />

      {/* ── GUIDE HEADER — infographic title block ── */}
      <div className="border-b border-white/[0.05] bg-[#0d1017]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/library" className="text-[10px] font-bold uppercase tracking-widest text-white/25 hover:text-white/50 transition-colors mb-4 inline-block">← Library</Link>

          <div className="flex items-start gap-4">
            {guide.thumbnailUrl && (
              <img src={guide.thumbnailUrl} alt="" className="w-24 h-16 object-cover rounded-xl flex-shrink-0 opacity-70" />
            )}
            <div className="flex-1 min-w-0">
              {guide.software && (
                <span className="inline-block text-[9px] font-black uppercase tracking-[0.15em] bg-yellow-400 text-black px-2.5 py-1 rounded-md mb-2">
                  {guide.software}
                </span>
              )}
              <h1 className="text-2xl font-black text-white leading-tight">{guide.title}</h1>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">{guide.description}</p>
            </div>
          </div>

          {/* Stat row */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className={`text-[10px] font-black uppercase tracking-wider border rounded-md px-2.5 py-1 ${DIFFICULTY_COLOR[guide.difficulty] ?? DIFFICULTY_COLOR.Intermediate}`}>
              {guide.difficulty}
            </span>
            {guide.estimatedTime && (
              <span className="text-[10px] font-bold bg-white/[0.04] border border-white/[0.08] text-white/35 rounded-md px-2.5 py-1">
                ⏱ {guide.estimatedTime}
              </span>
            )}
            <span className="text-[10px] font-bold bg-white/[0.04] border border-white/[0.08] text-white/35 rounded-md px-2.5 py-1">
              {guide.steps.length} steps
            </span>
            {guide.checkpoints.length > 0 && (
              <span className="text-[10px] font-bold bg-yellow-400/8 border border-yellow-400/20 text-yellow-400/70 rounded-md px-2.5 py-1">
                {guide.checkpoints.length} checkpoint{guide.checkpoints.length !== 1 ? "s" : ""}
              </span>
            )}
            {guide.prerequisites.map((p, i) => (
              <span key={i} className="text-[10px] bg-white/[0.03] border border-white/[0.06] text-white/30 rounded-md px-2.5 py-1">
                Requires: {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-5">

        {/* Step progress nav — sticky */}
        {guide.steps.length > 4 && (
          <div className="sticky top-14 z-30 mb-4 bg-[#0a0c12]/95 backdrop-blur-md border border-white/[0.06] rounded-xl px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[9px] text-white/20 font-black uppercase tracking-widest flex-shrink-0 mr-1.5">Step</span>
            {guide.steps.map(s => (
              <button
                key={s.number}
                onClick={() => scrollToStep(s.number)}
                className={`w-7 h-7 rounded-full text-[10px] font-black flex-shrink-0 transition-all ${
                  activeStep === s.number
                    ? "bg-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                    : "bg-white/[0.04] text-white/25 hover:bg-white/[0.08] hover:text-white/50"
                }`}
              >
                {s.number}
              </button>
            ))}
          </div>
        )}

        {/* What you'll build */}
        {guide.finalResult.description && (
          <div className="mb-4 bg-[#12151c] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="bg-[#1a2030] border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-yellow-400/80">What You&apos;ll Build</span>
            </div>
            <p className="text-xs text-white/55 leading-relaxed px-4 py-3">{guide.finalResult.description}</p>
          </div>
        )}

        {/* ── STEPS GRID — 2 columns on desktop ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {guide.steps.map((step, i) => (
            <div
              key={step.id}
              ref={el => { stepRefs.current[step.number] = el; }}
              data-step={step.number}
              className={checkpointAfterStep.has(step.number) ? "sm:col-span-2" : ""}
            >
              <StepCard step={step} isLast={i === guide.steps.length - 1} />
              {checkpointAfterStep.has(step.number) && (
                <CheckpointBanner checkpoint={checkpointAfterStep.get(step.number)!} />
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4">
          <GuideSummarySection
            summary={guide.summary}
            finalResultDescription={guide.finalResult.description}
            finalResultScreenshot={guide.finalResult.screenshotPlaceholder}
          />
        </div>

        {/* Source video + tags footer */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-10">
          <div className="bg-[#12151c] border border-white/[0.07] rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/25">Original Video</p>
              <p className="text-[11px] text-white/40 mt-0.5 truncate">{guide.videoUrl}</p>
            </div>
            <a
              href={guide.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 ml-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white/50 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              Watch →
            </a>
          </div>
          {guide.tags.length > 0 && (
            <div className="bg-[#12151c] border border-white/[0.07] rounded-xl px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/25 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {guide.tags.map(t => (
                  <span key={t} className="text-[9px] bg-white/[0.04] border border-white/[0.07] text-white/30 rounded-full px-2.5 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
