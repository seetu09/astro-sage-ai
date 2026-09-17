/**
 * catalogSchema.ts
 * ----------------
 * Shared Zod schema for `data/artifacts.json`.
 *
 * This is the single source of truth for the catalog shape, consumed by:
 *  - `app/api/admin/artifacts/route.ts` (validates PUT bodies before writing)
 *  - `lib/__tests__/storeCatalog.test.ts` (validates the shipped catalog file)
 *
 * It mirrors the `Artifact` / `ArtifactCatalog` interfaces already declared in
 * `lib/artifactRecommender.ts` — we re-declare them here as Zod-powered types so
 * the API has runtime validation without importing the recommender (which is a
 * Phase 1 dependency we must not couple the admin tooling to).
 */
import { z } from 'zod';

// ── Bilingual text block ──────────────────────────────────────────────
const BilingualTextSchema = z.object({
  en: z.string().min(1),
  hi: z.string().min(1),
});

const BilingualBenefitsSchema = z.object({
  en: z.array(z.string()).min(1),
  hi: z.array(z.string()).min(1),
});

// ── Single artifact row ───────────────────────────────────────────────
export const ArtifactSchema = z.object({
  id: z.string().min(1),
  name: BilingualTextSchema,
  doshas: z.array(z.string()).min(1),
  pitch: BilingualTextSchema,
  benefits: BilingualBenefitsSchema,
  imageUrl: z.string().min(1),
  productUrl: z.string().min(1),
  priority: z.number().int().min(0),
  disclaimer: BilingualTextSchema,
});

// ── Full catalog file ─────────────────────────────────────────────────
export const ArtifactCatalogSchema = z.object({
  version: z.number().int().optional(),
  // Permissive fallback slot for future catalog metadata fields.
  _note: z.unknown().optional(),
  artifacts: z.array(ArtifactSchema),
  doshaAliases: z.record(z.string(), z.array(z.string())),
});

// ── Convenience exports ───────────────────────────────────────────────
export type ArtifactCatalog = z.infer<typeof ArtifactCatalogSchema>;
export type CatalogArtifact = z.infer<typeof ArtifactSchema>;
