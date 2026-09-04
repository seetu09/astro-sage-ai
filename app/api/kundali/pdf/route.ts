import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import type { PdfData, ReportData, ReportNarrative } from "@/lib/pdfHtmlTemplate";
import { generatePdfHtml } from "@/lib/pdfHtmlTemplate";
import { verifyUnlockToken } from "@/lib/paymentUnlock";
import { renderPdfFromHtml } from "html-pdf-lite";
import path from "path";

/**
 * POST /api/kundali/pdf — Vercel serverless "Download Full 25-Page Kundli".
 *
 * Renders the localized A4 report (deterministic chart data + AI Life-Pillar
 * narratives) through `html-pdf-lite` (PDFKit-based, NO Chromium) and streams
 * the PDF back as an attachment download.
 *
 * ─── Why html-pdf-lite instead of puppeteer-core + @sparticuz/chromium-min ─
 * Chromium-based rendering needed a ~70 MB (compressed) browser tarball
 * downloaded from a CDN into /tmp on every cold start, which regularly blew
 * past Vercel's function limits and produced "Print Server Failed". The
 * PDFKit renderer here is pure JS, has no binary download, and starts in
 * ~100 ms — a 25-page report renders well under 10 s cold.
 *
 * Devanagari (Hindi) and Latin text are covered by the Noto Sans /
 * Noto Sans Devanagari TTFs bundled in `public/fonts` and registered through
 * the `fonts` option (PDFKit has no web-font loading, so files must exist on
 * disk). `outputFileTracingIncludes` in next.config.js keeps them inside the
 * lambda on Vercel.
 *
 * Request body:
 *   {
 *     "reportData": ReportData,          // required — localized report payload
 *     "language":   "en" | "hi",         // defaults to "en"
 *     "pillars":    ReportNarrative[],   // optional AI Life-Pillar narratives
 *     "paymentToken": string,            // REQUIRED — signed unlock token from /api/payment/verify
 *     "fileName":   string              // optional download filename stem
 *   }
 *
 * Monetization: this route is a paid endpoint. It refuses requests without a
 * valid signed `paymentToken` (see `lib/paymentUnlock`) or without
 * `reportData.isPaidTier === true`, returning 402. Only server-verified
 * Razorpay payments can mint such a token, so spoofing localStorage flags
 * does not unlock the PDF.
 *
 * Response: application/pdf (Content-Disposition: attachment)
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Lang = "en" | "hi";

/**
 * Bundled PDF font — a single family covering BOTH Latin and Devanagari.
 * html-pdf-lite picks the first font-family in the CSS list and only falls
 * back to *system* fonts (absent on Vercel), so one script-complete face
 * (Mukta) is used everywhere instead of pairing Noto Sans (Latin) with
 * Noto Sans Devanagari.
 */
const FONTS_DIR = path.join(process.cwd(), "public", "fonts");
const PDF_FONTS: Record<
  string,
  { regular: string; bold: string; italic?: string; boldItalic?: string }
> = {
  Mukta: {
    regular: path.join(FONTS_DIR, "Mukta-Regular.ttf"),
    bold: path.join(FONTS_DIR, "Mukta-Bold.ttf"),
  },
};

function slugifyFileName(value: unknown): string {
  return String(value ?? "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .toLowerCase();
}

function sanitizeNarratives(input: unknown): ReportNarrative[] | undefined {
  if (!Array.isArray(input) || input.length === 0) return undefined;
  return input
    .filter((n): n is Record<string, unknown> => !!n && typeof n === "object")
    .slice(0, 8)
    .map((n, i) => ({
      key: String(n.key ?? `pillar-${i + 1}`),
      titleEn: String(n.titleEn ?? ""),
      titleHi: String(n.titleHi ?? ""),
      badges:
        n.badges && typeof n.badges === "object"
          ? {
              score: String((n.badges as Record<string, unknown>).score ?? ""),
              timeframe: String((n.badges as Record<string, unknown>).timeframe ?? ""),
              lord: String((n.badges as Record<string, unknown>).lord ?? ""),
            }
          : undefined,
      narrativeEn: String(n.narrativeEn ?? ""),
      narrativeHi: String(n.narrativeHi ?? ""),
      milestones: Array.isArray(n.milestones)
        ? (n.milestones as Record<string, unknown>[]).slice(0, 4).map((m) => ({
            period: String(m?.period ?? ""),
            event: String(m?.event ?? ""),
            note: m?.note ? String(m.note) : undefined,
            outcome:
              m?.outcome === "positive" || m?.outcome === "caution"
                ? m.outcome
                : ("neutral" as const),
          }))
        : [],
    }));
}



/**
 * Coerce a partially-filled client payload into the full ReportData shape.
 * Guards every array/object field the A4 template touches so a malformed or
 * trimmed request degrades to empty sections instead of a 500.
 */
function normalizeReportData(input: Partial<ReportData> | undefined): ReportData {
  const src = (input ?? {}) as Record<string, unknown>;
  const arr = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
  const birth = (src.birthDetails ?? {}) as Record<string, string>;

  console.log("[normalizeReportData] payload presence check:", {
    hasPanchang: !!src.panchang,
    hasD9Chart: !!src.d9Chart,
    hasSarvashtakavarga: !!src.sarvashtakavarga,
    hasNarratives: Array.isArray(src.narratives),
  });

  return {
    clientName: String(src.clientName ?? "User"),
    chartType: String(src.chartType ?? "North Indian"),
    birthDetails: {
      date: String(birth.date ?? ""),
      time: String(birth.time ?? ""),
      latitude: String(birth.latitude ?? ""),
      longitude: String(birth.longitude ?? ""),
      timezone: String(birth.timezone ?? ""),
    },
    planetaryPositions: arr<ReportData["planetaryPositions"][number]>(src.planetaryPositions),
    houseCusps: arr<ReportData["houseCusps"][number]>(src.houseCusps),
    dashaPeriods: arr<ReportData["dashaPeriods"][number]>(src.dashaPeriods),
    yogas: arr<ReportData["yogas"][number]>(src.yogas),
    remedies: arr<ReportData["remedies"][number]>(src.remedies),
    domainInsights: arr<ReportData["domainInsights"][number]>(src.domainInsights),
    northIndianChartSvg: String(src.northIndianChartSvg ?? ""),
    kalpurushaPhalDeepikaRefs: arr<ReportData["kalpurushaPhalDeepikaRefs"][number]>(
      src.kalpurushaPhalDeepikaRefs
    ),
    scorecard: arr<ReportData["scorecard"][number]>(src.scorecard),
    isPaidTier: src.isPaidTier === true,
    panchang: src.panchang as ReportData["panchang"],
    d9Chart: src.d9Chart as ReportData["d9Chart"],
    sarvashtakavarga: src.sarvashtakavarga as ReportData["sarvashtakavarga"],
    narratives: src.narratives as ReportData["narratives"],
    doshas: arr<ReportData["doshas"][number]>(src.doshas),
  };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit — PDF rendering is compute/IO heavy and PDFs are paid,
    // so throttle per IP (10 req / 120s / IP) to cap cost and abuse.
    const { allowed, retryAfter } = checkRateLimit(
      `kundali-pdf:${getClientIp(req)}`,
      10,
      120_000
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "A JSON body is required" }, { status: 400 });
    }

    const rawLang = typeof body.language === "string" ? body.language.trim().toLowerCase() : "en";
    const lang: Lang = rawLang === "hi" ? "hi" : "en";
    const incoming = body.reportData as ReportData | undefined;

    if (
      !incoming ||
      typeof incoming !== "object" ||
      !Array.isArray(incoming.planetaryPositions)
    ) {
      return NextResponse.json(
        { error: "A valid reportData payload is required to render the kundli PDF" },
        { status: 400 }
      );
    }

    // ── Strict monetization guard ────────────────────────────────────────────
    // Free users must never receive the full report: we require BOTH an
    // explicit paid-tier flag AND a server-verified signed payment token.
    if (incoming.isPaidTier !== true) {
      return NextResponse.json(
        { error: "This report is locked. Complete payment to unlock the full PDF." },
        { status: 402 }
      );
    }
    if (!verifyUnlockToken(body.paymentToken)) {
      return NextResponse.json(
        { error: "Payment verification required to download the full report." },
        { status: 402 }
      );
    }

    // Fill any missing sections with safe defaults before templating.
    const reportData = normalizeReportData(incoming);
    const narratives = sanitizeNarratives(body.pillars);

    // Build the rich PdfData payload — prefer the full report slice from the
    // generate endpoint when the client sends it, else fall back to the
    // flattened ReportData mapping.
    const isRichPayload = !!body.chartData || !!body.calculations;

    const pdfData: PdfData = isRichPayload
      ? {
          name: String(body.clientName ?? incoming.clientName ?? "User"),
          birthDate: String(body.birthDate ?? reportData.birthDetails?.date ?? ""),
          birthTime: String(body.birthTime ?? reportData.birthDetails?.time ?? ""),
          latitude: Number(body.latitude ?? (parseFloat(reportData.birthDetails?.latitude || "") || 0)),
          longitude: Number(body.longitude ?? (parseFloat(reportData.birthDetails?.longitude || "") || 0)),
          timezone: String(body.timezone ?? reportData.birthDetails?.timezone ?? ""),
          chartData: body.chartData ?? (incoming as any),
          calculations: body.calculations ?? (incoming as any)?.calculations ?? {},
          pillars: Array.isArray(body.pillars) ? body.pillars : (narratives || []),
          freeTier: typeof body.freeTier === "object" ? body.freeTier : {},
          paidTier: typeof body.paidTier === "object" ? body.paidTier : {},
        }
      : {
          name: reportData.clientName || "User",
          birthDate: reportData.birthDetails?.date || "",
          birthTime: reportData.birthDetails?.time || "",
          latitude: parseFloat(reportData.birthDetails?.latitude || "") || 0,
          longitude: parseFloat(reportData.birthDetails?.longitude || "") || 0,
          timezone: reportData.birthDetails?.timezone || "",
          chartData: {
            lagna: reportData.panchang?.lagna || "",
            rashi: reportData.panchang?.moonSign || "",
            moonSign: reportData.panchang?.moonSign || "",
            sunSign: reportData.panchang?.sunSign || "",
            planets: (reportData.planetaryPositions || []).map((p) => ({
              name: p.body,
              sign: p.sign,
              degree: p.degree,
              house: p.house,
              retrograde: Boolean(p.retro),
            })),
            houses: (reportData.houseCusps || []).map((h) => ({
              house: h.house,
              sign: h.sign,
            })),
          },
          calculations: {
            divisionalCharts: reportData.d9Chart ? {
              D9: {
                chartType: "D9",
                ascendantSign: reportData.d9Chart.ascendantSign || 1,
                ascendantDegree: 0,
                planetCoordinates: (reportData.d9Chart.planets || []).map((p) => ({
                  planet: p.planet,
                  sign: p.sign,
                  degree: 0,
                  minute: 0,
                  house: p.house,
                  retrograde: p.retrograde,
                })),
              },
            } : {},
            ashtakavarga: reportData.sarvashtakavarga ? {
              sarvashtakavarga: reportData.sarvashtakavarga.bindus || [],
              bhinnashtakvarga: {},
              beneficialHouses: reportData.sarvashtakavarga.beneficialHouses || [],
            } : undefined,
            doshas: undefined,
            yogas: undefined,
          },
          pillars: narratives || [],
          freeTier: {},
          paidTier: {},
        };

    const html = generatePdfHtml(pdfData, lang);

    // ── Render the PDF (pure-JS PDFKit engine — no Chromium) ──
    // Margins are small (the template controls its own section spacing) but
    // non-zero so content never touches the paper edge.
    const pdfBytes = await renderPdfFromHtml(html, {
      margins: { top: 24, right: 24, bottom: 24, left: 24 },
      fonts: PDF_FONTS,
      // Avoid the color-emoji resolver probing system fonts on every request
      // (Vercel lambdas have none; the template uses styled text, not emoji).
      autoResolveEmojiFont: false,
    });

    const stem =
      (typeof body.fileName === "string" && body.fileName.trim()) ||
      reportData.clientName ||
      "kundli";
    const safeFileName = `${slugifyFileName(stem) || "kundli"}-kundli-${lang}.pdf`;
    // Count real PDF pages (layout flows across pages; .page divs are only
    // section-break markers, so a 6-section doc can easily exceed 20 pages).
    const pdfString = pdfBytes.toString("latin1");
    const pageCount = (pdfString.match(/\/Type\s*\/Page[^s]/g) || []).length;

    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Content-Length": String(pdfBytes.byteLength),
        "Cache-Control": "no-store",
        "X-Kundli-Pages": String(pageCount),
      },
    });
  } catch (error) {
    console.error("[kundali/pdf] PDF generation failed:", error);
    // The client falls back to zero-cost window.print() on any non-OK reply.
    const message =
      error instanceof Error ? error.message : "Failed to render kundli PDF";
    return NextResponse.json(
      { error: `Failed to render kundli PDF: ${message}` },
      { status: 500 }
    );
  }
}
