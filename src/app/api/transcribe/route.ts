import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // transcription can be slow

// ---------------------------------------------------------------------------
// POST /api/transcribe
//
// Accepts a multipart/form-data body with:
//   - file   : video file (MP4 / MOV / MKV / WEBM)
//   - title  : optional title string
//
// Pipeline (V1 — partially stubbed, ready for real implementation):
//
//   1. Receive & buffer the upload
//   2. [TODO] Save to temp storage (local /tmp in dev, R2/Supabase in prod)
//   3. [TODO] FFmpeg: extract audio track → WAV/MP3
//   4. [TODO] Whisper API: transcribe audio → text
//   5. Return { transcript, title, durationSeconds }
//
// To wire in real processing:
//   - Install: npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg openai
//   - Replace the TODO blocks below with the implementation stubs provided
// ---------------------------------------------------------------------------

interface TranscribeSuccess {
  success: true;
  transcript: string;
  title: string;
  durationSeconds: number | null;
  processingNote: string;
}

interface TranscribeError {
  success: false;
  error: string;
  stage: "upload" | "audio-extract" | "transcribe" | "unknown";
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

  const SUPPORTED = ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm", "video/avi", "video/mov"];
  if (!SUPPORTED.includes(file.type) && !file.name.match(/\.(mp4|mov|mkv|webm|avi)$/i)) {
    return NextResponse.json<TranscribeError>(
      {
        success: false,
        error: `Unsupported file type: ${file.type || file.name}. Please upload MP4, MOV, MKV, or WEBM.`,
        stage: "upload",
      },
      { status: 415 }
    );
  }

  const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json<TranscribeError>(
      { success: false, error: "File too large. Maximum size is 500 MB.", stage: "upload" },
      { status: 413 }
    );
  }

  // ── STAGE 1: Buffer the upload ──────────────────────────────────────────
  // In production: stream directly to R2 / Supabase Storage instead of
  // buffering in memory. For files > ~100 MB use presigned upload URLs.
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  void buffer; // used by FFmpeg below once wired in

  // ── STAGE 2: Save to temp path ──────────────────────────────────────────
  // TODO (production):
  //
  //   import { writeFile } from "fs/promises";
  //   import { join } from "path";
  //   import { tmpdir } from "os";
  //   const tmpPath = join(tmpdir(), `vsa-${Date.now()}-${file.name}`);
  //   await writeFile(tmpPath, buffer);

  // ── STAGE 3: Extract audio with FFmpeg ─────────────────────────────────
  // TODO (production):
  //
  //   import ffmpeg from "fluent-ffmpeg";
  //   import ffmpegPath from "@ffmpeg-installer/ffmpeg";
  //   ffmpeg.setFfmpegPath(ffmpegPath.path);
  //
  //   const audioPath = tmpPath.replace(/\.[^.]+$/, ".mp3");
  //   await new Promise<void>((resolve, reject) => {
  //     ffmpeg(tmpPath)
  //       .noVideo()
  //       .audioCodec("libmp3lame")
  //       .audioBitrate("128k")
  //       .output(audioPath)
  //       .on("end", resolve)
  //       .on("error", reject)
  //       .run();
  //   });

  // ── STAGE 4: Transcribe with Whisper ───────────────────────────────────
  // TODO (production):
  //
  //   import OpenAI from "openai";
  //   import { createReadStream } from "fs";
  //   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  //
  //   const transcription = await openai.audio.transcriptions.create({
  //     model: "whisper-1",
  //     file: createReadStream(audioPath),
  //     response_format: "text",
  //   });
  //   const transcript = transcription; // string
  //
  // Alternative: Anthropic audio input (when available), Deepgram, AssemblyAI

  // ── V1 STUB ─────────────────────────────────────────────────────────────
  // Return a clear stub response so the UI can complete its flow.
  // The generate endpoint will receive this and the AI will still produce
  // a study pack (albeit with limited content from the stub transcript).
  //
  // Replace this entire block once FFmpeg + Whisper are wired in above.

  const stubTranscript = `[TRANSCRIPTION PENDING — Video file received: "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB)]

This is a placeholder transcript generated because the FFmpeg + Whisper transcription pipeline has not yet been connected.

To enable real transcription:
1. Install fluent-ffmpeg and @ffmpeg-installer/ffmpeg for audio extraction
2. Add your OPENAI_API_KEY to .env.local
3. Replace the stub block in /src/app/api/transcribe/route.ts with the TODO implementations above

Once connected, this file will be automatically transcribed and a full visual study pack will be generated.`;

  return NextResponse.json<TranscribeSuccess>({
    success: true,
    transcript: stubTranscript,
    title: title || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    durationSeconds: null,
    processingNote: "V1 stub — transcription pipeline not yet connected. See /src/app/api/transcribe/route.ts for wiring instructions.",
  });
}
