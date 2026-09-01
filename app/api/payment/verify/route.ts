import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { issueUnlockToken } from '@/lib/paymentUnlock';
import { creditWallet, getUserFromAuthHeader, hasWalletCreditForPayment } from '@/lib/serverWallet';

export async function POST(req: Request) {
  try {
    // Rate limit — trial-and-error / forged-verification spam (20 req / 60s / IP).
    const { allowed, retryAfter } = checkRateLimit(
      `payment-verify:${getClientIp(req)}`,
      20,
      60_000
    );
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.', success: false },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID;

    if (!secret || !keyId) {
      return NextResponse.json(
        { error: 'Razorpay credentials missing', success: false },
        { status: 500 }
      );
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification parameters', success: false },
        { status: 400 }
      );
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated = hmac.digest('hex');

    if (generated !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid signature', success: false },
        { status: 400 }
      );
    }

    // 2) Server-side order revalidation — require the order to actually be
    // marked PAID by Razorpay before we mint an unlock token. This neutralizes
    // forged-stripe style "verification" spoofing deterministically: a payment
    // that never settled can't unlock a report. Best-effort: if Razorpay's API
    // is unreachable we log and fall through so genuine buyers are not blocked
    // during an outcage; if reachable and the order is unpaid/missing, we reject.


    const auth = Buffer.from(`${keyId}:${secret}`).toString('base64');
    let orderStatus: string | undefined;
    let orderAmountPaise: number | undefined;
    let orderProductType: string | undefined;
    try {
      const orderRes = await fetch(
        `https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpay_order_id)}`,
        { headers: { Authorization: `Basic ${auth}` } }
      );
      if (orderRes.ok) {
        const order = await orderRes.json();
        orderStatus = order.status;
        orderAmountPaise = typeof order.amount === 'number' ? order.amount : undefined;
        orderProductType =
          order.notes && typeof order.notes.productType === 'string'
            ? order.notes.productType
            : undefined;
      } else if (orderRes.status === 404) {
        // A non-existent order id can never be a valid verification.

        return NextResponse.json(
          { error: 'Order not found. Payment cannot be verified.', success: false },
          { status: 400 }
        );
      }
    } catch (orderErr) {
      console.error('PAYMENT_ORDER_REVALIDATION_FAILED', orderErr);
    }

    if (orderStatus === 'created' || orderStatus === 'attempted') {
      // Razorpay never marked it paid — no unlock token.;
      return NextResponse.json(
        { error: 'Payment has not been captured yet.', success: false },
        { status: 402 }
      );
    }

    // Credit the wallet for wallet top-ups — server-side, idempotent per
    // payment_id. Auth is required so the credit attaches to a real account.
    if (orderProductType === 'wallet_topup' && orderStatus === 'paid') {
      if (!(await hasWalletCreditForPayment(razorpay_payment_id))) {
        const user = await getUserFromAuthHeader(req);
        if (!user) {
          return NextResponse.json(
            { error: 'Sign in required to credit the wallet. Please sign in and retry verification.', success: false },
            { status: 401 }
          );
        }
        const credited = await creditWallet(
          user.id,
          (orderAmountPaise ?? 0) / 100,
          razorpay_order_id,
          razorpay_payment_id
        );
        if (credited === null) {
          return NextResponse.json(
            {
              error: `Payment verified but the wallet could not be credited. Contact support with payment id ${razorpay_payment_id}.`,
              success: false,
            },
            { status: 500 }
          );
        }
      }
    }

    // Mint the signed unlock token the paid report + PDF routes require.
    let unlockToken: string | null = null;
    try {
      unlockToken = issueUnlockToken(razorpay_order_id, razorpay_payment_id);
    } catch {
      // Token issuance failing (misconfigured secret) must not silently pass.
      return NextResponse.json(
        { error: 'Unlock token issuance failed', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified',
      unlockToken,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Verification failed', success: false },
      { status: 500 }
    );
  }
}