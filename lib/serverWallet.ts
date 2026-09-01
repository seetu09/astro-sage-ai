import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const FREE_MESSAGES_LIMIT = 3;
const PRICE_PER_QUESTION = 5;

let serviceClient: SupabaseClient | null = null;

/** Service-role client (bypasses RLS) — server routes only. */
export function getServiceSupabase(): SupabaseClient {
  if (serviceClient) return serviceClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  serviceClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return serviceClient;
}

export type ConsumeResult = "free" | "wallet" | "insufficient";

/** Resolve the authenticated user from a Bearer access token, or null. */
export async function getUserFromAuthHeader(req: Request): Promise<{ id: string } | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return { id: data.user.id };
  } catch {
    return null;
  }
}

/**
 * Atomic server-side debit for one AI chat question.
 * Returns the charge outcome plus the fresh server state.
 */
export async function consumeChatCredit(
  userId: string
): Promise<{ result: ConsumeResult; freeUsed: number; freeLeft: number; balance: number } | null> {
  const supabase = getServiceSupabase();
  const { data: rpcData, error: rpcError } = await supabase.rpc("consume_chat_credit", {
    p_user: userId,
    p_free_limit: FREE_MESSAGES_LIMIT,
    p_price: PRICE_PER_QUESTION,
  });
  if (rpcError) {
    console.error("WALLET_CONSUME_RPC_FAILED", rpcError.message);
    return null;
  }
  const state = await getWalletState(userId);
  return {
    result: (rpcData as ConsumeResult) ?? "insufficient",
    freeUsed: state?.freeUsed ?? FREE_MESSAGES_LIMIT,
    freeLeft: state?.freeLeft ?? 0,
    balance: state?.balance ?? 0,
  };
}

/** Refund a charged question when the AI call fails before answering. */
export async function refundChatCredit(userId: string, chargedAs: ConsumeResult): Promise<void> {
  if (chargedAs !== "free" && chargedAs !== "wallet") return;
  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase.rpc("refund_chat_credit", {
      p_user: userId,
      p_charged_as: chargedAs,
      p_price: PRICE_PER_QUESTION,
    });
    if (error) console.error("WALLET_REFUND_RPC_FAILED", error.message);
  } catch (err) {
    console.error("WALLET_REFUND_FAILED", err);
  }
}

/** Credit the wallet after a verified payment. Returns the new balance. */
export async function creditWallet(
  userId: string,
  amountInInr: number,
  orderId?: string,
  paymentId?: string
): Promise<number | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.rpc("credit_wallet", {
    p_user: userId,
    p_amount: amountInInr,
    p_order_id: orderId ?? null,
    p_payment_id: paymentId ?? null,
  });
  if (error) {
    console.error("WALLET_CREDIT_RPC_FAILED", error.message);
    return null;
  }
  return typeof data === "number" ? data : null;
}

/** Idempotency guard: has this Razorpay payment already been credited? */
export async function hasWalletCreditForPayment(paymentId: string): Promise<boolean> {
  try {
    const supabase = getServiceSupabase();
    const { data } = await supabase
      .from("wallet_transactions")
      .select("id")
      .eq("payment_id", paymentId)
      .eq("type", "wallet_topup")
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

export interface WalletState {
  balance: number;
  freeUsed: number;
  freeLeft: number;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    orderId: string | null;
    paymentId: string | null;
    description: string | null;
    createdAt: string;
  }>;
}

/** Full wallet snapshot for the authenticated user. */
export async function getWalletState(userId: string): Promise<WalletState | null> {
  const supabase = getServiceSupabase();
  const [balanceRes, txRes] = await Promise.all([
    supabase
      .from("wallet_balances")
      .select("balance, free_questions_used")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("wallet_transactions")
      .select("id, type, amount, currency, status, order_id, payment_id, description, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);
  if (balanceRes.error || txRes.error) {
    console.error("WALLET_STATE_FETCH_FAILED", balanceRes.error?.message || txRes.error?.message);
    return null;
  }
  const freeUsed = balanceRes.data?.free_questions_used ?? 0;
  return {
    balance: Number(balanceRes.data?.balance ?? 0),
    freeUsed,
    freeLeft: Math.max(0, FREE_MESSAGES_LIMIT - freeUsed),
    transactions: (txRes.data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      type: String(row.type),
      amount: Number(row.amount),
      currency: String(row.currency ?? "INR"),
      status: String(row.status ?? "completed"),
      orderId: (row.order_id as string) ?? null,
      paymentId: (row.payment_id as string) ?? null,
      description: (row.description as string) ?? null,
      createdAt: String(row.created_at),
    })),
  };
}

export const WALLET_LIMITS = { FREE_MESSAGES_LIMIT, PRICE_PER_QUESTION };
