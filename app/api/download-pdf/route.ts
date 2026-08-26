import { NextRequest, NextResponse } from "next/server";
import type { ReportData } from "@/lib/pdfHtmlTemplate";
import { generateReportHtml } from "@/lib/pdfHtmlTemplate";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportData, lang, unlockToken } = body as {
      reportData: ReportData;
      lang: "en" | "hi";
      unlockToken?: string;
    };

    // Gate the download behind a valid unlock token
    if (!unlockToken || unlockToken !== process.env.UNLOCK_SECRET) {
      return Response.json({ error: "Payment required" }, { status: 403 });
    }

    if (!reportData) {
      return Response.json({ error: "Missing reportData" }, { status: 400 });
    }

    const html = generateReportHtml(reportData, lang === "hi" ? "hi" : "en");

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      // `chromium.headless` exists at runtime on @sparticuz/chromium-min but is
      // missing from its type declarations
      headless: (chromium as unknown as { headless?: boolean }).headless ?? true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      // networkidle0 is not accepted by setContent() in puppeteer-core v25;
      // wait for fonts/CDN assets to settle instead (best-effort).
      await page
        .waitForNetworkIdle({ idleTime: 400, timeout: 12_000 })
        .catch(() => {});

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });

      await browser.close();

      // Keep the Content-Disposition filename safe for HTTP headers
      const safeName = (reportData.clientName || "User").replace(
        /[^a-zA-Z0-9-_]+/g,
        "-"
      );

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Kundli-Report-${safeName}.pdf"`,
          "Content-Length": String(pdfBuffer.byteLength),
        },
      });
    } catch (renderError) {
      console.error("PDF generation failed:", renderError);
      return Response.json({ error: "PDF generation failed" }, { status: 500 });
    } finally {
      // Ensure Chromium never leaks on Vercel if rendering throws
      if (browser.connected) {
        await browser.close().catch(() => {});
      }
    }
  } catch (err) {
    console.error("PDF generation failed:", err);
    return Response.json({ error: "PDF generation failed" }, { status: 500 });
  }
}