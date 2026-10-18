export const runtime = 'nodejs';
// Report the RUNTIME environment (Upstash vars can be added and the app
// redeployed without changing code) — never bake this into a static build.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getRateLimitBackend } from '@/lib/rateLimit';
import { getServiceSupabase } from '@/lib/serverWallet';

// --- Migration health check (READ-ONLY diagnostics) -------------------------
// Extends this endpoint so ops gets an EARLY WARNING if the production
// database is behind the code (migration 009_user_profiles.sql not applied).
//
// SAFETY CONTRACT (this is a diagnostics-only change):
//   * Never writes to the database. Never applies a migration.
//   * Never changes the HTTP status code. A missing migration is reported in
//     the BODY only (`migrations.overall: "degraded"`) — it must NOT take the
//     app out of the load balancer for a non-fatal condition.
//   * Never throws. If the service-role client is unavailable or the probe
//     errors in an unexpected way, the RPC is reported as "unknown".
//
// PROBE METHOD (and why it is safe):
//   PostgREST (the layer supabase.rpc() talks to) only exposes functions in
//   the `public` schema, so we CANNOT SELECT pg_proc to list functions —
//   `.from('pg_proc')` is not possible. The remaining read-only option is to
//   call the RPC itself and inspect the error:
//     * `get_user_profile(p_user_id uuid)` — its body is a pure
//       `select * from user_profiles where user_id = ...`. Calling it with a
//       well-formed but NON-EXISTENT uuid (all-zero) reads zero rows and
//       writes nothing. PostgREST returns HTTP 404 + PGRST202 ("Could not
//       find the function") when the function does not exist — that is our
//       MISSING signal. Any other error (or a 200 with an empty array) means
//       the function EXISTS and was safely executed → PRESENT.
//     * `upsert_user_profile(...)` — its body's FIRST statement is an
//       `insert`. There is no argument combination guaranteed to fail before
//       that insert, so ANY probe call could write a row. Per the safety
//       contract ("do not let a probe RPC call actually write data") we do
//       NOT probe it and honestly report "unknown". (If get_user_profile is
//       PRESENT, migration 009 ran — both RPCs are created in the same file —
//       so the read probe still gives you the early warning you want.)
type RpcStatus = 'present' | 'missing' | 'unknown';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

/** Read-only probe for a function that is known never to write. */
async function probeReadOnlyRpc(
  fn: 'get_user_profile',
): Promise<RpcStatus> {
  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase.rpc(fn, { p_user_id: ZERO_UUID });
    if (!error) return 'present'; // ran and returned (0 rows) — function exists
    // PGRST202 = PostgREST "Could not find the function" (404). Anything else
    // (e.g. a permission or cast error) still proves the function EXISTS.
    if (error.code === 'PGRST202') return 'missing';
    return 'present';
  } catch {
    // getServiceSupabase() throws when SUPABASE_SERVICE_ROLE_KEY is unset.
    return 'unknown';
  }
}

// --- Migration 010 probe (anon EXECUTE revoked?) -----------------------------
// 010_revoke_profile_rpcs.sql revokes client-role EXECUTE on get_user_profile.
// The only way to observe that over HTTP is to attempt the call the way an
// attacker would: with the ANON key (which ships in every browser bundle) and
// NO user session. Two outcomes, both safe:
//   * permission denied (SQLSTATE 42501 / PostgREST 401-403) → the revoke is
//     in place → 'present'.
//   * the call SUCCEEDS (returns a value, even an empty array) → anon can
//     still execute the security-definer function → 010 is NOT applied →
//     'missing'.
// The probe uses the same all-zero dummy uuid as probeReadOnlyRpc, so it
// reads at most zero rows and writes nothing regardless of outcome. It NEVER
// throws: any transport/config failure is reported as 'unknown'.
async function probeAnonProfileRpc(): Promise<RpcStatus> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return 'unknown';
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await supabase.rpc('get_user_profile', { p_user_id: ZERO_UUID });
    if (!error) return 'missing'; // anon could call it → 010 not applied
    // 42501 = insufficient_privilege; 401/403 = not authenticated/authorized.
    // Any of these means the EXECUTE grant is gone → 010 applied.
    if (error.code === '42501' || error.code === '401' || error.code === '403') {
      return 'present';
    }
    // PGRST202 (function doesn't exist at all) means 009 never ran either;
    // 010 cannot be verified as applied → report it as not-known-present.
    if (error.code === 'PGRST202') return 'missing';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

async function checkMigrations(): Promise<{
  upsert_user_profile: RpcStatus;
  get_user_profile: RpcStatus;
  profile_rpc_revoked: RpcStatus;
  overall: 'ok' | 'degraded' | 'unknown';
}> {
  // Upsert probe intentionally skipped — see SAFETY CONTRACT above.
  const upsert: RpcStatus = 'unknown';
  const get = await probeReadOnlyRpc('get_user_profile');
  // Run both probes together; they are independent single RPC calls.
  const revoked = await probeAnonProfileRpc();

  const overall =
    get === 'unknown' && upsert === 'unknown' && revoked === 'unknown'
      ? 'unknown'
      : get === 'missing' || revoked === 'missing'
        ? 'degraded'
        : get === 'present'
          ? 'ok'
          : 'unknown';

  return {
    upsert_user_profile: upsert,
    get_user_profile: get,
    profile_rpc_revoked: revoked,
    overall,
  };
}

export async function GET() {
  // Resolve the migration check WITHOUT letting it affect the existing
  // response or status code. The probe is a single small read against
  // PostgREST (same cost class as the other RPC calls in this app), so it is
  // safe to await inline; any failure is absorbed inside checkMigrations().
  const migrations = await checkMigrations();

  return NextResponse.json({
    status: 'ok',
    time: Date.now(),
    // Rate-limit store this instance is configured for. 'upstash' = shared
    // cross-instance quota; 'memory' = per-instance fallback (the deployment
    // env is missing UPSTASH_REDIS_REST_URL/TOKEN). See PLAN.md Task 1.2.
    rateLimitBackend: getRateLimitBackend(),
    // READ-ONLY migration diagnostics. Never affects the HTTP status code.
    migrations,
  });
}

