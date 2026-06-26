import { NextRequest, NextResponse } from "next/server";
import { generateStudyPack } from "@/lib/ai/generate";
import { fetchTranscript } from "@/lib/youtube/transcript";
import type { GenerateRequest, GenerateResponse, GenerateError } from "@/lib/types/api";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { videoUrl, transcript, videoTitle } = body;

    if (!videoUrl) {
      return NextResponse.json<GenerateError>(
        { success: false, error: "videoUrl is required" },
        { status: 400 }
      );
    }

    let finalTranscript = transcript;

    // Auto-fetch transcript if none provided
    if (!finalTranscript || finalTranscript.trim().length < 50) {
      try {
        finalTranscript = await fetchTranscript(videoUrl);
      } catch {
        return NextResponse.json<GenerateError>(
          {
            success: false,
            error:
              "Could not auto-fetch transcript. Please paste the transcript manually.",
          },
          { status: 422 }
        );
      }
    }

    const studyPack = await generateStudyPack(videoUrl, finalTranscript, videoTitle);

    return NextResponse.json<GenerateResponse>({ success: true, studyPack });
  } catch (err) {
    console.error("[generate] error:", err);
    return NextResponse.json<GenerateError>(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
