/**
 * artifactPricing.ts
 * ------------------
 * Server-side price validation for artifact checkout (Task 1.3).
 *
 * The `artifacts` table is the ONLY source of truth for what an item costs.
 * Before this module existed, `/api/payment/create-order` accepted a
 * client-supplied `amount` for every paymentType — anyone could start a
 * ₹1 Razorpay order for any product. The route now resolves the catalog row
 * first and calls `resolveArtifactOrderAmount` to turn that row into the order
 * amount, using the client's `amount` purely as a cross-check that the buyer's
 * page and the catalog agree (surfacing stale caches instead of silently
 * charging the wrong price).
 *
 * Pure module (no I/O) — covered by lib/__tests__/artifactPricing.test.ts.
 */

export type ArtifactOrderAmountResult =
  | { ok: true; amountPaise: number }
  | { ok: false; error: string };

/** Razorpay cannot settle orders below ₹1 (100 paise). */
export const MIN_ARTIFACT_AMOUNT_INR = 1;

export function resolveArtifactOrderAmount(input: {
  /** `artifacts.price_inr` read server-side (numeric(12,2) → string|number). */
  catalogPriceInr: unknown;
  /** `amount` from the request body (INR) — optional cross-check. */
  clientAmount?: unknown;
}): ArtifactOrderAmountResult {
  const price = Number(input.catalogPriceInr);
  if (!Number.isFinite(price) || price <= 0) {
    return {
      ok: false,
      error: 'This item is not available for purchase. Please refresh the store and try another item.',
    };
  }

  // Compare and charge in paise — integer math, no float drift at settlement.
  const amountPaise = Math.round(price * 100);
  if (amountPaise < MIN_ARTIFACT_AMOUNT_INR * 100) {
    return { ok: false, error: 'This item is priced below the minimum accepted amount.' };
  }

  // Client amount is a cross-check only. Absent → server amount stands.
  if (input.clientAmount !== undefined && input.clientAmount !== null && input.clientAmount !== '') {
    const client = Number(input.clientAmount);
    if (!Number.isFinite(client)) {
      return { ok: false, error: 'Invalid amount for this item.' };
    }
    if (Math.round(client * 100) !== amountPaise) {
      return {
        ok: false,
        error: 'The price of this item has changed. Please refresh the page and try again.',
      };
    }
  }

  return { ok: true, amountPaise };
}
