'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { ArtifactCatalogSchema, type CatalogArtifact } from '@/lib/catalogSchema';

async function fetchCatalog(): Promise<CatalogArtifact[]> {
  try {
    const res = await fetch('/api/admin/artifacts');
    if (!res.ok) return [];
    const data = await res.json();
    const result = ArtifactCatalogSchema.safeParse(data);
    if (result.success) {
      return [...result.data.artifacts].sort((a, b) => b.priority - a.priority);
    }
    return [];
  } catch {
    return [];
  }
}

export default function StorePage() {
  const { language } = useLanguage() as { language: 'en' | 'hi' };
  const [artifacts, setArtifacts] = useState<CatalogArtifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalog().then((data) => {
      setArtifacts(data);
      setLoading(false);
    });
  }, []);

  const _t = (en: string, hi: string) => (language === 'hi' ? hi : en);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[var(--text-muted)]">{_t('Loading...', 'लोड हो रहा है...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">
            {_t('Cosmic Remedies Store', 'कॉज़मिक रिमीडीज़ स्टोर')}
          </h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            {_t(
              'Hand-curated gemstones, rudraksha, and yantras aligned to your doshas.',
              'आपकी दोषों के अनुरूप चयनित हाथ से बनाए गए रत्न, रुद्राक्ष और यंत्र।'
            )}
          </p>
        </header>

        {artifacts.length === 0 ? (
          <div className="astro-card flex flex-col items-center text-center py-16">
            <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <p className="font-medium text-[var(--text-primary)]">{_t('Coming soon', 'जल्द आएगा')}</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {_t('The remedy catalog is being prepared — check back soon.', 'उपचार कैटलॉग तैयार किया जा रहा है — जल्दी वापस आएं।')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {artifacts.map((artifact) => {
              const name = artifact.name?.[language] ?? artifact.name?.en ?? '';
              const pitch = artifact.pitch?.[language] ?? artifact.pitch?.en ?? '';
              return (
                <Link
                  key={artifact.id}
                  href={artifact.productUrl}
                  className="astro-card group flex flex-col p-0 overflow-hidden"
                >
                  <div className="aspect-video overflow-hidden bg-[var(--bg-secondary)]">
                    <img
                      src={artifact.imageUrl}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col flex-1 p-6">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 mb-2">
                      {name}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-4">{pitch}</p>
                    <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)]">
                      {_t('View details →', 'विवरण देखें →')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
