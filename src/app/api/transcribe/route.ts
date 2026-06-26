import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

export const maxDuration = 300;

interface TranscribeSuccess {
  success: true;
  transcript: string;
  title: string;
  durationSeconds: number | null;
  tempVideoId: string | null;   // set when video saved to /tmp for screenshot extraction
  processingNote?: string;
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

  const SUPPORTED = ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm", "video/avi"];
  if (!SUPPORTED.includes(file.type) && !file.name.match(/\.(mp4|mov|mkv|webm|avi)$/i)) {
    return NextResponse.json<TranscribeError>(
      { success: false, error: `Unsupported file type. Please upload MP4, MOV, MKV, or WEBM.`, stage: "upload" },
      { status: 415 }
    );
  }

  const MAX_BYTES = 500 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json<TranscribeError>(
      { success: false, error: "File too large. Maximum size is 500 MB.", stage: "upload" },
      { status: 413 }
    );
  }

  // ── Buffer upload ──────────────────────────────────────────────────────────
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // ── Save to /tmp so the screenshot extractor can access it ─────────────────
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
  const tempVideoId = randomUUID();
  const tempPath = join(tmpdir(), `vsa-${tempVideoId}.${ext}`);
  let savedToTemp = false;
  try {
    await writeFile(tempPath, buffer);
    savedToTemp = true;
  } catch {
    // Non-fatal — screenshots just won't be available
  }

  // ── Whisper transcription ──────────────────────────────────────────────────
  // Wired when OPENAI_API_KEY is set in .env.local
  let transcript: string | null = null;

  if (process.env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // For Whisper we need an audio file — use ffmpeg if available, else send video directly
      let audioBuffer = buffer;
      let audioFilename = file.name;

      // Try ffmpeg audio extraction
      try {
        const ffmpegPath = (await import("@ffmpeg-installer/ffmpeg")).default;
        const { default: ffmpeg } = await import("fluent-ffmpeg");
        ffmpeg.setFfmpegPath(ffmpegPath.path);

        const audioPath = join(tmpdir(), `vsa-${tempVideoId}.mp3`);
        await new Promise<void>((resolve, reject) => {
          ffmpeg(tempPath)
            .noVideo()
            .audioCodec("libmp3lame")
            .audioBitrate("128k")
            .output(audioPath)
            .on("end", () => resolve())
            .on("error", (err: Error) => reject(err))
            .run();
        });
        const { readFile } = await import("fs/promises");
        audioBuffer = await readFile(audioPath);
        audioFilename = `audio-${tempVideoId}.mp3`;
      } catch {
        // ffmpeg unavailable — send raw video to Whisper (works for MP4)
      }

      const { toFile } = await import("openai");
      const transcription = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: await toFile(audioBuffer, audioFilename),
        response_format: "text",
      });
      transcript = transcription as unknown as string;
    } catch (err) {
      console.error("Whisper transcription failed:", err);
    }
  }

  if (!transcript) {
    // Stub — real transcription unavailable
    transcript = `[Video uploaded: "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB)]

To enable automatic transcription, add OPENAI_API_KEY to .env.local.

If you have a transcript, paste it in the "Paste Transcript" tab instead.`;
  }

  return NextResponse.json<TranscribeSuccess>({
    success: true,
    transcript,
    title: title || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    durationSeconds: null,
    tempVideoId: savedToTemp ? tempVideoId : null,
  });
}
