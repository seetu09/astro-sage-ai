/**
 * catalogSchema.ts
 * ----------------
 * Shared Zod schema for the artifact catalog.
 *
 * The catalog is stored in the `public.artifacts` table (see
 * `supabase/migrations/003_artifact_catalog.sql`) and read through
 * `lib/serverArtifactCatalog.ts`. This module stays the single source of truth
 * for the catalog SHAPE and is consumed by:
 *  - `app/api/admin/artifacts/route.ts` (validates PUT bodies before writing)
 *  - `app/api/artifacts/route.ts` (public storefront response)
 *  - `app/admin/artifacts/page.tsx` (the editor's category dropdown)
 *  - `lib/__tests__/storeCatalog.test.ts`
 *
 * It mirrors the `Artifact` / `ArtifactCatalog` interfaces already declared in
 * `lib/artifactRecommender.ts` — we re-declare them here as Zod-powered types so
 * the API has runtime validation without importing the recommender (which is a
 * Phase 1 dependency we must not couple the admin tooling to).
 */
import { z } from 'zod';

// ── Suggested categories ──────────────────────────────────────────────
/**
 * The dropdown options the admin editor renders.
 *
 * `category` is deliberately a FREE-TEXT field on the schema — this list is a
 * suggestion, not a constraint. There is no `categories` table and no
 * `.refine()` tying the field to this array, because refusing an unknown value
 * would force a code change (and a deploy) just to add a category. Anything
 * outside this list is valid; the editor renders the current value as an extra
 * selected option so editing such a row cannot silently rewrite it.
 */
export const ARTIFACT_CATEGORIES = [
  'Gemstones',
  'Rudraksha',
  'Yantras',
  'Malas',
  'Books',
  'Other',
] as const;
export type ArtifactCategory = typeof ARTIFACT_CATEGORIES[number];

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
  // Free-text category. Defaults to 'Other' so rows written before the category
  // column existed (and any payload that omits it) stay valid. See
  // ARTIFACT_CATEGORIES above for the suggested values — NOT enforced.
  category: z.string().min(1).default('Other'),
  // Rupees, not paise: admin input maps 1:1 onto the column. Named `priceInr`
  // (not `price`) because the currency is part of the field's identity.
  priceInr: z.number().nonnegative().default(0),
  currency: z.string().min(1).default('INR'),
  // When false, the artifact is hidden from the public storefront but still
  // visible to authenticated admin editors. Absent values are treated as
  // active (true) by the public /api/artifacts endpoint, preserving backward
  // compatibility with existing catalog entries.
  isActive: z.boolean().optional(),
});

// ── Full catalog ──────────────────────────────────────────────────────
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
