import { NextRequest, NextResponse } from "next/server";
import { getTranscript, wordsToTimestampedText } from "@/lib/transcription/assemblyai";

export const maxDuration = 10;

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  if (!process.env.ASSEMBLYAI_API_KEY) {
    return NextResponse.json({ error: "ASSEMBLYAI_API_KEY not set" }, { status: 503 });
  }

  try {
    const result = await getTranscript(jobId);

    if (result.status === "completed" && result.text) {
      const timestamped = result.words ? wordsToTimestampedText(result.words) : result.text;
      return NextResponse.json({
        status: "completed",
        transcript: result.text,
        timestamped,
        durationSeconds: result.audio_duration ?? null,
        wordCount: result.words?.length ?? 0,
      });
    }

    if (result.status === "error") {
      return NextResponse.json({
        status: "error",
        error: result.error ?? "Transcription failed",
      });
    }

    // queued or processing
    return NextResponse.json({ status: result.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", error: msg }, { status: 500 });
  }
}
