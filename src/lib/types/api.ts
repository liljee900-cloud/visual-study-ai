import type { BuildGuide, BuildStep, Checkpoint } from "./buildGuide";

export interface GenerateRequest {
  videoUrl: string;
  transcript?: string;
  videoTitle?: string;
  // Topic mode — generates content from scratch instead of reconstructing
  topic?: string;
  inputType?: "tutorial" | "topic" | "pdf" | "url";
}

// SSE event types streamed from /api/generate
export type GenerateSSEEvent =
  | { type: "status"; message: string }
  | { type: "meta"; title: string; description: string; stepCount: number; difficulty: string; software: string; estimatedTime: string }
  | { type: "step"; step: BuildStep }
  | { type: "checkpoint"; checkpoint: Checkpoint }
  | { type: "complete"; studyPack: BuildGuide }
  | { type: "error"; error: string };

// Legacy JSON response (not used for /api/generate which is SSE-only)
export interface GenerateResponse {
  success: true;
  studyPack: BuildGuide;
}

export interface GenerateError {
  success: false;
  error: string;
}
