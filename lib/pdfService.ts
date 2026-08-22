/**
 * pdfService — Client-side branded PDF generation engine
 * ------------------------------------------------------
 * Renders each `.pdf-page` node of the PdfTemplate to a canvas via
 * html2canvas, then composes an A4 jsPDF document. 100% client-side so it
 * runs on Vercel without any server-side binary dependencies.
 *
 * Devanagari correctness: the template is rendered in the browser (which
 * performs OpenType complex-text shaping for conjuncts/matras), then
 * rasterized — guaranteeing glyph-perfect Hindi output.
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PdfProgress {
  current: number;
  total: number;
}

export interface GeneratePdfOptions {
  /** Root element containing the `.pdf-page` nodes. */
  root: HTMLElement;
  /** User name used in the download filename (sanitized). */
  userName: string;
  /** Language code for the filename suffix (EN / HI). */
  language: 'en' | 'hi';
  /** Optional progress callback (1-based current page). */
  onProgress?: (progress: PdfProgress) => void;
}

/** A4 dimensions in mm. */
const A4_W = 210;
const A4_H = 297;

/** Sanitize a name for use in a filename (strip path separators / control chars). */
function sanitizeFileName(name: string): string {
  return (
    name
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 60) || 'User'
  );
}

/** Wait for all web fonts (incl. Noto Sans Devanagari) to be ready. */
async function waitForFonts(): Promise<void> {
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
      // Extra probe: force layout of a Devanagari string so the font loads.
      const probe = document.createElement('span');
      probe.style.cssText =
        'position:absolute;left:-9999px;top:-9999px;font-family:var(--font-noto-devanagari),sans-serif;font-size:16px;';
      probe.textContent = 'क्ष त्र ज्ञ मंत्र ॐ';
      document.body.appendChild(probe);
      await document.fonts.load("16px var(--font-noto-devanagari), sans-serif", 'क्ष त्र ज्ञ मंत्र ॐ');
      document.body.removeChild(probe);
    }
  } catch {
    // Font readiness is best-effort — proceed even if it fails.
  }
}

/**
 * Generate and download the branded Kundli PDF.
 *
 * @returns The generated jsPDF instance (for tests / previews).
 */
export async function generateKundliPdf(options: GeneratePdfOptions): Promise<jsPDF> {
  const { root, userName, language, onProgress } = options;

  await waitForFonts();

  const pages = Array.from(root.querySelectorAll<HTMLElement>('.pdf-page'));
  if (pages.length === 0) {
    throw new Error('No .pdf-page elements found in the PDF template root.');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    onProgress?.({ current: i + 1, total: pages.length });

    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: page.scrollWidth,
      windowHeight: page.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage();
    }

    // Full-bleed A4 placement (no margins — the template already has padding).
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_W, A4_H, undefined, 'FAST');
  }

  const langSuffix = language === 'hi' ? 'HI' : 'EN';
  const filename = `AstroSage_Kundli_${sanitizeFileName(userName)}_${langSuffix}.pdf`;
  pdf.save(filename);

  return pdf;
}