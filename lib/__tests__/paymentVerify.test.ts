import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import crypto from 'crypto';

// Set env BEFORE vi.mock factories run (vi.mock is hoisted, but top-level
// assignments execute in source order, before any hoisted factory body runs).
process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
process.env.RAZORPAY_KEY_SECRET = 'test_secret_hex_string';

import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { creditWallet, getUserFromAuthHeader, hasWalletCreditForPayment } from '@/lib/serverWallet';
import { recordPurchasedKundliReport } from '@/lib/serverPurchasedReports';
import { issueUnlockToken } from '@/lib/paymentUnlock';
import { POST } from '@/app/api/payment/verify/route';

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
}));

vi.mock('@/lib/serverWallet', () => ({
  creditWallet: vi.fn(),
  getUserFromAuthHeader: vi.fn(),
  hasWalletCreditForPayment: vi.fn(),
}));

vi.mock('@/lib/serverPurchasedReports', () => ({
  recordPurchasedKundliReport: vi.fn(),
}));

vi.mock('@/lib/paymentUnlock', () => ({
  issueUnlockToken: vi.fn(),
}));

const TEST_SECRET = 'test_secret_hex_string';

function req(body: object) {
  return new Request('http://localhost/api/payment/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockOrderFetch(status: number, order?: object) {
  (global.fetch as any).mockResolvedValueOnce({
    ok: status === 200,
    status,
    json: async () => order ?? {},
  });
}

function validSignature(orderId: string, paymentId: string) {
  return crypto
    .createHmac('sha256', TEST_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

describe('POST /api/payment/verify', () => {
  beforeAll(() => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any) = vi.fn();
    (getClientIp as any).mockReturnValue('127.0.0.1');
    (checkRateLimit as any).mockReturnValue({ allowed: true, retryAfter: 0 });
    (hasWalletCreditForPayment as any).mockResolvedValue(false);
    (getUserFromAuthHeader as any).mockResolvedValue(null);
    (creditWallet as any).mockResolvedValue(null);
    (recordPurchasedKundliReport as any).mockResolvedValue(null);
    (issueUnlockToken as any).mockReturnValue('fake.unlock.token');
  });


  it('returns 429 when rate limited', async () => {
    (checkRateLimit as any).mockReturnValue({ allowed: false, retryAfter: 30 });

    const orderId = 'order_1';
    const paymentId = 'pay_1';
    const signature = validSignature(orderId, paymentId);

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    );

    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Too many requests. Please try again shortly.');

    expect(global.fetch).not.toHaveBeenCalled();
    expect(creditWallet).not.toHaveBeenCalled();
    expect(recordPurchasedKundliReport).not.toHaveBeenCalled();
    expect(issueUnlockToken).not.toHaveBeenCalled();
  });

  it('returns 500 when Razorpay env is missing', async () => {
    delete process.env.RAZORPAY_KEY_ID;

    const orderId = 'order_1';
    const paymentId = 'pay_1';
    const signature = validSignature(orderId, paymentId);

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    );

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Razorpay credentials missing');
  });

  it('returns 400 when signature is invalid', async () => {
    const orderId = 'order_1';
    const paymentId = 'pay_1';

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: 'bogus_signature',
      }),
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Invalid signature');

    expect(global.fetch).not.toHaveBeenCalled();
  });


  it('returns 400 when order is not found (Razorpay 404)', async () => {
    const orderId = 'order_404';
    const paymentId = 'pay_404';
    const signature = validSignature(orderId, paymentId);

    mockOrderFetch(404);

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('returns 400 when order is not paid', async () => {
    const orderId = 'order_unpaid';
    const paymentId = 'pay_unpaid';
        const signature = validSignature(orderId, paymentId);

    mockOrderFetch(200, { status: 'created', amount: 100, notes: {} });

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    );

    expect(res.status).toBe(402);
    const json = await res.json();
    expect(json.success).toBe(false);
  });


  it('wallet topup — happy path credits wallet once and returns unlock token', async () => {
    const orderId = 'order_wallet';
    const paymentId = 'pay_wallet';
    const amount = 50000;
    const signature = validSignature(orderId, paymentId);

    mockOrderFetch(200, {
      status: 'paid',
      amount,
      notes: { productType: 'wallet_topup' },
    });

    (hasWalletCreditForPayment as any).mockResolvedValue(false);
    (getUserFromAuthHeader as any).mockResolvedValue({ id: 'user-1' });
    (creditWallet as any).mockResolvedValue({ id: 'wallet-row-1' });
    (issueUnlockToken as any).mockReturnValue('fake.unlock.token');

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.unlockToken).toBe('fake.unlock.token');

    expect(creditWallet).toHaveBeenCalledTimes(1);
    expect(creditWallet).toHaveBeenCalledWith('user-1', amount / 100, orderId, paymentId);
    expect(recordPurchasedKundliReport).not.toHaveBeenCalled();
  });


  it('wallet topup — idempotent, second verify with same payment_id does not double-credit', async () => {
    const orderId = 'order_wallet_2';
    const paymentId = 'pay_wallet_2';
    const amount = 50000;
    const signature = validSignature(orderId, paymentId);

    mockOrderFetch(200, {
      status: 'paid',
      amount,
      notes: { productType: 'wallet_topup' },
    });

    (hasWalletCreditForPayment as any).mockResolvedValue(true);

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    );

    expect(res.status).toBe(200);

    expect(creditWallet).not.toHaveBeenCalled();
    expect(issueUnlockToken).toHaveBeenCalledTimes(1);
  });


  it('kundli report — happy path calls recordPurchasedKundliReport once and returns unlock token', async () => {
    const orderId = 'order_kundli';
    const paymentId = 'pay_kundli';
    const amount = 9900;
    const fingerprint = 'fp-abc';
    const signature = validSignature(orderId, paymentId);

    mockOrderFetch(200, {
      status: 'paid',
      amount,
      notes: {
        productType: 'kundli_report',
        chartFingerprint: fingerprint,
        userEmail: 'a@b.com',
        clientName: 'Ada',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        reportOwnerUserId: 'user-1',
      },
    });

    (issueUnlockToken as any).mockReturnValue('kundli.unlock.token');

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe('Payment verified');
    expect(json.unlockToken).toBe('kundli.unlock.token');

    expect(recordPurchasedKundliReport).toHaveBeenCalledTimes(1);
    expect(creditWallet).not.toHaveBeenCalled();
  });


  it('returns 500 when unlock token issuance throws', async () => {
    const orderId = 'order_bad_token';
    const paymentId = 'pay_bad_token';
    const amount = 9900;
    const fingerprint = 'fp-abc';
    const signature = validSignature(orderId, paymentId);

    mockOrderFetch(200, {
      status: 'paid',
      amount,
      notes: {
        productType: 'kundli_report',
        chartFingerprint: fingerprint,
      },
    });

    (issueUnlockToken as any).mockImplementation(() => {
      throw new Error('misconfigured');
    });

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    );

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Unlock token issuance failed');
  });


  it('signature check happens before Razorpay order fetch', async () => {
    const orderId = 'order_sig_check';
    const paymentId = 'pay_sig_check';

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: 'wrong_signature',
      }),
    );

    expect(res.status).toBe(400);
    expect((global.fetch as any)).not.toHaveBeenCalled();
  });


  it('wallet topup — idempotent path does not call getUserFromAuthHeader', async () => {
    const orderId = 'order_wallet_idem';
    const paymentId = 'pay_wallet_idem';
    const signature = validSignature(orderId, paymentId);

    mockOrderFetch(200, {
      status: 'paid',
      amount: 50000,
      notes: { productType: 'wallet_topup' },
    });

    (hasWalletCreditForPayment as any).mockResolvedValue(true);

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    );

    expect(res.status).toBe(200);
    expect(getUserFromAuthHeader).not.toHaveBeenCalled();
    expect(creditWallet).not.toHaveBeenCalled();
  });


  it('wallet topup — returns 401 when user is not authenticated', async () => {
    const orderId = 'order_wallet_noauth';
    const paymentId = 'pay_wallet_noauth';
    const signature = validSignature(orderId, paymentId);

    mockOrderFetch(200, {
      status: 'paid',
      amount: 50000,
      notes: { productType: 'wallet_topup' },
    });

    (hasWalletCreditForPayment as any).mockResolvedValue(false);
    (getUserFromAuthHeader as any).mockResolvedValue(null);

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    );

    expect(res.status).toBe(401);
    expect(creditWallet).not.toHaveBeenCalled();
    expect(issueUnlockToken).not.toHaveBeenCalled();
  });


  it('wallet topup — credit amount comes from Razorpay order, not request body', async () => {
    const orderId = 'order_wallet_body';
    const paymentId = 'pay_wallet_body';
    const signature = validSignature(orderId, paymentId);

    mockOrderFetch(200, {
      status: 'paid',
      amount: 50000,
      notes: { productType: 'wallet_topup' },
    });

    (hasWalletCreditForPayment as any).mockResolvedValue(false);
    (getUserFromAuthHeader as any).mockResolvedValue({ id: 'user-1' });
    (creditWallet as any).mockResolvedValue({ id: 'wallet-row-1' });
    (issueUnlockToken as any).mockReturnValue('fake.unlock.token');

    const res = await POST(
      req({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        amount: 999999,
      }),
    );

    expect(res.status).toBe(200);
    expect(creditWallet).toHaveBeenCalledWith('user-1', 500, orderId, paymentId);
  });
});

