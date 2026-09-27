import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Set env BEFORE vi.mock factories run (vi.mock is hoisted, but top-level
// assignments execute in source order, before any hoisted factory body runs).
process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
process.env.RAZORPAY_KEY_SECRET = 'test_secret_hex_string';

import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getUserFromAuthHeader } from '@/lib/serverWallet';
import { getArtifactForCheckout } from '@/lib/serverArtifactCatalog';
import type { CatalogArtifact } from '@/lib/catalogSchema';
import { POST } from '@/app/api/payment/create-order/route';

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
}));

vi.mock('@/lib/serverWallet', () => ({
  getUserFromAuthHeader: vi.fn(),
}));

vi.mock('@/lib/serverArtifactCatalog', () => ({
  getArtifactForCheckout: vi.fn(),
}));

const TEST_SECRET = 'test_secret_hex_string';

const ARTIFACT: CatalogArtifact = {
  id: 'example-neelam',
  name: { en: 'Blue Sapphire (Neelam)', hi: 'नीलम' },
  doshas: ['sade_sati'],
  pitch: { en: 'Pitch en', hi: 'Pitch hi' },
  benefits: { en: ['b'], hi: ['b'] },
  imageUrl: '/store/x.jpg',
  productUrl: '/store/example-neelam',
  priority: 10,
  disclaimer: { en: 'd', hi: 'd' },
  category: 'Gemstones',
  priceInr: 1299,
  currency: 'INR',
  isActive: true,
};

function req(body: object) {
  return new Request('http://localhost/api/payment/create-order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function razorpayOk() {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({ id: 'order_rzp_1', amount: 129900, currency: 'INR' }),
  });
}

/**
 * POST /api/payment/create-order — artifact price validation (Task 1.3) and
 * the artifact_purchase payment type (Task 2.1). The invariant under test:
 * the amount sent to Razorpay ALWAYS comes from the catalog row, never the
 * request body.
 */
describe('POST /api/payment/create-order — artifact checkout', () => {
  beforeAll(() => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any) = vi.fn();
    (getClientIp as any).mockReturnValue('127.0.0.1');
    (checkRateLimit as any).mockResolvedValue({ allowed: true, retryAfter: 0 });
    (getUserFromAuthHeader as any).mockResolvedValue(null);
    (getArtifactForCheckout as any).mockResolvedValue(ARTIFACT);
  });

  it('charges the catalog price, not the client amount (matching amount → order created)', async () => {
    razorpayOk();

    const res = await POST(
      req({
        paymentType: 'artifact_purchase',
        artifactId: ARTIFACT.id,
        amount: 1299,
        userEmail: 'buyer@example.com',
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.orderId).toBe('order_rzp_1');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, init] = (global.fetch as any).mock.calls[0];
    const payload = JSON.parse(init.body);
    expect(payload.amount).toBe(129900);
    expect(payload.currency).toBe('INR');
    expect(payload.notes.productType).toBe('artifact_purchase');
    expect(payload.notes.artifactId).toBe(ARTIFACT.id);
    expect(payload.notes.artifactName).toBe('Blue Sapphire (Neelam)');
    expect(payload.notes.userEmail).toBe('buyer@example.com');
  });

  it('rejects a client amount that disagrees with the catalog price (400, no Razorpay call)', async () => {
    const res = await POST(
      req({
        paymentType: 'artifact_purchase',
        artifactId: ARTIFACT.id,
        amount: 1, // ₹1 tampering attempt
        userEmail: 'buyer@example.com',
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/price .* changed/i);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects when the client omits artifactId (400, no catalog lookup)', async () => {
    const res = await POST(
      req({ paymentType: 'artifact_purchase', amount: 1299, userEmail: 'x@y.z' })
    );

    expect(res.status).toBe(400);
    expect(getArtifactForCheckout).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('answers 404 for an unknown artifact', async () => {
    (getArtifactForCheckout as any).mockResolvedValue(null);

    const res = await POST(
      req({
        paymentType: 'artifact_purchase',
        artifactId: 'does-not-exist',
        amount: 1299,
        userEmail: 'x@y.z',
      })
    );

    expect(res.status).toBe(404);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('answers 404 for an inactive artifact', async () => {
    (getArtifactForCheckout as any).mockResolvedValue({ ...ARTIFACT, isActive: false });

    const res = await POST(
      req({
        paymentType: 'artifact_purchase',
        artifactId: ARTIFACT.id,
        amount: 1299,
        userEmail: 'x@y.z',
      })
    );

    expect(res.status).toBe(404);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('answers 500 (not 404) when the catalog read itself fails', async () => {
    (getArtifactForCheckout as any).mockRejectedValue(new Error('db down'));

    const res = await POST(
      req({
        paymentType: 'artifact_purchase',
        artifactId: ARTIFACT.id,
        amount: 1299,
        userEmail: 'x@y.z',
      })
    );

    expect(res.status).toBe(500);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects an unpriced (₹0) artifact', async () => {
    (getArtifactForCheckout as any).mockResolvedValue({ ...ARTIFACT, priceInr: 0 });

    const res = await POST(
      req({
        paymentType: 'artifact_purchase',
        artifactId: ARTIFACT.id,
        amount: 0,
        userEmail: 'x@y.z',
      })
    );

    expect(res.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('still applies the ₹20 minimum to wallet top-ups (unchanged behavior)', async () => {
    (getUserFromAuthHeader as any).mockResolvedValue({ id: 'user-1' });

    const res = await POST(
      req({ paymentType: 'wallet_topup', amount: 10, userEmail: 'x@y.z' })
    );

    expect(res.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
