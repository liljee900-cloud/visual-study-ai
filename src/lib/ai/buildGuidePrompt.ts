import type { BuildGuide } from "@/lib/types/buildGuide";

export function buildGuidePrompt(transcript: string, sourceTitle: string): string {
  // Use up to 18k chars — enough for a 30-60 min tutorial transcript
  const trimmed = transcript.slice(0, 18000);
  const now = new Date().toISOString();

  return `You are a senior instructional designer and domain expert. Your task is to reconstruct a tutorial as a COMPLETE, FAITHFUL step-by-step instruction manual from the transcript below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECONSTRUCTION RULES — FOLLOW EXACTLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE 1 — COUNT ACTIONS, NOT MINUTES
Count every distinct action the instructor performs: adds a node, changes a value, presses a shortcut, clicks a button, adjusts a setting, enables a toggle, renames an object. Each action = one step.
If the instructor performs 55 actions → create 55 steps.
If the instructor performs 70 actions → create 70 steps.
NEVER collapse multiple actions into one step unless they are truly inseparable (e.g., "position X/Y/Z" can be one step).

RULE 2 — ZERO SUMMARIZATION
Do NOT write "Then set up the shader nodes" as one step. That is 5–10 individual steps.
Do NOT write "Configure the material settings." That is multiple steps.
Every add, every value change, every connection, every shortcut = its own step.

RULE 3 — EXACT VALUES ALWAYS
When the instructor says any number, capture it exactly:
- "set the scale to point two five" → value: "0.25"
- "I'll use three subdivisions" → value: "3"
- "seed of forty-two" → value: "42"
- "around negative zero point eight" → value: "-0.8"
Never approximate. Never say "adjust the value." Never say "set to a low number."

RULE 4 — PRECISE CLICK LOCATIONS
For every step, state WHERE in the UI to click:
- "Click the + Add button in the Properties panel header"
- "Right-click anywhere in the Shader Editor node canvas"
- "Click the dropdown arrow next to 'Surface' in the Principled BSDF"
- "Hover over the 3D Viewport and press Shift+A"
Never just say "add a node" without saying where and how.

RULE 5 — FAITHFUL ORDERING
Steps MUST follow the tutorial in chronological order. Never reorganize.

RULE 6 — SCREENSHOT DESCRIPTIONS ARE VIVID AND SPECIFIC
Each screenshotPlaceholder must describe what is ACTUALLY VISIBLE on screen at that exact moment:
- WRONG: "The node graph with some nodes"
- RIGHT: "Shader Editor showing a Principled BSDF node connected to a Material Output node. The Base Color socket glows orange indicating it has an incoming connection. The Properties panel on the right shows the material named 'Rock_Surface'."
Include: which editor is active, what's visible, what's selected/highlighted, what panels are open, what values are visible in the UI.

RULE 7 — CHECKPOINTS EVERY 8-12 STEPS
After every logical section (basic mesh done, materials set up, modifiers applied, final render, etc.) insert a checkpoint. Title it after what was just accomplished.

RULE 8 — SOURCE TYPE DETECTION
If the source is a video tutorial → reconstruct every instructor action.
If the source is a PDF/document → extract every instructional step from the text.
If the source is a URL/webpage → extract every procedural step.
In all cases: preserve the original teaching sequence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOURCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Title: ${sourceTitle}

Content:
${trimmed}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY a single valid JSON object — no markdown fences, no explanation text before or after.

{
  "id": "${crypto.randomUUID ? crypto.randomUUID() : 'guide-' + Date.now()}",
  "createdAt": "${now}",
  "videoUrl": "${sourceTitle}",
  "version": "2.0",
  "title": "Concise tutorial title derived from the content (not generic)",
  "description": "1–2 sentences describing exactly what gets built or learned",
  "software": "Exact software name and version if mentioned, e.g. 'Blender 4.2'",
  "difficulty": "Beginner | Intermediate | Advanced",
  "estimatedTime": "E.g. '45 minutes' — estimate from content length",
  "prerequisites": ["What the learner needs to already know"],
  "finalResult": {
    "description": "What the finished project looks, feels, and behaves like",
    "screenshotPlaceholder": "Vivid description of the final render/viewport showing the completed work with specific visual details"
  },
  "steps": [
    {
      "id": "step-1",
      "number": 1,
      "title": "Short imperative title — e.g. 'Add Subdivision Surface Modifier' or 'Set Base Color to Dark Grey'",
      "editor": "Active editor — '3D Viewport' | 'Shader Editor' | 'Properties' | 'Geometry Node Editor' | 'UV Editor' | 'Compositor' | etc.",
      "panel": "Specific panel or tab if relevant — 'Modifier Properties' | 'Object Properties' | etc.",
      "action": "Primary instruction — clear, direct, imperative. Exactly what to do. Include the specific UI element, its location, and what to do with it.",
      "shortcut": "Keyboard shortcut used at this step, or null",
      "menuPath": "Full menu path if a menu was used — e.g. 'Add → Texture → Noise Texture', or null",
      "whereToClick": "Precise location in the UI — e.g. 'Click the wrench icon (Modifier Properties) in the right Properties panel', or null",
      "settings": [
        {
          "name": "Exact setting name as shown in the UI",
          "value": "Exact value — numeric, boolean (True/False), or enum string",
          "unit": "Unit if applicable — 'm', '°', '%', 'px', or null",
          "note": "Brief note on what this setting controls, or null"
        }
      ],
      "connections": [
        {
          "from": "Source node name → Output socket name",
          "to": "Target node name → Input socket name",
          "note": "Optional note on why this connection matters"
        }
      ],
      "purpose": "Why this step matters — what it achieves in the final result. 1–2 sentences.",
      "expectedResult": "Describe exactly what the user should see on screen after completing this step. Be specific about visual feedback.",
      "commonMistakes": ["Specific mistake beginners make at this exact step — be precise"],
      "tips": ["Actionable pro tip relevant to this specific step"],
      "screenshotPlaceholder": "Vivid, specific description of the screen state at this exact moment. Include the editor visible, what is selected, what values are shown, what has changed.",
      "sideNote": null
    }
  ],
  "checkpoints": [
    {
      "id": "checkpoint-1",
      "afterStep": 10,
      "title": "Section milestone name — e.g. 'Base Mesh Complete'",
      "description": "What the project looks like at this point in the tutorial",
      "screenshotPlaceholder": "Vivid description of the current project state at this checkpoint",
      "verificationPoints": [
        "Specific thing to visually verify is correct"
      ],
      "commonIssues": [
        {
          "issue": "Specific problem a learner might have at this checkpoint",
          "fix": "Exact fix for that specific problem"
        }
      ]
    }
  ],
  "summary": {
    "whatWasBuilt": "2–3 sentences describing the completed project in detail",
    "techniquesLearned": ["Specific named technique used in this tutorial"],
    "keyTakeaways": ["Most important insight or workflow pattern from this tutorial"],
    "relatedTechniques": ["Similar technique worth exploring after this one"],
    "suggestedNextLessons": ["Logical next tutorial or topic to learn"]
  },
  "tags": ["lowercase", "topic", "tags"]
}`;
}

export function isBuildGuide(data: unknown): data is BuildGuide {
  return typeof data === "object" && data !== null && (data as Record<string, unknown>).version === "2.0";
}
