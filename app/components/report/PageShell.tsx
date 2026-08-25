'use client';

import React from 'react';

/**
 * PageShell — the strict A4 print boundary container.
 *
 * Every `.page` renders at an exact A4 portrait size and can never overflow or
 * split across a PDF page. Page numbering is provided via the optional
 * `pageNumber`/`totalPages` props, and a running header/footer is composed from
 * the `title` (section) and `subject` (e.g. client name / chart type).
 *
 * Print rules:
 *   width:210mm; height:297mm; max-height:297mm; page-break-after:always;
 *   overflow:hidden;
 */
interface PageShellProps {
  /** Section title shown in the page header. */
  title: string;
  /** Optional one-line subject (client name / chart type) shown on the right. */
  subject?: string;
  /** Optional subtitle under the header rule (e.g. chapter label). */
  subtitle?: string;
  /** Optional eyebrow / chapter number badge. */
  chapter?: string;
  /** Page number (1-based) for the footer. */
  page?: number;
  /** Total page count for the footer ("Page X of Y"). */
  totalPages?: number;
  /** Mark this page as the cover (no page number footer). */
  cover?: boolean;
  children: React.ReactNode;
}

export default function PageShell({
  title,
  subject,
  subtitle,
  chapter,
  page,
  totalPages,
  cover = false,
  children,
}: PageShellProps) {
  return (
    <div className="page" data-report-page={page}>
      <div className="page-inner">
        <header className="page-header">
          <div className="page-header-left">
            {chapter && <span className="page-chapter">{chapter}</span>}
            <h2 className="page-title">{title}</h2>
            {subtitle && <span className="page-subtitle">{subtitle}</span>}
          </div>
          {subject && <div className="page-meta">{subject}</div>}
        </header>

        <div className="page-body">{children}</div>

        {!cover && (
          <footer className="page-footer">
            <span className="page-footer-mark">AstroVeda • Vedic Insight Report</span>
            {page && (
              <span className="page-number">
                Page {page}{totalPages ? ` of ${totalPages}` : ''}
              </span>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}