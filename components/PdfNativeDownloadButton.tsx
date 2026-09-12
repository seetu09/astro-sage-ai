'use client';

import React, { useState } from 'react';

interface PdfNativeDownloadButtonProps {
  kundliData: any;
  lang: 'en' | 'hi';
}

/**
 * Additive "Download PDF (New)" button.
 *
 * pdfnative is server-only (its bundle references Node's `fs`), so this client
 * component never imports it. It posts the kundli payload to the additive
 * `/api/kundali/pdf-native` route and downloads the returned PDF bytes.
 */
export default function PdfNativeDownloadButton({ kundliData, lang }: PdfNativeDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/kundali/pdf-native', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kundliData, lang }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Server error (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kundli-report-native.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('[PdfNativeDownloadButton] PDF generation failed:', err);
      alert(err?.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="px-6 py-2.5 text-sm font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-lg shadow-amber-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Generating...' : 'Download PDF (New)'}
    </button>
  );
}
