import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { issueUnlockToken } from '@/lib/paymentUnlock';
import { creditWallet, getUserFromAuthHeader, hasWalletCreditForPayment } from '@/lib/serverWallet';
import { recordPurchasedKundliReport } from '@/lib/serverPurchasedReports';

export async function POST(req: Request) {
  try {
    // Rate limit — trial-and-error / forged-verification spam (20 req / 60s / IP).
    const { allowed, retryAfter } = await checkRateLimit(
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
    let orderNotes: Record<string, unknown> | undefined;
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
        orderNotes =
          order.notes && typeof order.notes === 'object' ? order.notes : undefined;
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

    // Record permanent report ownership for paid kundli report purchases.
    // The full report payload + chart identity + owner email were captured in the
    // Razorpay order notes at create-order time; once the order is PAID we persist
    // them so the user owns the report server-side and can re-download it from their
    // profile at any time — a browser refresh / session loss can never lose it.
    // Email-based: ownership is keyed by checkout email so anonymous buyers can
    // recover their report with the same email; if the buyer was signed in we
    // also attach user_id for the profile tab.
    if (orderProductType === 'kundli_report' && orderStatus === 'paid') {
      const ownerEmail = String(orderNotes?.userEmail ?? '').trim().toLowerCase();
      const reportOwnerUserId = orderNotes?.reportOwnerUserId
        ? String(orderNotes.reportOwnerUserId)
        : null;
      let reportPayload: unknown = {};
      const rawReport = orderNotes?.report;
      if (typeof rawReport === 'string' && rawReport.trim()) {
        try {
          reportPayload = JSON.parse(rawReport);
        } catch {
          reportPayload = {};
        }
      }
      await recordPurchasedKundliReport({
        ownerEmail: ownerEmail || 'unknown@checkout',
        userId: reportOwnerUserId,
        chartFingerprint: String(orderNotes?.chartFingerprint ?? ''),
        clientName: String(orderNotes?.clientName ?? 'User'),
        birthDate: String(orderNotes?.birthDate ?? ''),
        birthTime: String(orderNotes?.birthTime ?? ''),
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        report: reportPayload,
      });
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