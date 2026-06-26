// POST /api/screenshots
// Extracts frames from a temporarily stored video file using ffmpeg.
// Called after guide generation when a video was uploaded.
//
// Body: { tempVideoId: string, steps: Array<{ id: string, number: number, totalSteps: number }> }
// Response: { screenshots: Record<string, string> }  — stepId → base64 data URI

import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { tmpdir } from "os";
import { readFile, unlink, access } from "fs/promises";

export const maxDuration = 120;

interface StepRef {
  id: string;
  number: number;
  totalSteps: number;
}

interface ScreenshotsRequest {
  tempVideoId: string;
  steps: StepRef[];
}

interface ScreenshotsResponse {
  screenshots: Record<string, string>;   // stepId → data URI
  error?: string;
}

async function fileExists(path: string): Promise<boolean> {
  try { await access(path); return true; } catch { return false; }
}

// Find the video file in /tmp regardless of extension
async function findVideoPath(tempVideoId: string): Promise<string | null> {
  const exts = ["mp4", "mov", "mkv", "webm", "avi"];
  for (const ext of exts) {
    const p = join(tmpdir(), `vsa-${tempVideoId}.${ext}`);
    if (await fileExists(p)) return p;
  }
  return null;
}

// Extract a single frame at a given timestamp (seconds) as a JPEG buffer
async function extractFrame(videoPath: string, timeSeconds: number, outPath: string): Promise<void> {
  const ffmpegPath = (await import("@ffmpeg-installer/ffmpeg")).default;
  const { default: ffmpeg } = await import("fluent-ffmpeg");
  ffmpeg.setFfmpegPath(ffmpegPath.path);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(timeSeconds)
      .frames(1)
      .output(outPath)
      .outputOptions(["-vf", "scale=1280:-1", "-q:v", "3"])
      .on("end", () => resolve())
      .on("error", (err: Error) => reject(err))
      .run();
  });
}

export async function POST(req: NextRequest) {
  const body: ScreenshotsRequest = await req.json();
  const { tempVideoId, steps } = body;

  if (!tempVideoId || !steps?.length) {
    return NextResponse.json<ScreenshotsResponse>({ screenshots: {} });
  }

  const videoPath = await findVideoPath(tempVideoId);
  if (!videoPath) {
    return NextResponse.json<ScreenshotsResponse>({
      screenshots: {},
      error: "Video file not found — it may have expired. Re-upload to extract screenshots.",
    });
  }

  const screenshots: Record<string, string> = {};
  const totalSteps = steps[0]?.totalSteps ?? steps.length;

  // Extract frames in batches of 5 to avoid overloading
  const BATCH = 5;
  for (let i = 0; i < steps.length; i += BATCH) {
    const batch = steps.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (step) => {
        // Spread frames across estimated video duration
        // We don't have duration so assume ~1 min per 10 steps
        const estimatedDuration = totalSteps * 6; // 6 seconds per step estimate
        const timeSeconds = Math.max(0, ((step.number - 1) / totalSteps) * estimatedDuration);
        const outPath = join(tmpdir(), `vsa-frame-${tempVideoId}-${step.id}.jpg`);
        try {
          await extractFrame(videoPath, timeSeconds, outPath);
          const buf = await readFile(outPath);
          screenshots[step.id] = `data:image/jpeg;base64,${buf.toString("base64")}`;
          // Clean up frame file
          await unlink(outPath).catch(() => {});
        } catch {
          // Frame extraction failed for this step — skip silently
        }
      })
    );
  }

  return NextResponse.json<ScreenshotsResponse>({ screenshots });
}
