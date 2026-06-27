import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

// Vercel body limit ~4.5 MB on Hobby. Whisper accepts up to 25 MB.
// We enforce 24 MB — users on Hobby Vercel must keep files under ~4 MB.
// On Pro/Enterprise, the limit is configurable via vercel.json.
const MAX_BYTES = 24 * 1024 * 1024;

interface TranscribeSuccess {
  success: true;
  transcript: string;
  title: string;
}

interface TranscribeError {
  success: false;
  error: string;
  stage: "upload" | "transcribe" | "unknown";
  needsKey?: boolean;
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json<TranscribeError>(
      { success: false, error: "Invalid form data", stage: "upload" },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null) ?? "";

  if (!file) {
    return NextResponse.json<TranscribeError>(
      { success: false, error: "No file provided", stage: "upload" },
      { status: 400 }
    );
  }

  const SUPPORTED_EXT = /\.(mp4|mov|mkv|webm|avi|m4a|mp3|wav|ogg)$/i;
  if (!SUPPORTED_EXT.test(file.name) && !file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
    return NextResponse.json<TranscribeError>(
      { success: false, error: "Unsupported file type. Upload MP4, MOV, MKV, WEBM, or audio files.", stage: "upload" },
      { status: 415 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json<TranscribeError>(
      {
        success: false,
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 24 MB. For larger videos, export just the audio track first.`,
        stage: "upload",
      },
      { status: 413 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json<TranscribeError>(
      {
        success: false,
        error: "OPENAI_API_KEY is not configured. Add it to your Vercel environment variables to enable video transcription.",
        stage: "transcribe",
        needsKey: true,
      },
      { status: 503 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Send directly to OpenAI Whisper — accepts MP4/MOV/WEBM natively, no FFmpeg needed on server
  try {
    const { default: OpenAI, toFile } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: await toFile(buffer, file.name, { type: file.type || "video/mp4" }),
      response_format: "text",
    });

    const transcript = (transcription as unknown as string).trim();
    if (!transcript) {
      return NextResponse.json<TranscribeError>(
        { success: false, error: "No speech detected in this file.", stage: "transcribe" },
        { status: 422 }
      );
    }

    return NextResponse.json<TranscribeSuccess>({
      success: true,
      transcript,
      title: title || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Whisper transcription error:", msg);
    return NextResponse.json<TranscribeError>(
      { success: false, error: "Transcription failed: " + msg, stage: "transcribe" },
      { status: 500 }
    );
  }
}
