'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { type Recommendation } from '@/lib/artifactRecommender';
import { trackEvent } from '@/lib/analytics';

interface Props {
  /**
   * Already-computed recommendations, produced by `recommendArtifacts`.
   *
   * This component is purely PRESENTATIONAL: it deliberately does not call the
   * recommender and does not fetch a catalog. The catalog is injected by the
   * caller (see app/components/KundliReport.tsx) because:
   *   - `recommendArtifacts` is sync + pure, so computing it during render keeps
   *     this component free of loading states, and
   *   - the catalog now lives in the database, so only an async caller
   *     (a Server Component or a page holding `useState`) can load it.
   */
  recommendations: Recommendation[];
  lang: 'en' | 'hi';
}

/**
 * Contextual artifact suggestions for the report's "Remedial Measures" section.
 *
 * Deliberately quiet: a soft amber card, no price, no call-to-action button and
 * no urgency copy. Only the trailing link is interactive — the card itself is
 * static — so the block reads as part of the reading rather than as an ad.
 * Renders nothing at all when there is no relevant recommendation.
 */
export default function ArtifactRecommendations({ recommendations, lang }: Props) {
  // Fire an impression event for each recommendation on mount.
  useEffect(() => {
    for (const recommendation of recommendations) {
      trackEvent('artifact_impression', {
        artifactId: recommendation.artifact.id,
        matchedDoshas: recommendation.matchedDoshas,
        lang,
        source: 'kundli_report',
      });
    }
  }, [recommendations, lang]);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <ArtifactCard key={recommendation.artifact.id} recommendation={recommendation} lang={lang} />
      ))}
    </div>
  );
}

function ArtifactCard({
  recommendation,
  lang,
}: {
  recommendation: Recommendation;
  lang: 'en' | 'hi';
}) {
  // Same inline bilingual pattern as KundliReport — report copy is not routed
  // through the global i18n dictionary.
  const _t = (en: string, hi: string) => (lang === 'hi' ? hi : en);

  const { artifact } = recommendation;
  const name = artifact.name?.[lang] ?? artifact.name?.en ?? '';
  const pitch = artifact.pitch?.[lang] ?? artifact.pitch?.en ?? '';
  const benefits = (lang === 'hi' ? artifact.benefits?.hi : artifact.benefits?.en) ?? [];
  const disclaimer = artifact.disclaimer?.[lang] ?? artifact.disclaimer?.en ?? '';

  const handleLinkClick = () => {
    trackEvent('artifact_click', {
      artifactId: artifact.id,
      matchedDoshas: recommendation.matchedDoshas,
      lang,
      source: 'kundli_report',
    });
  };

  return (
    <article className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
      {artifact.imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artifact.imageUrl}
            alt={name}
            width={64}
            height={64}
            className="mb-3 h-16 w-16 rounded-lg object-cover"
          />
        </>
      )}

      <h4 className="text-base font-medium text-slate-800 dark:text-slate-100">{name}</h4>

      {pitch && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{pitch}</p>}

      {benefits.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {benefits.slice(0, 3).map((benefit, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
            >
              <span className="mt-0.5 text-amber-500">•</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <Link
          href={artifact.productUrl}
          onClick={handleLinkClick}
          aria-label={_t(
            `Explore remedy: ${artifact.name?.en ?? name}`,
            `उपाय देखें: ${artifact.name?.hi ?? name}`
          )}
          className="rounded text-sm text-amber-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:text-amber-300 dark:focus-visible:ring-amber-300 dark:focus-visible:ring-offset-slate-900"
        >
          {_t('Explore this remedy →', 'इस उपाय को देखें →')}
        </Link>
      </div>

      {disclaimer && (
        <p className="mt-3 border-t border-amber-200/60 pt-3 text-xs italic text-slate-400 dark:border-amber-900/40 dark:text-slate-500">
          {disclaimer}
        </p>
      )}
    </article>
  );
}
