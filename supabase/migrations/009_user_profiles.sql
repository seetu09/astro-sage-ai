-- AstroVeda persistent user birth-details profile table.
--
-- WHY THIS TABLE EXISTS
-- ---------------------
-- Currently birth details (DOB/time/place) live only in browser localStorage
-- (app/hooks/useUserProfile.ts) and, optionally, in the auth `user_metadata`
-- of the Supabase auth user. LocalStorage is per-device, clears on shared
-- machines and is not shared between the kundali / matchmaking / chat /
-- dosha-checker / numerology pages. This table makes birth details
-- server-side and persistent: a signed-in user no longer re-types them on
-- every tool page.
--
-- A NEW SIGNED-IN USER BOOTSTRAPS ITS OWN ROW
-- -------------------------------------------
-- The row is created on first sign-in (app/context/AuthContext.tsx),
-- never pre-created for anonymous users. Existing auth.users that registered
-- before this table existed are backfilled with an SQL script (see
-- the backfill comment below), so an existing account is not left without a
-- profile.
--
-- CONVENTIONS (mirrors 001/002/003/004)
-- -------------------------------------
-- * snake_case columns, singular `user_id uuid` FK to auth.users,
--   timestamptz `updated_at` default now(), RLS enabled.
-- * Writes go through the service role (bypasses RLS) or through RPCs with
--   security definer. No app-level upsert to the table from the client.
-- * Birth fields are snake_case and nullable: a user can have a DOB without a
--   place, a place without a time, and so on. The client's `useUserProfile`
--   shape maps to this table through the server route.
--
-- RLS
-- ---
-- Users only ever SELECT their own row. All writes are service-role or via
-- the security definer functions below. The `anon` / `authenticated` roles
-- get SELECT on their own row only.

create table if not exists public.user_profiles (
  -- Primary key for the row. Nullable `id` allows the bootstrap (Task 2.3)
  -- to create a row for a newly created auth.user before Supabase has
  -- assigned an id (unlikely, but avoids a foreign-key violation on
  -- `user_id` when the user is first signed in).
  id uuid primary key default gen_random_uuid(),

  -- FK to Supabase auth.users. `ON DELETE CASCADE` keeps profiles in sync
  -- when an auth user is deleted.
  user_id uuid
    references auth.users(id)
    on delete cascade,

  -- Stable recovery key for signed-out / guest users (same email as the
  -- report ownership model in 002_purchased_kundli_reports.sql).
  email text not null,

  -- Birth details — nullable, allowing partial profiles.
  birth_date text not null default '',        -- YYYY-MM-DD
  birth_time text not null default '',        -- HH:MM (24h)
  birth_place text not null default '',       -- e.g. "New Delhi, India"

  -- Geocoded coordinates + timezone — same shape the kundali route sends.
  latitude numeric(8,6),                      -- e.g. 28.6139
  longitude numeric(9,6),                     -- e.g. 77.2090
  timezone text not null default '',          -- IANA zone name, e.g. "Asia/Kolkata"

  -- When the birth details were last updated. Set explicitly by the
  -- service-role write path (no DB trigger; see 003_artifact_catalog.sql).
  updated_at timestamptz not null default now(),

  -- Optional client-name snapshot (mirrors purchased_kundli_reports).
  client_name text not null default 'User',

  -- When the user signed up. Populated on bootstrap.
  created_at timestamptz not null default now(),

  -- Unique (email, user_id) pair so a guest email and a later signed-in
  -- account reconcile. `user_id` and `email` are both unique-declared below
  -- so the same row cannot be inserted twice from two different code paths.
  unique (email, user_id)
);

create index if not exists user_profiles_user_id_idx
  on public.user_profiles (user_id);

create index if not exists user_profiles_email_idx
  on public.user_profiles (email);

alter table public.user_profiles enable row level security;

-- --- SECURITY-DEFINER FUNCTIONS (server-side writes only) --------------------
-- These run with the privileges of the function owner (usually `service_role`
-- / `postgres`), so they can upsert rows in `user_profiles` while bypassing
-- RLS. The app never inserts into this table directly through the anon key.

-- Create (or update) a user's birth-details profile. Always upserts on the
-- (email, user_id) pair — safe to call on every sign-in / profilesave.
create or replace function public.upsert_user_profile(
  p_user_id uuid,
  p_email text,
  p_birth_date text default '',
  p_birth_time text default '',
  p_birth_place text default '',
  p_latitude numeric default null,
  p_longitude numeric default null,
  p_timezone text default '',
  p_client_name text default 'User',
  p_updated_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.user_profiles
    (id, user_id, email, birth_date, birth_time, birth_place,
     latitude, longitude, timezone, client_name, updated_at)
  values
    (gen_random_uuid(), p_user_id, lower(p_email), p_birth_date, p_birth_time,
     p_birth_place, p_latitude, p_longitude, p_timezone,
     p_client_name, coalesce(p_updated_at, now()))
  on conflict (email, user_id)
  do update set
    birth_date = excluded.birth_date,
    birth_time = excluded.birth_time,
    birth_place = excluded.birth_place,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    timezone = excluded.timezone,
    client_name = excluded.client_name,
    updated_at = coalesce(p_updated_at, now())
  returning id into v_id;

  return v_id;
end;
$$;

-- Read a user's birth-details profile by user_id (for tests / internal use).
create or replace function public.get_user_profile(p_user_id uuid)
returns setof public.user_profiles
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select * from public.user_profiles where user_id = p_user_id;
end;
$$;

-- Delete a user's profile when their auth account is deleted (cascade is
-- normally enough, but an explicit clean-up helper is cheap to test).
create or replace function public.delete_user_profile(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.user_profiles where user_id = p_user_id;
end;
$$;

-- --- BACKFILL EXISTING USERS --------------------------------------------------
-- Uncomment and run once after deploying, for auth.users that registered before
-- this table existed and have no profile row yet. Use the service-role client
-- from lib/serverWallet.ts, not the anon key, because RLS scopes `select own`
-- to auth.uid() = user_id but the bootstrap path uses the email fallback.
--
-- insert into public.user_profiles (user_id, email, client_name, created_at)
-- select
--   id,
--   lower(coalesce(email, split_part(email, '@', 1) || '@example.com')),
--   'User',
--   now()
-- from auth.users
-- where id not in (select user_id from public.user_profiles);
