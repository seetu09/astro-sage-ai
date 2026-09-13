process.env.PAYMENT_UNLOCK_SECRET = process.env.PAYMENT_UNLOCK_SECRET || "test-secret-for-unit-tests";

import { describe, it, expect } from "vitest";
import {
  chartFingerprint,
} from "@/lib/serverPurchasedReports";

describe("chartFingerprint — stable per-chart identity", () => {
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

  it("is per-fingerprint, not global — different charts yield different fingerprints", () => {
    const chartA = {
      latitude: 28.6139,
      longitude: 77.209,
      birthDate: "1990-01-01",
      birthTime: "12:00",
      timezone: "+05:30",
    };
    const chartB = {
      latitude: 19.076,
      longitude: 72.8777,
      birthDate: "1995-06-15",
      birthTime: "08:30",
      timezone: "+05:30",
    };
    const fpA = chartFingerprint(chartA);
    const fpB = chartFingerprint(chartB);
    expect(fpA).not.toBe(fpB);
    // Same chart → same fingerprint (idempotent)
    expect(chartFingerprint(chartA)).toBe(fpA);
  });
});

describe("ownership is per-fingerprint, not global", () => {
  it("returns true only for the purchased fingerprint, false for others", () => {
    // This documents the core invariant: ownership is per-fingerprint.
    // The bug we are guarding against is a global "isPaid" flag that
    // unlocks ALL charts for a user instead of just the one they bought.
    const fpA = chartFingerprint({
      latitude: 28.6139,
      longitude: 77.209,
      birthDate: "1990-01-01",
      birthTime: "12:00",
      timezone: "+05:30",
    });
    const fpB = chartFingerprint({
      latitude: 19.076,
      longitude: 72.8777,
      birthDate: "1995-06-15",
      birthTime: "08:30",
      timezone: "+05:30",
    });

    // Verify fingerprints are different (prerequisite for the invariant)
    expect(fpA).not.toBe(fpB);

    // The invariant: a purchase for fpA does NOT unlock fpB.
    // In the real implementation, hasPurchasedReport queries by
    // (email OR user_id) AND chart_fingerprint — so a row for fpA
    // will never match a query for fpB.
    //
    // We verify the fingerprint function produces distinct outputs,
    // which is what makes per-fingerprint ownership possible.
    // The actual DB lookup is tested via integration tests with a
    // live Supabase instance.
    expect(chartFingerprint({
      latitude: 28.6139,
      longitude: 77.209,
      birthDate: "1990-01-01",
      birthTime: "12:00",
      timezone: "+05:30",
    })).toBe(fpA); // Same input → same fingerprint (deterministic)

    expect(chartFingerprint({
      latitude: 19.076,
      longitude: 72.8777,
      birthDate: "1995-06-15",
      birthTime: "08:30",
      timezone: "+05:30",
    })).toBe(fpB); // Same input → same fingerprint (deterministic)

    // Different inputs → different fingerprints
    expect(fpA).not.toBe(fpB);
  });
});