import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { NODE_INDEX } from "@/lib/blender/nodes";
import { BLENDER_CATEGORIES } from "@/lib/blender/categories";

export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function sseEvent(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(req: NextRequest) {
  const { topic } = await req.json();

  if (!topic?.trim()) {
    return new Response(JSON.stringify({ error: "Topic is required" }), { status: 400 });
  }

  // Build context from our node library
  const nodeContext = NODE_INDEX.slice(0, 60).map(n =>
    `- ${n.name} (${n.category}): ${n.description}`
  ).join("\n");

  const categoryContext = BLENDER_CATEGORIES.map(c => `- ${c.name}: ${c.description}`).join("\n");

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(sseEvent(data));

      try {
        send({ type: "status", message: "Understanding your topic..." });

        const prompt = `You are a Blender expert and visual educator. A user wants to learn about this topic in Blender:

TOPIC: "${topic}"

Available nodes in our library:
${nodeContext}

Available categories:
${categoryContext}

Generate a complete visual lesson plan as a JSON object with this structure:

{
  "title": string (engaging lesson title),
  "subtitle": string (one sentence description),
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedTime": string,
  "summary": string (2-3 sentences explaining what they'll learn),
  "whatYoullBuild": string (describe the end result),
  "prerequisiteTopics": string[],
  "learningPath": [
    {
      "phase": number,
      "title": string,
      "description": string,
      "relevantNodes": string[],
      "relevantCategories": string[],
      "keySteps": string[],
      "screenshotDescription": string
    }
  ],
  "keyNodes": [
    {
      "nodeId": string (must match an id from available nodes above),
      "name": string,
      "whyNeeded": string
    }
  ],
  "workflowDiagram": {
    "title": string,
    "nodes": string[]
  },
  "tips": string[],
  "commonChallenges": string[],
  "practiceProjects": [
    { "title": string, "description": string, "difficulty": string }
  ],
  "nextTopicsToLearn": string[]
}

RULES:
- learningPath: 3-5 phases taking the user from zero to the completed result
- keyNodes: only reference nodeIds that exist in the available nodes list
- workflowDiagram.nodes: the actual Blender node sequence for this specific task (5-8 nodes)
- tips: 4-6 practical tips specific to this exact topic
- practiceProjects: 3 projects from easy to hard
- Be specific to "${topic}" — not generic Blender advice
- Return ONLY valid JSON, no markdown fences`;

        let fullText = "";
        const anthropicStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 8000,
          messages: [{ role: "user", content: prompt }],
        });

        send({ type: "status", message: "Building your lesson plan..." });

        for await (const chunk of anthropicStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            fullText += chunk.delta.text;
          }
        }

        let raw = fullText.trim();
        if (raw.startsWith("```")) raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

        const lesson = JSON.parse(raw);
        send({ type: "complete", lesson });
        controller.close();
      } catch (err) {
        send({ type: "error", error: err instanceof Error ? err.message : "Generation failed" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
