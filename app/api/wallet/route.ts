import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getWalletState, getUserFromAuthHeader } from "@/lib/serverWallet";

/**
 * GET /api/wallet — server-authoritative wallet snapshot for the signed-in user.
 * Auth: Bearer Supabase access token (sent by WalletContext via supabase.auth.getSession()).
 */
export async function GET(req: Request) {
  const { allowed, retryAfter } = checkRateLimit(`wallet:${getClientIp(req)}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const state = await getWalletState(user.id);
  if (!state) {
    return NextResponse.json({ error: "Wallet temporarily unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    balance: state.balance,
    freeLeft: state.freeLeft,
    transactions: state.transactions,
  });
}
