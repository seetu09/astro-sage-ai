export const runtime = 'nodejs';
// Report the RUNTIME environment (Upstash vars can be added and the app
// redeployed without changing code) — never bake this into a static build.
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getRateLimitBackend } from '@/lib/rateLimit';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    time: Date.now(),
    // Rate-limit store this instance is configured for. 'upstash' = shared
    // cross-instance quota; 'memory' = per-instance fallback (the deployment
    // env is missing UPSTASH_REDIS_REST_URL/TOKEN). See PLAN.md Task 1.2.
    rateLimitBackend: getRateLimitBackend(),
  });
}

