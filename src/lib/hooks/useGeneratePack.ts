"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { savePack } from "@/lib/storage";
import type { BuildGuide, BuildStep, Checkpoint } from "@/lib/types/buildGuide";
import type { GenerateRequest, GenerateSSEEvent } from "@/lib/types/api";

export type GenerateStatus = "idle" | "generating" | "streaming" | "done" | "error";

export interface GuideMeta {
  title: string;
  description: string;
  stepCount: number;
  difficulty: string;
  software: string;
  estimatedTime: string;
}

export function useGeneratePack() {
  const router = useRouter();
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");

  // Progressive streaming state
  const [guideMeta, setGuideMeta] = useState<GuideMeta | null>(null);
  const [streamedSteps, setStreamedSteps] = useState<BuildStep[]>([]);
  const [streamedCheckpoints, setStreamedCheckpoints] = useState<Checkpoint[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (payload: GenerateRequest) => {
    setError("");
    setStatus("generating");
    setStatusMsg("Connecting…");
    setGuideMeta(null);
    setStreamedSteps([]);
    setStreamedCheckpoints([]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        setError(text || "Server error. Please try again.");
        setStatus("error");
        return;
      }

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
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let event: GenerateSSEEvent;
          try {
            event = JSON.parse(raw);
          } catch {
            continue;
          }

          switch (event.type) {
            case "status":
              setStatusMsg(event.message);
              break;

            case "meta":
              setGuideMeta({
                title: event.title,
                description: event.description,
                stepCount: event.stepCount,
                difficulty: event.difficulty,
                software: event.software,
                estimatedTime: event.estimatedTime,
              });
              setStatus("streaming");
              setStatusMsg(`Building ${event.stepCount} steps…`);
              break;

            case "step":
              setStreamedSteps(prev => [...prev, event.step]);
              break;

            case "checkpoint":
              setStreamedCheckpoints(prev => [...prev, event.checkpoint]);
              break;

            case "error":
              setError(event.error);
              setStatus("error");
              return;

            case "complete":
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              savePack(event.studyPack as any);
              setStatus("done");
              router.push(`/study/${(event.studyPack as BuildGuide).id}`);
              return;
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError("Connection lost. Please try again.");
      setStatus("error");
    }
  }, [router]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
    setError("");
    setStatusMsg("");
    setGuideMeta(null);
    setStreamedSteps([]);
    setStreamedCheckpoints([]);
  }, []);

  const progress = guideMeta
    ? Math.min(Math.round((streamedSteps.length / Math.max(guideMeta.stepCount, 1)) * 100), 99)
    : 0;

  return {
    status,
    statusMsg,
    error,
    generate,
    reset,
    // Streaming state
    guideMeta,
    streamedSteps,
    streamedCheckpoints,
    progress,
  };
}
