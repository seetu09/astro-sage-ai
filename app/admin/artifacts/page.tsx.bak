// Not linked in the nav - access directly at /admin/artifacts

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { useLanguage } from '@/app/context/LanguageContext';
import { ArtifactCatalogSchema } from '@/lib/catalogSchema';

type Lang = 'en' | 'hi';

export default function AdminArtifactsPage() {
  const toast = useToast();
  const { language } = useLanguage() as { language: Lang };
  const [_password, setPassword] = useState('');
  const [jsonValue, setJsonValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const _t = (en: string, hi: string) => (language === 'hi' ? hi : en);

  const loadCatalog = useCallback(async () => {
    if (!_password.trim()) {
      toast.error(_t('Please enter your admin password to continue', 'Admin password dalein'));
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/artifacts', {
        headers: { 'x-admin-password': _password },
      });
      if (res.status === 401) {
        toast.error(_t('Invalid admin password', 'Galat admin password'));
        return;
      }
      if (!res.ok) {
        const errorText = await res.text();
        toast.error(_t('Failed to load catalog: ', 'Catalog load fail ho gaya: ') + (errorText || res.statusText));
        return;
      }
      const data = await res.json();
      const result = ArtifactCatalogSchema.safeParse(data);
      if (!result.success) {
        toast.error(_t('Catalog validation failed on load', 'Load par catalog validation fail ho gaya'));
        return;
      }
      setJsonValue(JSON.stringify(result.data, null, 2));
      setHasLoaded(true);
      toast.success(_t('Catalog loaded successfully', 'Catalog safal rup se load ho gaya'));
    } catch {
      toast.error(_t('Network error while loading catalog', 'Network error catalog load karte waqt'));
    } finally {
      setIsLoading(false);
    }
  }, [_password, toast]);

  const saveCatalog = useCallback(async () => {
    if (!_password.trim()) {
      toast.error(_t('Please enter your admin password to continue', 'Admin password dalein'));
      return;
    }
    let jsonValueToSave = jsonValue.trim();
    if (!jsonValueToSave) {
      toast.error(_t('Please edit the catalog JSON before saving', 'Save karne se pehle JSON mein badlav karein'));
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonValueToSave);
    } catch {
      toast.error(_t('Invalid JSON - please fix syntax errors before saving', 'Invalid JSON - save karne se pehle syntax thik karein'));
      return;
    }
    const result = ArtifactCatalogSchema.safeParse(parsed);
    if (!result.success) {
      toast.error(_t('Validation failed: ', 'Validation fail: ') + result.error.message);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/artifacts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': _password,
        },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        toast.error(_t('Save failed: ', 'Save fail ho gaya: ') + (errorText || res.statusText));
        return;
      }
      toast.success(_t('Catalog saved successfully', 'Catalog safal rupe se save ho gaya'));
    } catch {
      toast.error(_t('Network error while saving catalog', 'Network error catalog save karte waqt'));
    } finally {
      setIsLoading(false);
    }
  }, [_password, jsonValue, toast]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)] mb-2">
            {_t('Artifact Catalog Admin', 'prasaar kosh aadeshika')}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {_t('Manage the artifact catalog JSON. Changes are written directly to data/artifacts.json.', 'prasaar kosh ke JSON ko prabandh karein. Badlav seedhe data/artifacts.json mein likhe jaate hain.')}
          </p>
        </header>
        <section className="astro-card mb-6">
          <label htmlFor="admin-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {_t('Admin Password', 'Admin password')}
          </label>
          <div className="flex gap-2">
            <input
              id="admin-password"
              type="password"
              value={_password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={_t('Enter admin password', 'Admin password dalein')}
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              type="button"
              onClick={loadCatalog}
              disabled={isLoading || !_password.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {_t('Load catalog', 'Catalog load karein')}
            </button>
          </div>
        </section>
        <section className="astro-card">
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="catalog-json" className="text-sm font-medium text-[var(--text-secondary)]">
              {_t('Catalog JSON', 'Catalog JSON')}
            </label>
            <button
              type="button"
              onClick={saveCatalog}
              disabled={isLoading || !hasLoaded}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? _t('Saving...', 'Save ho raha hai...') : _t('Save', 'Save karein')}
            </button>
          </div>
          <textarea
            id="catalog-json"
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
            placeholder={_t('Click Load catalog to fetch the current catalog, or paste valid JSON here.', 'Current catalog fetch karne ke liye Load catalog dalein, ya yahan valid JSON paste karein.')}
            rows={20}
            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y"
            readOnly={!hasLoaded}
          />
          {!hasLoaded && (
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {_t('Enter the admin password above and click Load catalog to begin.', 'Upar admin password dalein aur Load catalog par click karein shuru karne ke liye.')}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
