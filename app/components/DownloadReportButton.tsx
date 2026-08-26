'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { getUILabel } from '@/lib/astrologyDictionary';
import { ReportData } from '@/lib/pdfHtmlTemplate';
import { trackEvent } from '@/lib/analytics';

interface DownloadReportButtonProps {
  reportData: ReportData;
  userName?: string;
}

export default function DownloadReportButton({ reportData, userName = 'User' }: DownloadReportButtonProps) {
  const { selectedLanguage } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);

  const lang = selectedLanguage === 'hi' ? 'hi' : 'en';

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    trackEvent('download_pdf_clicked', { lang: selectedLanguage });

    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportData,
          lang,
          unlockToken: localStorage.getItem('astroveda-unlock-token') || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kundli-Report-${userName.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      trackEvent('download_pdf_success', { lang: selectedLanguage });
    } catch (err) {
      console.error('PDF download failed:', err);
      alert(getUILabel('pdfError', selectedLanguage));
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLabel = getUILabel('downloadPdf', selectedLanguage);
  const generatingLabel = getUILabel('generatingPdf', selectedLanguage).replace(
    '{lang}',
    lang === 'hi' ? 'हिन्दी' : 'English'
  );

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-sm sm:text-base font-semibold rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          {generatingLabel}
        </>
      ) : (
        <>
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          {downloadLabel}
        </>
      )}
    </button>
  );
}
