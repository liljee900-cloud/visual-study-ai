import { NextRequest, NextResponse } from "next/server";
import { uploadAudio, submitTranscription } from "@/lib/transcription/assemblyai";

// AssemblyAI accepts up to 5 GB; Vercel Hobby body limit ~4.5 MB, Pro is configurable.
// For files > 4.5 MB on Hobby, user needs Vercel Pro or should use audio-only exports.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ASSEMBLYAI_API_KEY) {
    return NextResponse.json(
      {
        success: false,
        error: "ASSEMBLYAI_API_KEY is not configured. Add it in Vercel → Settings → Environment Variables.",
        needsKey: true,
      },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null) ?? "";

  if (!file) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }

  const SUPPORTED = /\.(mp4|mov|mkv|webm|avi|m4a|mp3|wav|ogg|flac)$/i;
  if (!SUPPORTED.test(file.name) && !file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
    return NextResponse.json(
      { success: false, error: "Unsupported file type. Use MP4, MOV, MKV, WEBM, MP3, or WAV." },
      { status: 415 }
    );
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Upload file to AssemblyAI's CDN
    const audioUrl = await uploadAudio(buffer);

    // 2. Submit async transcription job
    const jobId = await submitTranscription(audioUrl);

    return NextResponse.json({
      success: true,
      jobId,
      title: title || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      fileSizeMb: +(file.size / 1024 / 1024).toFixed(1),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Transcribe error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
