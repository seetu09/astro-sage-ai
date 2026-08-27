import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { generateReportHtml, type ReportData } from "@/lib/pdfHtmlTemplate";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// `headless` / `defaultViewport` exist at runtime on @sparticuz/chromium-min
// but are missing from its type declarations.
const chromiumRuntime = chromium as unknown as {
  headless?: boolean;
  defaultViewport?: { width: number; height: number };
};

export async function POST(req: NextRequest) {
    try {
    const { reportData, language, lang, unlockToken } = await req.json();

    // Payment verification
    if (!unlockToken || unlockToken !== process.env.UNLOCK_SECRET) {
      return NextResponse.json({ error: "Payment required" }, { status: 403 });
    }

    if (!reportData) {
      return NextResponse.json({ error: "Missing report data" }, { status: 400 });
    }

    // Language — prefer the canonical `language` field; fall back to the
    // legacy `lang` key for backwards compatibility with older clients.
    const resolvedLang: "en" | "hi" =
      typeof language === "string" && language.trim().toLowerCase() === "hi"
        ? "hi"
        : typeof lang === "string" && lang.trim().toLowerCase() === "hi"
          ? "hi"
          : "en";

    // Generate HTML
    const html = generateReportHtml(reportData as ReportData, resolvedLang);

    // Launch browser with Vercel-compatible settings
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--hide-scrollbars",
        "--disable-web-security",
        "--font-render-hinting=none",
      ],
      defaultViewport: chromiumRuntime.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromiumRuntime.headless ?? true,
      // puppeteer-core v25 renamed ignoreHTTPSErrors → acceptInsecureCerts
      acceptInsecureCerts: true,
    });

    const page = await browser.newPage();

    // Set content and wait for fonts.
    // Note: setContent()'s waitUntil only accepts "load" | "domcontentloaded"
    // in puppeteer-core v25 typings — waitForNetworkIdle() below provides the
    // networkidle0 behavior.
    await page.setContent(html, {
      waitUntil: ["load", "domcontentloaded"],
      timeout: 30000,
    });
    await page.waitForNetworkIdle({ idleTime: 400, timeout: 12000 }).catch(() => {});

    // Wait for Google Fonts to load
    await page.evaluateHandle("document.fonts.ready");

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      preferCSSPageSize: true,
    });

    await browser.close();

    // Return PDF (Uint8Array.from normalizes to ArrayBuffer-backed bytes for BodyInit)
    return new Response(
      new Blob([Uint8Array.from(pdfBuffer)], { type: "application/pdf" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Kundli-Report-${encodeURIComponent(
            reportData.clientName || "User"
          ).replace(/%20/g, "-")}${resolvedLang === "hi" ? "-Hindi" : "-English"}.pdf"`,
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("[download-pdf] Generation failed:", error);
    return NextResponse.json(
      {
        error: "PDF generation failed",
        detail: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
