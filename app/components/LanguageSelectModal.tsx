'use client';

import { useEffect } from 'react';
import { AlertCircle, Check, Globe, Loader2, Printer, X } from 'lucide-react';
import { useTranslation } from '@/app/lib/i18n/useTranslation';

export type PdfLanguage = 'en' | 'hi';

interface LanguageSelectModalProps {
  isOpen: boolean;
  /** Server render / report rebuild in progress — locks the language choices. */
  isBusy?: boolean;
  /** Progress copy shown while busy (e.g. "Rebuilding your report…"). */
  busyMessage?: string;
  /** Fatal error copy shown inside the modal (e.g. missing coordinates). */
  errorMessage?: string;
  /** User picked a language — start the download flow. */
  onSelect: (language: PdfLanguage) => void;
  /** Optional instant zero-server client print action, per language. */
  onPrintInstantly?: (language: PdfLanguage) => void;
  onClose: () => void;
}

const LANGUAGE_OPTIONS: { code: PdfLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
];

/**
 * LanguageSelectModal — English / हिंदी chooser shown before the
 * "Download Full 25-Page Kundli" flow starts, so the whole PDF (labels,
 * narratives, appendix pages) renders in one pass of the chosen locale.
 */
export default function LanguageSelectModal({
  isOpen,
  isBusy = false,
  busyMessage,
  errorMessage,
  onSelect,
  onPrintInstantly,
  onClose,
}: LanguageSelectModalProps) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isBusy, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-lang-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
      }}
    >
      <section className="w-full max-w-sm rounded-t-2xl border border-amber-200/70 bg-[#FFFDF6] p-5 shadow-2xl sm:rounded-2xl dark:border-white/10 dark:bg-[#121026]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 dark:from-[#FFD166]/20 dark:to-[#E0A96D]/10 dark:text-[#FFD166]">
              <Globe className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 id="pdf-lang-title" className="font-serif font-bold text-amber-950 dark:text-[#F3F4F6]">
                {t('kundali.sections.chooseLanguage')}
              </h2>
            </div>
          </div>
          {!isBusy && (
            <button
              onClick={onClose}
              aria-label={t('kundali.sections.chooseLanguage')}
              className="rounded-lg p-1.5 text-amber-800/60 hover:bg-amber-100 dark:text-[#9CA3AF] dark:hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {LANGUAGE_OPTIONS.map(({ code, label, native }) => (
            <button
              key={code}
              onClick={() => onSelect(code)}
              disabled={isBusy}
              aria-label={t('kundali.sections.pdfLanguageAria', { lang: native })}
              className="group relative flex min-h-[76px] flex-col items-center justify-center gap-0.5 rounded-xl border border-amber-200/80 bg-white px-3 py-3 transition hover:border-amber-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-[#FFD166]"
            >
              <span className="text-base font-bold text-amber-950 group-hover:text-amber-700 dark:text-[#F3F4F6] dark:group-hover:text-[#FFD166]">
                {native}
              </span>
              <span className="text-[11px] uppercase tracking-wide text-amber-800/50 dark:text-[#9CA3AF]">
                {code === 'en' ? 'English' : 'Devanagari'}
              </span>
              <Check className="absolute right-2 top-2 hidden h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </button>
          ))}
        </div>

        {isBusy && (
          <p className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-[#FFD166]/10 dark:text-[#FFD166]" role="status" aria-live="polite">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {busyMessage || t('kundali.sections.pdfRendering')}
          </p>
        )}

        {errorMessage && (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300" role="alert">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {errorMessage}
          </p>
        )}

        {onPrintInstantly && !isBusy && (
          <div className="mt-3 rounded-lg border border-dashed border-amber-300/80 p-2.5 dark:border-white/15">
            <p className="mb-2 text-center text-[11px] leading-snug text-amber-800/60 dark:text-[#9CA3AF]">
              {t('kundali.sections.pdfPrintHint')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_OPTIONS.map(({ code, native }) => (
                <button
                  key={`print-${code}`}
                  onClick={() => onPrintInstantly(code)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-200/80 bg-white px-2 py-1.5 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-50 dark:border-white/10 dark:bg-white/5 dark:text-[#D1D5DB] dark:hover:bg-white/10"
                >
                  <Printer className="h-3 w-3" />
                  {code === 'en' ? t('kundali.sections.printEnglish') : t('kundali.sections.printHindi')}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
