// POST /api/extract-pdf
// Accepts a PDF file as multipart/form-data and extracts its text content.

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });

  if (!file.name.match(/\.pdf$/i) && file.type !== "application/pdf") {
    return NextResponse.json({ success: false, error: "File must be a PDF" }, { status: 415 });
  }

  const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ success: false, error: "PDF too large (max 50 MB)" }, { status: 413 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    const text = data.text?.trim() ?? "";

    if (text.length < 50) {
      return NextResponse.json({
        success: false,
        error: "Could not extract readable text from this PDF. It may be a scanned image.",
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      text,
      pageCount: data.numpages,
      title: data.info?.Title || file.name.replace(/\.pdf$/i, ""),
      characterCount: text.length,
    });
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json({ success: false, error: "Failed to parse PDF" }, { status: 500 });
  }
}
