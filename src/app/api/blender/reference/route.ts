import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 180;

const anthropic = new Anthropic();

function buildPrompt(type: string, name: string, category?: string): string {
  const categoryHint = category ? ` in the ${category} category` : "";

  if (type === "node") {
    return `You are a Blender expert. Generate a complete JSON reference page for the Blender node named "${name}"${categoryHint}.

Return ONLY valid JSON matching this exact structure:
{
  "id": "${name.toLowerCase().replace(/\s+/g, "-")}",
  "name": "${name}",
  "category": "${category ?? "geometry-nodes"}",
  "subcategory": "string",
  "icon": "single emoji",
  "color": "yellow|blue|green|red|purple|orange",
  "description": "one sentence",
  "whyItExists": "one to two sentences",
  "whenToUse": "one to two sentences",
  "inputs": [{"name":"..","type":"Geometry|Float|Integer|Boolean|Vector|Color|String|Shader|Material|Object|Collection","description":"..","default":".."}],
  "outputs": [{"name":"..","type":"..","description":".."}],
  "beginnerExplanation": "simple explanation for a beginner",
  "advancedExplanation": "technical explanation for advanced users",
  "commonUseCases": ["use case 1","use case 2","use case 3","use case 4"],
  "typicalConnections": ["Step 1: description","Step 2: description","Step 3: description"],
  "exampleWorkflow": "step by step workflow string",
  "commonMistakes": ["mistake 1","mistake 2","mistake 3"],
  "performanceTips": ["tip 1","tip 2"],
  "relatedNodes": [],
  "frequentlyUsedWith": [],
  "screenshotPlaceholder": "detailed description of what the Blender node interface looks like",
  "quiz": [{"question":"..","answer":".."},{"question":"..","answer":".."}],
  "practiceExercise": "a short practice task for learning this node",
  "blenderVersion": "3.0",
  "tags": ["tag1","tag2","tag3","tag4","tag5"]
}`;
  }

  if (type === "modifier") {
    return `You are a Blender expert. Generate a complete JSON reference page for the Blender modifier named "${name}"${categoryHint}.

Return ONLY valid JSON matching this exact structure:
{
  "id": "${name.toLowerCase().replace(/\s+/g, "-")}",
  "name": "${name}",
  "category": "${category ?? "generate"}",
  "icon": "single emoji",
  "color": "yellow|blue|green|red|purple|orange",
  "blenderVersion": "2.8",
  "description": "one sentence",
  "whyItExists": "one to two sentences",
  "whenToUse": "one to two sentences",
  "beginnerExplanation": "simple explanation",
  "advancedExplanation": "technical explanation",
  "parameters": [{"name":"..","type":"float|int|bool|enum|object","default":"..","range":"..","description":".."}],
  "commonUseCases": ["use case 1","use case 2","use case 3"],
  "exampleWorkflow": "step by step string",
  "commonMistakes": ["mistake 1","mistake 2"],
  "performanceTips": ["tip 1"],
  "relatedModifiers": [],
  "screenshotPlaceholder": "description of the Blender Properties panel showing this modifier",
  "quiz": [{"question":"..","answer":".."}],
  "practiceExercise": "short task",
  "tags": ["tag1","tag2","tag3","tag4"]
}`;
  }

  if (type === "editor") {
    return `You are a Blender expert. Generate a complete JSON reference page for the Blender editor/workspace named "${name}"${categoryHint}.

Return ONLY valid JSON matching this exact structure:
{
  "id": "${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}",
  "name": "${name}",
  "icon": "single emoji",
  "color": "yellow|blue|green|red|purple|orange",
  "description": "one sentence",
  "purpose": "one to two sentences",
  "whatYouCanDo": ["action 1","action 2","action 3","action 4"],
  "keyAreas": [{"name":"..","location":"..","description":".."}],
  "beginnerExplanation": "simple explanation",
  "advancedExplanation": "technical explanation",
  "commonWorkflows": ["workflow 1","workflow 2"],
  "shortcuts": [{"key":"..","action":".."}],
  "tips": ["tip 1","tip 2"],
  "commonMistakes": ["mistake 1"],
  "relatedEditors": [],
  "screenshotPlaceholder": "description of what this editor looks like in Blender",
  "tags": ["tag1","tag2","tag3"]
}`;
  }

  // generic tool/feature
  return `You are a Blender expert. Generate a complete JSON reference explaining the Blender ${type} named "${name}"${categoryHint}.

Return ONLY valid JSON with fields: id, name, type, icon, color (yellow/blue/green/red/purple/orange), description, purpose, beginnerExplanation, advancedExplanation, howToAccess, keyShortcuts (array of {key, action}), commonUseCases (array), tips (array), commonMistakes (array), tags (array).`;
}

export async function POST(req: Request) {
  try {
    const { type, name, category, context } = await req.json();

    if (!type || !name) {
      return new Response(JSON.stringify({ error: "type and name are required" }), { status: 400 });
    }

    const prompt = buildPrompt(type, name, category);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          send({ type: "status", message: `Generating ${name} reference…` });

          let full = "";
          const aiStream = await anthropic.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 4000,
            messages: [{ role: "user", content: prompt + (context ? `\n\nExtra context: ${context}` : "") }],
          });

          for await (const chunk of aiStream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              full += chunk.delta.text;
            }
          }

          const match = full.match(/\{[\s\S]*\}/);
          if (!match) throw new Error("No JSON found in AI response");

          const reference = JSON.parse(match[0]);
          send({ type: "complete", reference });
        } catch (err) {
          send({ type: "error", error: err instanceof Error ? err.message : "Generation failed" });
        } finally {
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
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }
}
