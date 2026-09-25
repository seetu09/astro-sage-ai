'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';

interface ArtifactImageProps {
  src: string;
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
 * Component pages in app/store use it without needing hooks themselves.
 */
export default function ArtifactImage({ src, alt, className }: ArtifactImageProps) {
  const [broken, setBroken] = useState(false);

  if (broken) {
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
