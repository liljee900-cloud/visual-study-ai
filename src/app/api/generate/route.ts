import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { v4 as uuidv4 } from "uuid";
import { buildGuidePrompt } from "@/lib/ai/buildGuidePrompt";
import { topicGuidePrompt } from "@/lib/ai/topicGuidePrompt";
import { extractVideoId, getThumbnailUrl, fetchTranscript } from "@/lib/youtube/transcript";
import type { BuildGuide } from "@/lib/types/buildGuide";
import type { GenerateRequest } from "@/lib/types/api";

export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function sseEvent(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

// Parse and validate a step object from raw AI output
function parseStep(s: Record<string, unknown>, i: number): BuildGuide["steps"][0] {
  return {
    id: (s.id as string) || `step-${i + 1}`,
    number: (s.number as number) ?? i + 1,
    title: (s.title as string) ?? `Step ${i + 1}`,
    editor: s.editor as string | undefined,
    panel: s.panel as string | undefined,
    action: (s.action as string) ?? "",
    shortcut: s.shortcut as string | undefined,
    menuPath: s.menuPath as string | undefined,
    whereToClick: s.whereToClick as string | undefined,
    settings: (s.settings as BuildGuide["steps"][0]["settings"]) ?? [],
    connections: (s.connections as BuildGuide["steps"][0]["connections"]) ?? [],
    purpose: (s.purpose as string) ?? "",
    expectedResult: (s.expectedResult as string) ?? "",
    commonMistakes: (s.commonMistakes as string[]) ?? [],
    tips: (s.tips as string[]) ?? [],
    screenshotPlaceholder: (s.screenshotPlaceholder as string) ?? "",
    sideNote: (s.sideNote as BuildGuide["steps"][0]["sideNote"]) ?? undefined,
  };
}

function parseCheckpoint(c: Record<string, unknown>, i: number): BuildGuide["checkpoints"][0] {
  return {
    id: (c.id as string) || `checkpoint-${i + 1}`,
    afterStep: (c.afterStep as number) ?? 0,
    title: (c.title as string) ?? `Checkpoint ${i + 1}`,
    description: (c.description as string) ?? "",
    screenshotPlaceholder: (c.screenshotPlaceholder as string) ?? "",
    verificationPoints: (c.verificationPoints as string[]) ?? [],
    commonIssues: (c.commonIssues as BuildGuide["checkpoints"][0]["commonIssues"]) ?? [],
  };
}

function buildGuideFromParsed(parsed: Record<string, unknown>, videoUrl: string, videoId: string | null): BuildGuide {
  const steps = ((parsed.steps as Record<string, unknown>[]) ?? []).map(parseStep);
  const checkpoints = ((parsed.checkpoints as Record<string, unknown>[]) ?? []).map(parseCheckpoint);
  return {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    videoUrl,
    thumbnailUrl: videoId ? getThumbnailUrl(videoId) : undefined,
    version: "2.0",
    title: (parsed.title as string) ?? "Build Guide",
    description: (parsed.description as string) ?? "",
    software: (parsed.software as string) ?? "Blender",
    difficulty: (parsed.difficulty as BuildGuide["difficulty"]) ?? "Intermediate",
    estimatedTime: (parsed.estimatedTime as string) ?? "",
    prerequisites: (parsed.prerequisites as string[]) ?? [],
    finalResult: (parsed.finalResult as BuildGuide["finalResult"]) ?? { description: "", screenshotPlaceholder: "" },
    steps,
    checkpoints,
    summary: (parsed.summary as BuildGuide["summary"]) ?? {
      whatWasBuilt: "", techniquesLearned: [], keyTakeaways: [], relatedTechniques: [], suggestedNextLessons: [],
    },
    tags: (parsed.tags as string[]) ?? [],
  };
}

function tryFixJson(raw: string): Record<string, unknown> | null {
  // Strip markdown fences
  let s = raw.trim();
  if (s.startsWith("```")) s = s.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  const start = s.indexOf("{");
  if (start > 0) s = s.slice(start);

  try { return JSON.parse(s); } catch { /* try repair */ }

  // Repair unbalanced braces
  const open = (s.match(/\{/g) ?? []).length;
  const close = (s.match(/\}/g) ?? []).length;
  if (open > close) {
    try { return JSON.parse(s + "}".repeat(open - close)); } catch { /* fall through */ }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body: GenerateRequest = await req.json();
  const { videoUrl, videoTitle, topic, inputType } = body;
  let { transcript } = body;

  const isTopic = inputType === "topic" || !!topic;

  if (!isTopic && !videoUrl) {
    return new Response(
      JSON.stringify({ success: false, error: "videoUrl is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(sseEvent(data));

      try {
        let prompt: string;

        if (isTopic) {
          // ── Topic mode — generate content from AI knowledge ──────────────
          send({ type: "status", message: "Designing your learning guide…" });
          prompt = topicGuidePrompt(topic ?? videoUrl ?? "Blender basics");
        } else {
          // ── Tutorial mode — reconstruct from transcript ─────────────────
          if (!transcript || transcript.trim().length < 50) {
            send({ type: "status", message: "Fetching transcript…" });
            try {
              transcript = await fetchTranscript(videoUrl!);
            } catch {
              send({ type: "error", error: "Could not auto-fetch transcript. Please paste it manually." });
              controller.close();
              return;
            }
          }
          send({ type: "status", message: "Analysing tutorial structure…" });
          prompt = buildGuidePrompt(transcript!, videoTitle ?? videoUrl!);
        }

        // ── Stream Claude response ─────────────────────────────────────────
        let fullText = "";
        let chunkCount = 0;

        const tutorialMessages = [
          "Reconstructing steps from transcript…",
          "Extracting exact settings and values…",
          "Writing action instructions…",
          "Identifying checkpoints…",
          "Adding tips and common mistakes…",
          "Finalising the build guide…",
        ];
        const topicMessages = [
          "Researching the topic…",
          "Planning the learning steps…",
          "Writing detailed instructions…",
          "Adding settings and shortcuts…",
          "Building checkpoints…",
          "Finalising your guide…",
        ];
        const statusMessages = isTopic ? topicMessages : tutorialMessages;

        const anthropicStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 32000,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const chunk of anthropicStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            fullText += chunk.delta.text;
            chunkCount++;
            if (chunkCount % 50 === 0) {
              const idx = Math.min(Math.floor(chunkCount / 100), statusMessages.length - 1);
              send({ type: "status", message: statusMessages[idx] });
            }
          }
        }

        // ── Parse AI output ────────────────────────────────────────────────
        send({ type: "status", message: "Processing guide…" });

        const parsed = tryFixJson(fullText);
        if (!parsed) {
          send({ type: "error", error: "AI response could not be parsed. Please try again." });
          controller.close();
          return;
        }

        const videoId = isTopic ? null : extractVideoId(videoUrl ?? "");
        const resolvedUrl = isTopic ? `topic://${encodeURIComponent(topic ?? "")}` : videoUrl!;
        const guide = buildGuideFromParsed(parsed, resolvedUrl, videoId);

        // ── Emit metadata immediately so client can show the guide shell ───
        send({
          type: "meta",
          title: guide.title,
          description: guide.description,
          stepCount: guide.steps.length,
          difficulty: guide.difficulty,
          software: guide.software,
          estimatedTime: guide.estimatedTime,
        });

        // ── Stream individual steps ────────────────────────────────────────
        for (const step of guide.steps) {
          send({ type: "step", step });
        }

        // ── Stream checkpoints ─────────────────────────────────────────────
        for (const checkpoint of guide.checkpoints) {
          send({ type: "checkpoint", checkpoint });
        }

        // ── Final complete event with full guide ───────────────────────────
        send({ type: "complete", studyPack: guide });
        controller.close();

      } catch (err) {
        send({ type: "error", error: err instanceof Error ? err.message : "Unknown error" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
