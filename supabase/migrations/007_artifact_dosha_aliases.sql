-- AstroVeda artifact dosha aliases.
--
-- WHY THIS COLUMN EXISTS
-- ---------------------
-- lib/artifactRecommender.ts expands a dosha into every spelling we have seen in
-- the wild before intersecting it with a catalog row's doshas, using the
-- catalog-level `doshaAliases` map ({ canonicalDosha: [alias, ...] }). That map
-- used to live in `data/artifacts.json`, which was deleted when the catalog moved
-- into Postgres (003). lib/serverArtifactCatalog.ts therefore has nowhere to read
-- it from and returns `{}`, so the alias expansion has been inert: matching only
-- works on the canonical keys both sides already happen to agree on.
--
-- WHY IT IS STORED ON EVERY ARTIFACT ROW
-- --------------------------------------
-- The map is catalog-level in the app's shape but has no table of its own, and
-- the admin editor saves the catalog as a FULL REPLACE (delete-then-upsert in
-- lib/serverArtifactCatalog.ts) — so there is no singleton "settings" row to hang
-- it on, and no way to add one without changing the replace semantics that the
-- editor depends on. Storing it per artifact row keeps the existing write path
-- intact: the writer broadcasts the catalog-level map onto every row, and the
-- loader unions the rows back into the single map the recommender wants. The
-- union is a lookup by canonical key, so it is idempotent and a row carrying no
-- aliases simply contributes nothing. The catalog is a handful of rows, so the
-- duplication costs nothing.
--
-- THIS MIGRATION BACKFILLS NOTHING
-- ---------------------------------
-- '{}' is a valid, no-op default: matching on canonical keys keeps working, so
-- the recommender behaves exactly as it does today until the admin sets real
-- aliases in the catalog editor at /admin/artifacts. Inventing an astrological
-- vocabulary here would ship unreviewed domain content, so it is deliberately
-- left to the admin.
--
-- CONVENTIONS (mirrors 003_artifact_catalog.sql): additive, idempotent, and
-- safe to run before OR after the code deploy. `loadArtifactCatalog` skips rows
-- whose value is not a `{ string: string[] }` map, so the column is unreadable
-- on a not-yet-migrated database but never fatal.

alter table public.artifacts
  add column if not exists dosha_aliases jsonb not null default '{}'::jsonb;

comment on column public.artifacts.dosha_aliases is
  'Map of { canonicalDosha: [alias, ...] } used by the recommender to match user doshas against artifact doshas.';
