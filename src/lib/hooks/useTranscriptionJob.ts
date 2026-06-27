"use client";

import { useState, useRef, useCallback } from "react";
import type { TranscriptData, TranscriptSource } from "@/components/transcript/TranscriptCenter";

type JobStatus = "idle" | "uploading" | "queued" | "processing" | "completed" | "error";

interface UseTranscriptionJobReturn {
  status: JobStatus;
  statusMsg: string;
  transcript: TranscriptData | null;
  error: string;
  startJob: (file: File, title?: string) => Promise<void>;
  reset: () => void;
}

export function useTranscriptionJob(source: TranscriptSource = "audio-transcription"): UseTranscriptionJobReturn {
  const [status, setStatus] = useState<JobStatus>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  const reset = useCallback(() => {
    stopPolling();
    setStatus("idle");
    setStatusMsg("");
    setTranscript(null);
    setError("");
  }, []);

  const startJob = useCallback(async (file: File, title = "") => {
    reset();
    setStatus("uploading");
    setStatusMsg("Uploading audio…");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);

    let jobId: string;
    let resolvedTitle: string;

    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Upload failed");
        setStatus("error");
        return;
      }
      jobId = data.jobId;
      resolvedTitle = data.title || title;
    } catch {
      setError("Upload failed — check your connection.");
      setStatus("error");
      return;
    }

    setStatus("queued");
    setStatusMsg("Transcription queued…");

    // Poll every 4 seconds
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/transcript-status?jobId=${jobId}`);
        const data = await res.json();

        if (data.status === "processing") {
          setStatus("processing");
          setStatusMsg("Transcribing audio…");
        } else if (data.status === "completed") {
          stopPolling();
          setStatus("completed");
          setStatusMsg("Transcript ready");
          setTranscript({
            text: data.transcript,
            timestamped: data.timestamped,
            source,
            durationSeconds: data.durationSeconds,
            wordCount: data.wordCount,
          });
          void resolvedTitle; // suppress unused warning
        } else if (data.status === "error") {
          stopPolling();
          setStatus("error");
          setError(data.error ?? "Transcription failed");
        }
      } catch {
        stopPolling();
        setError("Lost connection while waiting for transcript.");
        setStatus("error");
      }
    }, 4000);
  }, [reset, source]);

  return { status, statusMsg, transcript, error, startJob, reset };
}
