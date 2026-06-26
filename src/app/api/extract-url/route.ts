// POST /api/extract-url
// Fetches a URL and extracts its readable text content.

import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const maxDuration = 30;

// Selectors to strip from the DOM before extracting text
const NOISE_SELECTORS = [
  "script", "style", "noscript", "nav", "header", "footer",
  "aside", "[role='navigation']", "[role='banner']", "[role='contentinfo']",
  ".cookie", ".popup", ".modal", ".ad", ".advertisement",
];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { url } = body as { url?: string };

  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ success: false, error: "A valid URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VisualStudyAI/1.0; +https://visualstudy.ai)",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Could not fetch page (HTTP ${response.status}). The site may block automated requests.`,
      }, { status: 422 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Strip noise
    $(NOISE_SELECTORS.join(", ")).remove();

    // Extract title
    const pageTitle = $("title").first().text().trim()
      || $("h1").first().text().trim()
      || url;

    // Extract readable text — prefer article/main content
    const contentSelectors = ["article", "main", "[role='main']", ".content", ".post", "body"];
    let text = "";
    for (const sel of contentSelectors) {
      const el = $(sel).first();
      if (el.length) {
        text = el.text();
        if (text.trim().length > 200) break;
      }
    }
    if (!text.trim()) text = $("body").text();

    // Clean whitespace
    text = text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();

    if (text.length < 100) {
      return NextResponse.json({
        success: false,
        error: "Could not extract enough content from this page.",
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      text: text.slice(0, 30000), // cap at 30k chars
      title: pageTitle,
      url,
      characterCount: text.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: `Failed to fetch URL: ${msg}` }, { status: 500 });
  }
}
