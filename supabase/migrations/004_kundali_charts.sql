-- AstroVeda kundali chart cache schema.
--
-- WHY THIS MIGRATION EXISTS
-- -------------------------
-- `public.kundali_charts` is read/written by app/api/kundali/generate/route.ts
-- (cache of deterministic computeChart() output keyed by birth details), but it
-- was created by hand in the Supabase dashboard and never recorded here — so
-- its columns, its RLS state, and its policies were unknowable from the repo.
-- Worse, the route used to write through the ANON-key client: for that to work
-- at all, a permissive insert policy must exist, which means (policy on) any
-- unauthenticated visitor could write arbitrary rows, or (policy off) every
-- write silently failed and the cache never populated.
--
-- THE STRICT MODEL THIS MIGRATION ENFORCES
--   * RLS is ENABLED and EVERY pre-existing policy is dropped (we cannot audit
--     what the dashboard created), leaving ZERO policies:
--       - `anon` / `authenticated` → denied all row access (the `revoke` below
--         also makes the denial loud — "permission denied" instead of a silent
--         empty result), so only server code can touch the cache.
--       - `service_role` bypasses RLS (Supabase built-in), which is what the
--         route now uses (getServiceSupabase()).
--       - the table owner (postgres / SQL editor) keeps direct access, since
--         FORCE ROW LEVEL SECURITY is deliberately NOT set — dashboard
--         debugging must keep working.
--   * The route reads/writes with the service role and checks both `{error}`
--     results, so a failure is logged instead of invisible.
--
-- The code works whether or not this migration is applied (service role bypasses
-- RLS either way), so applying it before or after deploy is safe.
--
-- CONVENTIONS (mirrors 001/002/003): snake_case columns, timestamptz
-- created_at default now(), named index `{table}_{purpose}_idx`, RLS enabled,
-- service role does ALL reads/writes from the app.

create table if not exists public.kundali_charts (
  -- Deterministic hash of the normalized birth details (see buildCacheKey in
  -- app/api/kundali/generate/route.ts). Upsert target for the cache.
  cache_key text primary key,

  -- Normalized birth inputs, kept for observability/debugging of cache rows.
  birth_details jsonb not null default '{}'::jsonb,

  -- The computed chart payload (ChartData shape from lib/astrology.ts).
  chart_data jsonb not null,

  created_at timestamptz not null default now()
);

-- Supports periodic cache pruning / inspection by age.
create index if not exists kundali_charts_created_at_idx
  on public.kundali_charts (created_at);

alter table public.kundali_charts enable row level security;

-- Drop EVERY existing policy: this table predates the repo's migration control,
-- so whatever policy name the dashboard created must not survive.
do $$
declare
  pol record;
begin
  for pol in
    select policyname
      from pg_policies
     where schemaname = 'public'
       and tablename = 'kundali_charts'
  loop
    execute format('drop policy %I on public.kundali_charts', pol.policyname);
  end loop;
end $$;

-- Zero policies + RLS enabled = deny by default for anon/authenticated.
-- Belt-and-braces: revoke table privileges too, so a stray anon-key query
-- fails loudly (permission denied) instead of returning a silent empty set.
revoke all on public.kundali_charts from anon, authenticated;

-- No select/insert/update/delete policies are defined — by design. The app
-- reads and upserts exclusively through getServiceSupabase() (service role,
-- bypasses RLS).
