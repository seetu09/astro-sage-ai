'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { getUILabel } from '@/lib/astrologyDictionary';
import { generateReportHtml, ReportData } from '@/lib/pdfHtmlTemplate';
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
    setIsGenerating(true);
    trackEvent('download_pdf_clicked', { lang: selectedLanguage });

    try {
      const htmlContent = generateReportHtml(reportData, lang);

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0px';
      iframe.style.bottom = '0px';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.zIndex = '-1';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.setAttribute('tabindex', '-1');

      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || (iframe.contentWindow as any).document;
      doc.open();
      doc.write(htmlContent);
      doc.close();

      const waitForFontsAndPrint = async () => {
        try {
          if (document.fonts && document.fonts.ready) {
            const probe = doc.createElement('span');
            probe.style.cssText =
              'position:absolute;left:-9999px;top:-9999px;font-family:"Noto Sans Devanagari",sans-serif;font-size:16px;';
            probe.textContent = 'क्ष त्र ज्ञ मंत्र ॐ';
            doc.body.appendChild(probe);
            await document.fonts.load('16px "Noto Sans Devanagari", sans-serif', 'क्ष त्र ज्ञ मंत्र ॐ');
            doc.body.removeChild(probe);
            await document.fonts.ready;
          } else {
            await new Promise((r) => setTimeout(r, 1500));
          }
        } catch {
          // Font readiness is best-effort
        }

        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error('Print failed:', e);
        }

        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 500);
      };

      doc.body.onload = () => {
        setTimeout(waitForFontsAndPrint, 500);
      };

      if (doc.body && doc.body.children.length > 0) {
        setTimeout(waitForFontsAndPrint, 500);
      }
    } catch (err) {
      console.error('PDF export failed:', err);
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
