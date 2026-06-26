"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { savePack } from "@/lib/storage";
import type { GenerateResponse, GenerateError } from "@/lib/types/api";

const CYCLING_MESSAGES = [
  "Identifying key concepts...",
  "Structuring concept cards...",
  "Writing step-by-step notes...",
  "Building cheat sheet...",
  "Generating quiz questions...",
  "Assembling study pack...",
];

export type GenerateStatus = "idle" | "generating" | "done" | "error";

export function useGeneratePack() {
  const router = useRouter();
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCycling(firstMsg: string) {
    setStatusMsg(firstMsg);
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % CYCLING_MESSAGES.length;
      setStatusMsg(CYCLING_MESSAGES[idx]);
    }, 2500);
  }

  function stopCycling() {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  async function generate(payload: {
    videoUrl: string;
    transcript: string;
    videoTitle?: string;
  }) {
    setError("");
    setStatus("generating");
    startCycling("Reading transcript...");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: GenerateResponse | GenerateError = await res.json();

      if (!data.success) {
        setError((data as GenerateError).error);
        setStatus("error");
        return;
      }

      const pack = (data as GenerateResponse).studyPack;
      savePack(pack);
      setStatus("done");
      router.push(`/study/${pack.id}`);
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    } finally {
      stopCycling();
    }
  }

  function reset() {
    stopCycling();
    setStatus("idle");
    setError("");
    setStatusMsg("");
  }

  return { status, statusMsg, error, generate, reset };
}
