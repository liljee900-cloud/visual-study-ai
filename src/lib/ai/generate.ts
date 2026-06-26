import Anthropic from "@anthropic-ai/sdk";
import { v4 as uuidv4 } from "uuid";
import type { StudyPack } from "../types/studyPack";
import { buildStudyPackPrompt } from "./prompt";
import { extractVideoId, getThumbnailUrl } from "../youtube/transcript";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateStudyPack(
  videoUrl: string,
  transcript: string,
  videoTitle?: string
): Promise<StudyPack> {
  const prompt = buildStudyPackPrompt(transcript, videoUrl, videoTitle);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from AI");

  let raw = content.text.trim();
  // Strip markdown fences if the model added them anyway
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(raw);

  const videoId = extractVideoId(videoUrl);
  const id = uuidv4();

  // Ensure all IDs are populated (in case AI omitted them)
  const pack: StudyPack = {
    id,
    createdAt: new Date().toISOString(),
    videoUrl,
    thumbnailUrl: videoId ? getThumbnailUrl(videoId) : undefined,
    version: "1.0",
    tags: parsed.tags ?? [],
    overview: parsed.overview,
    concepts: (parsed.concepts ?? []).map((c: Record<string, unknown>, i: number) => ({
      ...c,
      id: (c.id as string) || `concept-${i}`,
      number: (c.number as number) || i + 1,
    })),
    steps: (parsed.steps ?? []).map((s: Record<string, unknown>, i: number) => ({
      ...s,
      id: (s.id as string) || `step-${i}`,
      number: (s.number as number) || i + 1,
    })),
    cheatSheet: parsed.cheatSheet,
    quiz: {
      questions: (parsed.quiz?.questions ?? []).map((q: Record<string, unknown>, i: number) => ({
        ...q,
        id: (q.id as string) || `q-${i}`,
      })),
      flashcards: (parsed.quiz?.flashcards ?? []).map((f: Record<string, unknown>, i: number) => ({
        ...f,
        id: (f.id as string) || `fc-${i}`,
      })),
    },
  };

  return pack;
}
