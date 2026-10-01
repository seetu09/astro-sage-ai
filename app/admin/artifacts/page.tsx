// Not linked in the nav - access directly at /admin/artifacts

'use client';

import { useState, useCallback, useEffect, type ChangeEvent } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import ArtifactImage from '@/app/components/ArtifactImage';
import { useLanguage } from '@/app/context/LanguageContext';
import {
  ArtifactCatalogSchema,
  ARTIFACT_CATEGORIES,
  type ArtifactCatalog,
  type CatalogArtifact,
} from '@/lib/catalogSchema';

type Lang = 'en' | 'hi';

/**
 * Field editors for one artifact row.
 *
 * The catalog is edited as JSON (the shape the API accepts), so the form
 * controls patch the parsed object in place and the textarea is re-serialized.
 * That keeps a single source of truth for the save payload — there is no
 * second, form-shaped copy of the catalog that could drift out of sync.
 */
function ArtifactFields({
  artifact,
  onChange,
  _t,
}: {
  artifact: CatalogArtifact;
  onChange: (next: CatalogArtifact) => void;
  _t: (en: string, hi: string) => string;
}) {
  // A category outside ARTIFACT_CATEGORIES is kept as an extra option so
  // editing (and saving) cannot silently rewrite it to a suggested value.
  const isSuggested = (ARTIFACT_CATEGORIES as readonly string[]).includes(artifact.category);

  const numberValue = Number.isFinite(artifact.priceInr) ? artifact.priceInr : 0;

  // Feedback for the upload below. Called here rather than passed down so the
  // component signature stays "artifact + onChange + translator".
  const toast = useToast();

  /**
   * True while THIS row's image is uploading. Every control in the row is
   * disabled while it is set, and that is load-bearing rather than cosmetic:
   * `handleImageFile` closes over the `artifact` from the render that started the
   * upload, so without the lock an edit to price/category/isActive made during
   * the round trip would be silently reverted by the `onChange` it fires on
   * completion. Disabling the row is the cheap, provable fix — the alternative
   * (threading a functional updater through updateArtifact) changes the contract
   * every other control in this component already depends on.
   */
  const [uploading, setUploading] = useState(false);

  /**
   * Upload a product image and patch the returned URL into the artifact.
   *
   * Goes through the same `onChange` as the price/category controls, which is
   * what `updateArtifact` re-serializes back into the catalog JSON textarea — so
   * the URL is persisted by the next ordinary Save, exactly as a hand-typed URL
   * would be. The upload itself is NOT transactional with that Save: the object
   * lands in the bucket immediately, and abandoning the edit orphans it. That is
   * documented (CHANGELOG "Known limitations") and tracked as Task 4.3b.
   */
  const handleImageFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const file = input.files?.[0];
      // Clear the input BEFORE awaiting: re-picking the same file must fire
      // `change` again, and it will not while the input still holds that file.
      // That is the normal way an admin retries after a failed upload.
      input.value = '';
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        // Deliberately no Content-Type header — the browser must generate the
        // multipart boundary itself; setting it by hand produces a body the
        // server cannot parse.
        const res = await fetch('/api/admin/artifact-image', {
          method: 'POST',
          body: formData,
        });
        const data: { url?: unknown; message?: unknown } = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(
            _t('Image upload failed: ', 'Image upload fail ho gaya: ') +
              (typeof data.message === 'string' ? data.message : res.statusText)
          );
          return;
        }
        const url = typeof data.url === 'string' ? data.url : '';
        if (!url) {
          toast.error(
            _t('Upload finished but returned no URL', 'Upload ho gaya par URL nahi mila')
          );
          return;
        }
        onChange({ ...artifact, imageUrl: url });
        toast.success(
          _t(
            'Image uploaded — press Save to store the URL in the catalog',
            'Image upload ho gaya — catalog mein URL save karne ke liye Save dabayein'
          )
        );
      } catch {
        toast.error(
          _t('Network error while uploading image', 'Image upload karte waqt network error')
        );
      } finally {
        setUploading(false);
      }
    },
    [artifact, onChange, toast, _t]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label
          htmlFor={`price-${artifact.id}`}
          className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
        >
          {_t('Price (INR)', 'Keemat (INR)')}
        </label>
        <input
          id={`price-${artifact.id}`}
          type="number"
          step="0.01"
          min={0}
          value={numberValue}
          disabled={uploading}
          onChange={(e) => {
            // Stored in rupees, not paise — the input maps 1:1 onto priceInr.
            const parsed = e.target.value === '' ? 0 : Number(e.target.value);
            onChange({ ...artifact, priceInr: Number.isFinite(parsed) ? Math.max(0, parsed) : 0 });
          }}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>

      <div>
        <label
          htmlFor={`category-${artifact.id}`}
          className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
        >
          {_t('Category', 'Shreni')}
        </label>
        <select
          id={`category-${artifact.id}`}
          value={artifact.category}
          disabled={uploading}
          onChange={(e) => onChange({ ...artifact, category: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          {!isSuggested && <option value={artifact.category}>{artifact.category}</option>}
          {ARTIFACT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end">
        <label
          htmlFor={`active-${artifact.id}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] pb-2"
        >
          <input
            id={`active-${artifact.id}`}
            type="checkbox"
            checked={artifact.isActive !== false}
            disabled={uploading}
            onChange={(e) => onChange({ ...artifact, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          {_t('Active (visible to buyers)', 'Sakriya (kharidaron ko dikhein)')}
        </label>
      </div>

      {/*
        Product image (Task 4.3).

        Three controls describing ONE field, laid out in a full-width row so they
        line up with the three above. They are deliberately not three sources of
        truth: the upload writes the returned URL through the same `onChange` the
        text input edits, so both funnel into the catalog JSON textarea and are
        persisted by the single Save button. Keeping the text input means an
        admin who pastes a URL (or edits one that already exists) sees and
        changes the same value the uploader writes, instead of the preview and
        the catalog quietly disagreeing.
      */}
      <div className="sm:col-span-3 border-t border-[var(--border)] pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
        <div>
          <label
            htmlFor={`image-${artifact.id}`}
            className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
          >
            {_t('Product image', 'Utpad photo')}
          </label>
          <input
            id={`image-${artifact.id}`}
            type="file"
            accept="image/*"
            onChange={handleImageFile}
            disabled={uploading}
            className="w-full text-xs text-[var(--text-secondary)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-[var(--accent-dark)] disabled:opacity-50"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {uploading
              ? _t('Uploading…', 'Upload ho raha hai…')
              : _t(
                  'Images only, up to 5 MB. Uploading adds the URL to the JSON above — press Save to keep it.',
                  'Sirf image, 5 MB tak. Upload URL ko upar wale JSON mein daalta hai — rakhne ke liye Save dabayein.'
                )}
          </p>
        </div>

        <div>
          <label
            htmlFor={`image-url-${artifact.id}`}
            className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
          >
            {_t('Image URL', 'Image URL')}
          </label>
          <input
            id={`image-url-${artifact.id}`}
            type="text"
            value={artifact.imageUrl ?? ''}
            onChange={(e) => onChange({ ...artifact, imageUrl: e.target.value })}
            disabled={uploading}
            placeholder="https://…/artifact-images/…"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {_t(
              'Paste a URL instead of uploading, or edit the current one. Leave empty for no image.',
              'Upload ke bajaye URL paste karein, ya mojooda URL badlein. Koi image na ho to khaali chhodein.'
            )}
          </p>
        </div>

        <div>
          <span className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            {_t('Preview', 'Preview')}
          </span>
          {/* ArtifactImage rather than a bare <img>: with no imageUrl it renders
              the Package glyph, and its onError fallback means a bad pasted URL
              shows the same thing as no URL at all. */}
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-[var(--border)]">
            <ArtifactImage
              src={artifact.imageUrl}
              alt={artifact.name?.en ?? artifact.id}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminArtifactsPage() {
  const toast = useToast();
  const { language } = useLanguage() as { language: Lang };
  const [_password, setPassword] = useState('');
  const [jsonValue, setJsonValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  // Parsed mirror of `jsonValue`, used to render the per-artifact form controls.
  // Null whenever the textarea does not currently hold valid catalog JSON, in
  // which case the form is hidden and only the raw JSON editor is shown.
  const [catalog, setCatalog] = useState<ArtifactCatalog | null>(null);

  const _t = useCallback(
    (en: string, hi: string) => (language === 'hi' ? hi : en),
    [language]
  );

  /**
   * Apply a change from a form control (price / category / isActive).
   *
   * The JSON textarea stays the payload of record: the patched object is
   * re-serialized back into it, so the form and the raw editor can never
   * disagree about what will be saved.
   */
  const updateArtifact = useCallback((index: number, next: CatalogArtifact) => {
    setCatalog((current) => {
      if (!current) return current;
      const artifacts = current.artifacts.map((artifact, i) => (i === index ? next : artifact));
      const updated = { ...current, artifacts };
      setJsonValue(JSON.stringify(updated, null, 2));
      return updated;
    });
  }, []);

  /**
   * Load catalog from the admin endpoint. This page itself is gated by
   * middleware.ts via the session cookie, so the authenticated admin user
   * has the session cookie auto-attached to this same-origin fetch. The
   * /api/admin/artifacts GET returns the full catalog (including inactive
   * items); the public storefront reads from /api/artifacts instead.
   */
  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/artifacts');
      if (res.status === 401) {
        toast.error(_t('Authentication required. Please log in again.', 'Praamanyatavada avashyakta. Kripaya phir se log in karein.'));
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
      setCatalog(result.data);
      setJsonValue(JSON.stringify(result.data, null, 2));
      setHasLoaded(true);
      toast.success(_t('Catalog loaded successfully', 'Catalog safal rup se load ho gaya'));
    } catch {
      toast.error(_t('Network error while loading catalog', 'Network error catalog load karte waqt'));
    } finally {
      setIsLoading(false);
    }
  }, [toast, _t]);

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
    // Keep the form in step with the parsed JSON the save will actually send.
    setCatalog(result.data);
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
  }, [_password, jsonValue, toast, _t]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)] mb-2">
            {_t('Artifact Catalog Admin', 'prasaar kosh aadeshika')}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {_t('Manage the artifact catalog. Rows are stored in Supabase, so changes go live on the next page load — no redeploy needed.', 'prasaar kosh prabandh karein. Rows Supabase mein hain, isliye badlav agle page load par live ho jaate hain — redeploy ki zarurat nahi.')}
          </p>
        </header>
        <section className="astro-card mb-6">
          <label htmlFor="admin-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {_t('Save Password (required for changes)', 'Save password (badlav ke liye avashyakta)')}
          </label>
          <div className="flex gap-2">
            <input
              id="admin-password"
              type="password"
              value={_password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={_t('Required to save changes', 'Badlav save karein ye avashyakta')}
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              type="button"
              onClick={loadCatalog}
              disabled={isLoading}
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
            onChange={(e) => {
              const next = e.target.value;
              setJsonValue(next);
              // Best-effort re-parse: the form controls below are hidden while
              // the textarea holds something that is not (yet) valid catalog JSON.
              try {
                const parsed = JSON.parse(next);
                const result = ArtifactCatalogSchema.safeParse(parsed);
                setCatalog(result.success ? result.data : null);
              } catch {
                setCatalog(null);
              }
            }}
            placeholder={_t('Click Load catalog to fetch the current catalog, or paste valid JSON here.', 'Current catalog fetch karne ke liye Load catalog dalein, ya yahan valid JSON paste karein.')}
            rows={20}
            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y"
            readOnly={!hasLoaded}
          />
          {!hasLoaded && (
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {_t('Click Load catalog to fetch the current catalog.', 'Current catalog fetch karne ke liye Load catalog dalein.')}
            </p>
          )}
        </section>

        {catalog && catalog.artifacts.length > 0 && (
          <section className="astro-card mt-6">
            <h2 className="text-lg font-bold font-serif text-[var(--text-primary)] mb-1">
              {_t('Price, Category & Image', 'Keemat, shreni aur photo')}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              {_t(
                'Edits here are mirrored into the JSON above and saved with the Save button.',
                'Yahan ke badlav upar wale JSON mein bhi jaate hain aur Save button se save hote hain.',
              )}
            </p>
            <div className="space-y-5">
              {catalog.artifacts.map((artifact, index) => (
                <div
                  key={artifact.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]/40 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {artifact.name?.en ?? artifact.id}
                    </span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">{artifact.id}</span>
                  </div>
                  <ArtifactFields
                    artifact={artifact}
                    onChange={(next) => updateArtifact(index, next)}
                    _t={_t}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
