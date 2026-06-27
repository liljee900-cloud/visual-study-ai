// AssemblyAI transcription client
// Free tier: 100 hours/month — https://www.assemblyai.com

const BASE = "https://api.assemblyai.com/v2";

function authHeader(): Record<string, string> {
  const key = process.env.ASSEMBLYAI_API_KEY;
  if (!key) throw new Error("ASSEMBLYAI_API_KEY is not set");
  return { authorization: key };
}

export interface TranscriptWord {
  text: string;
  start: number; // ms
  end: number;   // ms
  confidence: number;
}

export interface TranscriptResult {
  id: string;
  status: "queued" | "processing" | "completed" | "error";
  text?: string;
  words?: TranscriptWord[];
  error?: string;
  audio_duration?: number; // seconds
}

/** Upload a file buffer and return a hosted URL for AssemblyAI to pull from */
export async function uploadAudio(buffer: Buffer): Promise<string> {
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: {
      ...authHeader(),
      "Content-Type": "application/octet-stream",
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AssemblyAI upload failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  if (!data.upload_url) throw new Error("No upload_url returned from AssemblyAI");
  return data.upload_url as string;
}

/** Submit a transcription job given a hosted audio URL */
export async function submitTranscription(audioUrl: string): Promise<string> {
  const res = await fetch(`${BASE}/transcript`, {
    method: "POST",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      punctuate: true,
      format_text: true,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AssemblyAI submit failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  if (!data.id) throw new Error("No transcript ID returned from AssemblyAI");
  return data.id as string;
}

/** Poll a transcript job by ID */
export async function getTranscript(jobId: string): Promise<TranscriptResult> {
  const res = await fetch(`${BASE}/transcript/${jobId}`, {
    headers: authHeader(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AssemblyAI poll failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  return {
    id: data.id,
    status: data.status,
    text: data.text ?? undefined,
    words: data.words ?? undefined,
    error: data.error ?? undefined,
    audio_duration: data.audio_duration ?? undefined,
  };
}

/** Format ms timestamp → HH:MM:SS or MM:SS */
export function msToTimestamp(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Group words into paragraphs (~30s chunks) with timestamps */
export function wordsToTimestampedText(words: TranscriptWord[]): string {
  if (!words.length) return "";
  const CHUNK_MS = 30_000;
  const chunks: string[] = [];
  let chunkStart = words[0].start;
  let currentChunk: string[] = [];

  for (const word of words) {
    if (word.start - chunkStart >= CHUNK_MS && currentChunk.length > 0) {
      chunks.push(`[${msToTimestamp(chunkStart)}] ${currentChunk.join(" ")}`);
      chunkStart = word.start;
      currentChunk = [];
    }
    currentChunk.push(word.text);
  }
  if (currentChunk.length) {
    chunks.push(`[${msToTimestamp(chunkStart)}] ${currentChunk.join(" ")}`);
  }
  return chunks.join("\n\n");
}
