'use client';

import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';

interface ArtifactImageProps {
  /**
   * Image URL, or absent/empty when the artifact has no image yet.
   *
   * Optional because `imageUrl` is optional in `lib/catalogSchema.ts` (Task
   * 4.3): a product can be catalogued before it is photographed, and the catalog
   * row is `text not null` so an absent image reads back as `''`. Both cases mean
   * "show the placeholder" — an `<img>` with an empty `src` is not an error the
   * `onError` handler can be relied on to catch, so absence is handled here
   * rather than delegated to the browser.
   */
  src?: string;
  alt: string;
  className?: string;
}

/**
 * Product image with a graceful fallback.
 *
 * The catalog often points at `/store/example-*.jpg` placeholders that were
 * never uploaded, so every storefront <img> used to render a broken-image icon.
 * The `onError` handler (client-only — hence the 'use client' boundary) swaps in
 * a Package glyph instead. Keeping this in one component lets the Server
 * Component pages in app/store use it without needing hooks themselves, and makes
 * this the single place that decides what a missing image looks like.
 */
export default function ArtifactImage({ src, alt, className }: ArtifactImageProps) {
  const [broken, setBroken] = useState(false);

  // `broken` is a latch, so it has to be released when the source changes —
  // otherwise a preview that failed once keeps showing the glyph forever after
  // the admin uploads a working image. This is load-bearing in the admin editor
  // (app/admin/artifacts/page.tsx), where `src` is replaced in place on upload.
  useEffect(() => {
    setBroken(false);
  }, [src]);

  if (!src || broken) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--bg-secondary)] ${className ?? ''}`}
        role="img"
        aria-label={alt}
      >
        <Package className="w-12 h-12 text-[var(--accent)]/40" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className={className}
    />
  );
}
