import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Metadata } from 'next';
import { type CatalogArtifact } from '@/lib/catalogSchema';
import { loadArtifactCatalog } from '@/lib/serverArtifactCatalog';
import { recommendArtifacts } from '@/lib/artifactRecommender';
import { LANGUAGE_COOKIE_KEY, isLanguage, getTranslation, type Language } from '@/lib/i18n';
import ArtifactImage from '@/app/components/ArtifactImage';
import StoreViewTracker from '@/app/components/StoreViewTracker';
import { formatPrice } from '@/lib/formatPrice';

export const dynamic = 'force-dynamic';

type Lang = Language;

/**
 * The catalog comes from `loadArtifactCatalog`, which is wrapped in React's
 * `cache`. generateMetadata and `getRecommended` both read it on the same
 * request, and that pair now collapses into ONE database query.
 */
function getArtifact(catalog: Awaited<ReturnType<typeof loadArtifactCatalog>>, id: string): CatalogArtifact | null {
  return catalog.artifacts.find((a) => a.id === id) ?? null;
}

function getRecommended(
  catalog: Awaited<ReturnType<typeof loadArtifactCatalog>>,
  id: string
): CatalogArtifact[] {
  try {
    const current = catalog.artifacts.find((a) => a.id === id);
    if (!current) return [];
    const recs = recommendArtifacts(current.doshas, catalog, { maxResults: 2 });
    return recs
      .map((r) => catalog.artifacts.find((a) => a.id === r.artifact.id))
      .filter((a): a is CatalogArtifact => Boolean(a) && a!.id !== id)
      .slice(0, 2);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const lang = getLangForSSR();
  const t = (key: string) => getTranslation(lang, key);
  const catalog = await loadArtifactCatalog();
  const artifact = getArtifact(catalog, params.id);
  if (!artifact) {
    return { title: t('store.notFound') };
  }
  const name = artifact.name?.[lang] ?? artifact.name?.en ?? '';
  const description = artifact.pitch?.[lang] ?? artifact.pitch?.en ?? '';
  return {
    title: `${name} | ${t('store.heading')}`,
    description,
    openGraph: {
      title: name,
      description,
      images: artifact.imageUrl ? [{ url: artifact.imageUrl }] : undefined,
    },
  };
}

/**
 * Server-Side Rendering cannot use the `useTranslation` hook, so the language is
 * resolved from the persisted cookie — mirroring `resolveLayoutLang` in
 * app/layout.tsx. `cookies()` throws outside a request scope (e.g. some edge
 * runtimes), hence the guard; both callers are dynamic by design.
 */
function getLangForSSR(): Lang {
  try {
    const stored = cookies().get(LANGUAGE_COOKIE_KEY)?.value;
    if (stored && isLanguage(stored)) return stored;
  } catch {
    // cookies() unavailable — fall back to the default language.
  }
  return 'en';
}

async function RecommendedSection({ id }: { id: string }) {
  const catalog = await loadArtifactCatalog();
  const recs = getRecommended(catalog, id);
  const lang = getLangForSSR();
  const t = (key: string) => getTranslation(lang, key);

  if (recs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold font-serif text-[var(--text-primary)] mb-4">
        {t('store.recommended')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {recs.map((rec) => {
          const name = rec.name?.[lang] ?? rec.name?.en ?? '';
          const pitch = rec.pitch?.[lang] ?? rec.pitch?.en ?? '';
          return (
            <Link
              key={rec.id}
              href={rec.productUrl}
              className="astro-card group flex flex-col p-0 overflow-hidden"
            >
              <div className="aspect-video overflow-hidden bg-[var(--bg-secondary)]">
                <ArtifactImage
                  src={rec.imageUrl}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">
                  {name}
                </h3>
                <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-4">{pitch}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)]">
                  {t('store.viewDetails')}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default async function StoreIdPage({ params }: { params: { id: string } }) {
  const catalog = await loadArtifactCatalog();
  const artifact = getArtifact(catalog, params.id);
  if (!artifact) {
    notFound();
  }

  const lang = getLangForSSR();
  const t = (key: string) => getTranslation(lang, key);

  const name = artifact.name?.[lang] ?? artifact.name?.en ?? '';
  const pitch = artifact.pitch?.[lang] ?? artifact.pitch?.en ?? '';
  const benefits = (lang === 'hi' ? artifact.benefits?.hi : artifact.benefits?.en) ?? [];
  const disclaimer = artifact.disclaimer?.[lang] ?? artifact.disclaimer?.en ?? '';

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('store.backToStore')}
        </Link>
        {/* Fire a `store_view` event as soon as the server-rendered page mounts. */}
        <StoreViewTracker artifactId={artifact.id} />

        <article className="astro-card">
          <div className="aspect-video overflow-hidden rounded-xl bg-[var(--bg-secondary)] mb-6">
            <ArtifactImage
              src={artifact.imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-primary)] mb-3">
            {name}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-6">{pitch}</p>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            {t('store.detail.priority')}: {artifact.priority}
          </div>

          {benefits.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold font-serif text-[var(--text-primary)] mb-3">
                {t('store.detail.benefits')}
              </h2>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                  >
                    <span className="mt-0.5 text-[var(--accent)]">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {disclaimer && (
            <div className="border-t border-[var(--border)] pt-4 mb-6">
              <p className="text-xs italic text-[var(--text-muted)]">{disclaimer}</p>
            </div>
          )}

          <p className="text-2xl font-bold text-[var(--accent)] mb-4">
            {formatPrice(artifact.priceInr, artifact.currency)}
          </p>

          {/* TODO: wire checkout in Phase 4 */}
          <button
            disabled
            type="button"
            className="astro-button w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t('store.detail.addToCartSoon')}
          </button>
        </article>

        <Suspense fallback={null}>
          <RecommendedSection id={params.id} />
        </Suspense>
      </div>
    </div>
  );
}
