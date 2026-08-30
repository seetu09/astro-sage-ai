'use client';

import React from 'react';
import { useLanguage } from '@/app/context/LanguageContext';

/**
 * ReportPrimitives — small, self-contained design elements reused across every
 * A4 page of the modular report. Nothing here depends on app layout context so
 * the pieces compose cleanly and print with consistent typography.
 */

/* ------------------------------------------------------------------ */
/* Badge — compact status chip (used inside 3-badge headers)          */
/* ------------------------------------------------------------------ */

type BadgeTone = 'gold' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';

const BADGE_TONES: Record<BadgeTone, string> = {
  gold: 'badge-gold',
  violet: 'badge-violet',
  cyan: 'badge-cyan',
  emerald: 'badge-emerald',
  amber: 'badge-amber',
  rose: 'badge-rose',
};

export function Badge({
  label,
  value,
  tone = 'gold',
  icon,
}: {
  label: string;
  value?: string | number;
  tone?: BadgeTone;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`rpt-badge ${BADGE_TONES[tone]}`}>
      {icon && <span className="rpt-badge-icon">{icon}</span>}
      <div className="rpt-badge-text">
        <span className="rpt-badge-label">{label}</span>
        {value !== undefined && value !== '' && (
          <span className="rpt-badge-value">{value}</span>
        )}
      </div>
    </div>
  );
}

/**
 * BadgeGroup — the "3-badge header" used at the top of each Life-Pillar section.
 * Renders exactly three badges in a tight grid.
 */
export function BadgeGroup({
  badges,
}: {
  badges: { label: string; value: string | number; tone?: BadgeTone }[];
}) {
  const items = badges.slice(0, 3);
  return (
    <div className="rpt-badge-group">
      {items.map((b, i) => (
        <Badge key={i} label={b.label} value={b.value} tone={b.tone} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHeading / Divider                                           */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  title,
  subtitle,
  accent = 'gold',
}: {
  title: string;
  subtitle?: string;
  accent?: 'gold' | 'violet' | 'cyan' | 'emerald';
}) {
  return (
    <div className={`rpt-section-head rpt-section-head-${accent}`}>
      <h3 className="rpt-section-title">{title}</h3>
      {subtitle && <p className="rpt-section-subtitle">{subtitle}</p>}
    </div>
  );
}

export function Hr({ className = '' }: { className?: string }) {
  return <div className={`rpt-hr ${className}`} />;
}

/* ------------------------------------------------------------------ */
/* MilestoneTable — forecast rows used in Life Pillars                */
/* ------------------------------------------------------------------ */

export interface Milestone {
  /** Timeline window, e.g. "2024 – 2027". */
  period: string;
  /** Short headline for the milestone. */
  event: string;
  /** One-line supporting note. */
  note?: string;
  /** Optional outcome tag. */
  outcome?: 'positive' | 'neutral' | 'caution';
}

const OUTCOME_TONE: Record<NonNullable<Milestone['outcome']>, string> = {
  positive: 'outcome-positive',
  neutral: 'outcome-neutral',
  caution: 'outcome-caution',
};

export function MilestoneTable({
  title,
  milestones,
}: {
  title?: string;
  milestones: Milestone[];
}) {
  const { t } = useLanguage();
  return (
    <div className="rpt-milestone">
      {title && <div className="rpt-milestone-title">{title}</div>}
      <table className="rpt-table rpt-milestone-table">
        <thead>
          <tr>
            <th>{t.report.period}</th>
            <th>{t.report.event}</th>
            {milestones.some((m) => m.outcome) && <th>{t.report.outlook}</th>}
          </tr>
        </thead>
        <tbody>
          {milestones.map((m, i) => (
            <tr key={i}>
              <td className="rpt-period">{m.period}</td>
              <td>
                <div className="rpt-milestone-event">{m.event}</div>
                {m.note && <div className="rpt-milestone-note">{m.note}</div>}
              </td>
              {m.outcome && (
                <td>
                  <span className={`rpt-outcome ${OUTCOME_TONE[m.outcome]}`}>
                    {m.outcome}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NarrativeCard — labelled prose block with an accent rule           */
/* ------------------------------------------------------------------ */

export function NarrativeCard({
  label,
  icon,
  tone = 'gold',
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  tone?: 'gold' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';
  children: React.ReactNode;
}) {
  return (
    <div className={`rpt-narrative rpt-narrative-${tone}`}>
      <div className="rpt-narrative-label">
        {icon && <span className="rpt-narrative-icon">{icon}</span>}
        {label}
      </div>
      <div className="rpt-narrative-body">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatTile — small key/value pair for grids (nativity, panchang)     */
/* ------------------------------------------------------------------ */

export function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rpt-stat">
      <span className="rpt-stat-label">{label}</span>
      <span className="rpt-stat-value">{value}</span>
      {sub && <span className="rpt-stat-sub">{sub}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* KeyValueRow — single labelled row for tables/panels                 */
/* ------------------------------------------------------------------ */

export function KeyValueRow({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="rpt-kv">
      <span className="rpt-kv-label">{label}</span>
            <span className={`rpt-kv-value ${tone === 'strong' ? 'rpt-kv-strong' : ''}`}>
        {value}
      </span>
    </div>
  );
}