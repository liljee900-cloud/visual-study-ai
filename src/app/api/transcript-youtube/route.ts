import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

// ── InnerTube clients to try in order ─────────────────────────────────────────
const CLIENTS = [
  {
    name: "ANDROID",
    version: "20.10.38",
    ua: "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
  },
  {
    name: "IOS",
    version: "19.29.1",
    ua: "com.google.ios.youtube/19.29.1 (iPhone14,3; U; CPU iOS 16_6 like Mac OS X)",
  },
  {
    name: "WEB",
    version: "2.20240801.00.00",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  },
] as const;

type CaptionTrack = { baseUrl: string; languageCode: string; kind?: string };

// ── Extract video ID ─────────────────────────────────────────────────────────
function extractVideoId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m?.[1] ?? null;
}

// ── Decode HTML entities ─────────────────────────────────────────────────────
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

// ── Parse caption XML → plain text ─────────────────────────────────────────
function parseCaptionXml(xml: string): string {
  const parts: string[] = [];

  // timedtext v3 format: <p t="ms" d="ms"><s>word</s></p>
  const pRe = /<p\s+t="\d+"[^>]*>([\s\S]*?)<\/p>/g;
  let m: RegExpExecArray | null;
  while ((m = pRe.exec(xml)) !== null) {
    const text = decodeEntities(m[1].replace(/<[^>]+>/g, "").trim());
    if (text) parts.push(text);
  }
  if (parts.length) return parts.join(" ");

  // classic format: <text start="s" dur="s">content</text>
  const tRe = /<text[^>]*>([\s\S]*?)<\/text>/g;
  while ((m = tRe.exec(xml)) !== null) {
    const text = decodeEntities(m[1].replace(/<[^>]+>/g, "").trim());
    if (text) parts.push(text);
  }
  return parts.join(" ");
}

// ── Fetch caption XML from a base URL ────────────────────────────────────────
async function fetchCaptionXml(
  baseUrl: string,
  videoId: string
): Promise<string | null> {
  const headerSets: Record<string, string>[] = [
    {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Referer": `https://www.youtube.com/watch?v=${videoId}`,
      "Accept-Language": "en-US,en;q=0.9",
    },
    { "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)" },
    {},
  ];
  for (const headers of headerSets) {
    try {
      const r = await fetch(baseUrl, { headers });
      if (!r.ok) continue;
      const text = await r.text();
      if (text && text.length > 10) return text;
    } catch {
      continue;
    }
  }
  return null;
}

// ── Get caption tracks via InnerTube ─────────────────────────────────────────
async function getTracksViaInnerTube(videoId: string): Promise<CaptionTrack[] | null> {
  for (const client of CLIENTS) {
    try {
      const res = await fetch(
        "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": client.ua,
          },
          body: JSON.stringify({
            context: {
              client: { clientName: client.name, clientVersion: client.version },
            },
            videoId,
          }),
        }
      );
      if (!res.ok) continue;
      const data = await res.json();

      // Check for playability
      const status = data?.playabilityStatus?.status;
      if (status === "ERROR" || status === "UNPLAYABLE") continue;

      const tracks: CaptionTrack[] =
        data?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
      if (tracks.length > 0) return tracks;
    } catch {
      continue;
    }
  }
  return null;
}

// ── Get caption tracks via page scraping ─────────────────────────────────────
async function getTracksViaPageScrape(videoId: string): Promise<CaptionTrack[] | null> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    if (html.includes('class="g-recaptcha"')) return null; // rate-limited

    // Find ytInitialPlayerResponse
    const jsonStart = html.indexOf("var ytInitialPlayerResponse = ");
    if (jsonStart === -1) return null;
    const start = jsonStart + "var ytInitialPlayerResponse = ".length;
    let depth = 0;
    let end = start;
    for (let i = start; i < html.length; i++) {
      if (html[i] === "{") depth++;
      else if (html[i] === "}") {
        depth--;
        if (depth === 0) { end = i + 1; break; }
      }
    }
    const pr = JSON.parse(html.slice(start, end));
    const tracks: CaptionTrack[] =
      pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
    return tracks.length > 0 ? tracks : null;
  } catch {
    return null;
  }
}

// ── Pick the best track ───────────────────────────────────────────────────────
function pickTrack(tracks: CaptionTrack[]): CaptionTrack {
  // Prefer manual English, then ASR English, then first available
  return (
    tracks.find((t) => t.languageCode === "en" && !t.kind) ??
    tracks.find((t) => t.languageCode === "en") ??
    tracks[0]
  );
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: { videoUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const videoId = extractVideoId(body.videoUrl ?? "");
  if (!videoId) {
    return NextResponse.json(
      { success: false, error: "Not a valid YouTube URL", unavailable: true },
      { status: 400 }
    );
  }

  // Strategy 1: InnerTube (multi-client)
  let tracks = await getTracksViaInnerTube(videoId);

  // Strategy 2: Page scrape fallback
  if (!tracks) {
    tracks = await getTracksViaPageScrape(videoId);
  }

  if (!tracks) {
    return NextResponse.json({
      success: false,
      error: "This video has no captions or transcript available.",
      unavailable: true,
    });
  }

  const track = pickTrack(tracks);
  const xml = await fetchCaptionXml(track.baseUrl, videoId);

  if (!xml) {
    return NextResponse.json({
      success: false,
      error: "Found captions but could not download them. Please paste manually.",
      unavailable: false,
    });
  }

  const transcript = parseCaptionXml(xml).trim();
  if (!transcript) {
    return NextResponse.json({
      success: false,
      error: "Captions were empty. Please paste the transcript manually.",
      unavailable: true,
    });
  }

  return NextResponse.json({
    success: true,
    transcript,
    videoId,
    lang: track.languageCode,
    isAsr: track.kind === "asr",
  });
}
