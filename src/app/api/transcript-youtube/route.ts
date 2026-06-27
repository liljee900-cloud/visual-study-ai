import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: { videoUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { videoUrl } = body;
  if (!videoUrl) {
    return NextResponse.json({ success: false, error: "videoUrl required" }, { status: 400 });
  }

  // Extract video ID
  const idMatch = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (!idMatch) {
    return NextResponse.json({ success: false, error: "Invalid YouTube URL", unavailable: true }, { status: 400 });
  }
  const videoId = idMatch[1];

  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    if (!segments || segments.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No transcript found for this video.",
        unavailable: true,
      });
    }
    const transcript = segments.map((s) => s.text).join(" ");
    return NextResponse.json({ success: true, transcript, segments: segments.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    // Classify the failure so the UI can show the right message
    if (msg.includes("disabled") || msg.includes("No transcripts")) {
      return NextResponse.json({
        success: false,
        error: "This video has no captions or transcript available.",
        unavailable: true,
      });
    }
    if (msg.includes("unavailable") || msg.includes("private")) {
      return NextResponse.json({
        success: false,
        error: "Video is private or unavailable.",
        unavailable: true,
      });
    }
    if (msg.includes("Too Many") || msg.includes("captcha") || msg.includes("429")) {
      return NextResponse.json({
        success: false,
        error: "YouTube is rate-limiting this server. Please paste the transcript manually.",
        unavailable: false,
      });
    }
    return NextResponse.json({
      success: false,
      error: "Could not fetch transcript — " + msg,
      unavailable: false,
    });
  }
}
