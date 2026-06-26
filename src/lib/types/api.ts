import type { StudyPack } from "./studyPack";

export interface GenerateRequest {
  videoUrl: string;
  transcript: string;
  videoTitle?: string;
}

export interface GenerateResponse {
  success: true;
  studyPack: StudyPack;
}

export interface GenerateError {
  success: false;
  error: string;
}
