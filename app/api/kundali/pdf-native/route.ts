import { NextRequest, NextResponse } from "next/server";
import { buildKundliPdfBytes, type KundliLang } from "@/lib/kundliPdfClient";

/**
 * POST /api/kundali/pdf-native — additive pdfnative renderer.
 *
 * This route is intentionally separate from the existing `/api/kundali/pdf`
 * (@react-pdf/renderer) route and does not touch it. pdfnative is a
 * Node-targeted library (its bundle contains a literal `await import('fs')`),
 * so it can only be executed on the server. The client button posts the
 * already-fetched kundli payload here and streams back the PDF bytes.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "A JSON body is required" }, { status: 400 });
    }

    const rawLang = typeof body.lang === "string" ? body.lang.trim().toLowerCase() : "en";
    const lang: KundliLang = rawLang === "hi" ? "hi" : "en";
    const kundliData = (body as { kundliData?: unknown }).kundliData;

    if (!kundliData || typeof kundliData !== "object") {
      return NextResponse.json({ error: "kundliData is required" }, { status: 400 });
    }

    const bytes = await buildKundliPdfBytes(kundliData, lang);

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="kundli-report-native.pdf"',
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[kundali/pdf-native] PDF generation failed:", error);
    const message = error instanceof Error ? error.message : "Failed to render kundli PDF";
    return NextResponse.json(
      { error: `Failed to render kundli PDF: ${message}` },
      { status: 500 }
    );
  }
}
