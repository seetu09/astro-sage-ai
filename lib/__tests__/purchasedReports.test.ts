process.env.PAYMENT_UNLOCK_SECRET = process.env.PAYMENT_UNLOCK_SECRET || "test-secret-for-unit-tests";

import { describe, it, expect } from "vitest";
import {
  chartFingerprint,
  // re-exported below only when Supabase isn't needed (table-dependent helpers
  // are not exercised here — they need a live DB).
} from "@/lib/serverPurchasedReports";
import { chartFingerprint as fromShared } from "@/lib/chartFingerprint";
import {
  issueUnlockToken,
  verifyUnlockToken,
} from "@/lib/paymentUnlock";

describe("chartFingerprint — stable per-chart identity", () => {
  it("serverPurchasedReports re-exports the shared chartFingerprint (no duplicate logic)", () => {
    expect(chartFingerprint).toBe(fromShared);
  });

  it("is deterministic for identical inputs", () => {
    const a = chartFingerprint({
      latitude: 28.6139,
      longitude: 77.209,
      birthDate: "1990-01-01",
      birthTime: "12:00",
      timezone: "+05:30",
    });
    const b = chartFingerprint({
      latitude: 28.6139,
      longitude: 77.209,
      birthDate: "1990-01-01",
      birthTime: "12:00",
      timezone: "+05:30",
    });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]+-[0-9a-f]+$/);
  });

  it("differs when any coordinate or birth field changes", () => {
    const base = {
      latitude: 28.6139,
      longitude: 77.209,
      birthDate: "1990-01-01",
      birthTime: "12:00",
      timezone: "+05:30",
    };
    const baseFp = chartFingerprint(base);
    expect(chartFingerprint({ ...base, latitude: 19.076 })).not.toBe(baseFp);
    expect(chartFingerprint({ ...base, birthDate: "1991-02-03" })).not.toBe(baseFp);
    expect(chartFingerprint({ ...base, timezone: "+00:00" })).not.toBe(baseFp);
  });

  it("normalizes missing/empty fields to a stable default", () => {
    const a = chartFingerprint({});
    const b = chartFingerprint({});
    expect(a).toBe(b);
  });
});

describe("server-side unlock token ownership", () => {
  it("round-trips a payment id through issue/verify", () => {
    const token = issueUnlockToken("order_123", "pay_456");
    const verified = verifyUnlockToken(token);
    expect(verified).not.toBeNull();
    expect(verified).toEqual({ orderId: "order_123", paymentId: "pay_456" });
  });

  it("rejects a malformed/empty token", () => {
    expect(verifyUnlockToken(undefined)).toBeNull();
    expect(verifyUnlockToken("")).toBeNull();
    expect(verifyUnlockToken("not-a-token")).toBeNull();
  });
});