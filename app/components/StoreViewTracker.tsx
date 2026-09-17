'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * Client-only sub-component that fires a `store_view` analytics event on mount.
 *
 * Imported into the server `StoreIdPage` so the page itself can stay a server
 * component while this one client bit handles the analytics call.
 */
export default function StoreViewTracker({ artifactId }: { artifactId: string }) {
  useEffect(() => {
    trackEvent('store_view', { artifactId });
  }, [artifactId]);

  return null;
}