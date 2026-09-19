/**
 * Chart fingerprint — a stable content hash of a birth chart's identifying
 * fields (latitude, longitude, birth date, birth time, timezone).
 *
 * Used to key server-side purchased reports: the client computes a
 * fingerprint at purchase time, the server recomputes it at lookup time.
 * The two MUST produce identical output for the same input, so this module
 * is the single source of truth — do not duplicate this logic anywhere.
 *
 * The hash is non-cryptographic (FNV-1a-style). It exists to avoid storing
 * verbatim personal detail in logs and keys, not to resist tampering.
 */

export function chartFingerprint(input: {
  latitude?: number | string | null;
  longitude?: number | string | null;
  birthDate?: string | null;
  birthTime?: string | null;
  timezone?: string | null;
}): string {
  const parts = [
    String(input.latitude ?? ""),
    String(input.longitude ?? ""),
    String(input.birthDate ?? ""),
    String(input.birthTime ?? ""),
    String(input.timezone ?? "+05:30"),
  ];
  const text = parts.join("|");
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 ^= c;
    h1 = (h1 * 0x01000193) & 0xffffffff;
    h2 = (h2 * 31 + c) & 0xffffffff;
  }
  return `${h1.toString(16)}-${h2.toString(16)}`;
}
