export function buildStudyPackPrompt(transcript: string, videoUrl: string, videoTitle?: string): string {
  const trimmed = transcript.slice(0, 14000);

  return `You are an expert visual educational designer. Transform this transcript into a richly structured visual study pack JSON.

VIDEO URL: ${videoUrl}
VIDEO TITLE: ${videoTitle || "Unknown"}

TRANSCRIPT:
${trimmed}

---

Return ONLY a valid JSON object. No markdown fences. No extra text before or after.

{
  "overview": {
    "videoTitle": string,
    "mainTopic": string,
    "difficulty": "Beginner" | "Intermediate" | "Advanced" | "Expert",
    "estimatedLearningTime": string,
    "prerequisites": string[],
    "learningObjectives": string[],
    "summary": string,
    "category": string
  },

  "diagram": {
    "title": string,
    "nodes": string[],
    "description": string
  },

  "concepts": [
    {
      "id": string (kebab-case),
      "number": number,
      "name": string,
      "icon": string (single emoji),
      "color": "yellow" | "blue" | "green" | "red" | "purple",
      "beginnerExplanation": string (explain like the reader is 12),
      "whyItExists": string (what problem does this solve),
      "whatHappens": string (what happens when you use it),
      "whenToUse": string (specific situation),
      "realWorldExample": string (concrete practical example),
      "commonMistake": string (one specific mistake beginners make),
      "proTip": string (one expert insight),
      "screenshotPlaceholder": string (vivid description: what the screenshot shows, what UI elements are visible, what is highlighted),
      "callouts": [
        { "type": "tip" | "warning" | "important" | "best-practice" | "remember" | "result", "text": string }
      ],
      "settings": [
        { "name": string, "value": string, "note": string, "color": "yellow" | "blue" | "green" | "red" }
      ]
    }
  ],

  "steps": [
    {
      "id": string,
      "number": number,
      "title": string,
      "explanation": string,
      "whyItMatters": string,
      "expectedResult": string,
      "mistakesToAvoid": string[],
      "tips": string[],
      "screenshotPlaceholder": string (vivid description of what the screenshot shows at this step),
      "callout": { "type": "tip" | "warning" | "important" | "best-practice" | "remember" | "result", "text": string }
    }
  ],

  "beforeAfter": [
    {
      "label": string,
      "before": { "description": string, "screenshotPlaceholder": string },
      "after":  { "description": string, "screenshotPlaceholder": string }
    }
  ],

  "cheatSheet": {
    "definitions": [{ "term": string, "definition": string }],
    "importantSettings": [{ "name": string, "value": string, "note": string }],
    "keyboardShortcuts": [{ "key": string, "action": string }],
    "workflow": string[],
    "bestPractices": string[],
    "commonPitfalls": string[],
    "memoryTricks": string[]
  },

  "quiz": {
    "questions": [
      {
        "id": string,
        "type": "multiple-choice" | "true-false" | "fill-blank" | "short-answer",
        "question": string,
        "options": string[],
        "answer": string,
        "explanation": string
      }
    ],
    "flashcards": [{ "id": string, "front": string, "back": string }]
  },

  "tags": string[]
}

RULES:
- concepts: 6–10 items. Assign colors: yellow=core concepts, blue=tips/tools, green=results/outputs, red=warnings/errors, purple=advanced.
- screenshotPlaceholder for EVERY concept and step — be vivid and specific (mention exact UI elements, menus, panels, node names, button locations).
- diagram.nodes: ordered list showing the main workflow/pipeline (e.g. ["Cube", "Transform Node", "Instance on Points", "Join Geometry", "Output"]).
- beforeAfter: 1–3 pairs showing clear visual transformations (only if the content has before/after moments).
- callouts: 1–2 per concept, 1 per step. Mix types — don't only use "tip".
- settings: include for concepts that involve specific values, sliders, or parameters.
- steps: 5–8 items. Each step must have a screenshotPlaceholder and a callout.
- quiz: 6 questions (mix types) + 6 flashcards.
- cheatSheet: 4–6 items per field. One sentence max per item.
- learningObjectives: 4–5 items, start with action verbs.
- Return ONLY the JSON. Nothing before it, nothing after it.`;
}
