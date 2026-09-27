import { describe, it, expect } from 'vitest';
import {
  resolveArtifactOrderAmount,
  MIN_ARTIFACT_AMOUNT_INR,
} from '@/lib/artifactPricing';

/**
 * Server-side price validation for artifact checkout (Task 1.3).
 *
 * The catalog (`artifacts.price_inr`) is authoritative; the client amount is
 * only a cross-check. These cases pin the three failure modes that must never
 * reach Razorpay: stale price, bogus price, sub-minimum price.
 */
describe('resolveArtifactOrderAmount', () => {
  it('accepts a catalog price with a matching client amount', () => {
    const result = resolveArtifactOrderAmount({ catalogPriceInr: 1299, clientAmount: 1299 });
    expect(result).toEqual({ ok: true, amountPaise: 129900 });
  });

  it('accepts a string catalog price (numeric columns serialize as strings)', () => {
    const result = resolveArtifactOrderAmount({ catalogPriceInr: '1299.00', clientAmount: 1299 });
    expect(result).toEqual({ ok: true, amountPaise: 129900 });
  });

  it('accepts a missing client amount — the server price stands', () => {
    expect(resolveArtifactOrderAmount({ catalogPriceInr: 499 })).toEqual({
      ok: true,
      amountPaise: 49900,
    });
    expect(
      resolveArtifactOrderAmount({ catalogPriceInr: 499, clientAmount: undefined })
    ).toEqual({ ok: true, amountPaise: 49900 });
  });

  it('rounds decimal prices to integer paise without float drift', () => {
    expect(resolveArtifactOrderAmount({ catalogPriceInr: 999.99 })).toEqual({
      ok: true,
      amountPaise: 99999,
    });
    // 1.1 × 3 = 3.3000000000000003 in float — must settle at exactly 330 paise.
    expect(resolveArtifactOrderAmount({ catalogPriceInr: 1.1 * 3 })).toEqual({
      ok: true,
      amountPaise: 330,
    });
  });

  it('rejects a client amount that does not match the catalog', () => {
    const result = resolveArtifactOrderAmount({ catalogPriceInr: 1299, clientAmount: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/price .* changed/i);
  });

  it('rejects non-numeric, zero, and negative catalog prices', () => {
    for (const catalogPriceInr of [NaN, Infinity, 0, -10, 'free', null, undefined]) {
      const result = resolveArtifactOrderAmount({ catalogPriceInr });
      expect(result.ok, `price=${String(catalogPriceInr)}`).toBe(false);
    }
  });

  it('rejects catalog prices below the Razorpay minimum of ₹1', () => {
    expect(MIN_ARTIFACT_AMOUNT_INR).toBe(1);
    const result = resolveArtifactOrderAmount({ catalogPriceInr: 0.5 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/minimum/i);
  });

  it('rejects a non-finite client amount', () => {
    for (const clientAmount of ['abc', NaN, Infinity]) {
      const result = resolveArtifactOrderAmount({ catalogPriceInr: 100, clientAmount });
      expect(result.ok, `client=${String(clientAmount)}`).toBe(false);
    }
  });
});
