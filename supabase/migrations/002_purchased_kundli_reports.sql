-- AstroVeda purchased-kundli-reports schema (report ownership).
-- Email-based ownership model:
--   * A report is keyed by (owner_email, chart_fingerprint) so an anonymous
--     user can purchase and later RECOVER it with the same email — no account
--     required at purchase time.
--   * When the purchaser IS signed into a Supabase account, user_id is also
--     populated, which lets the profile "Downloaded Reports" tab list the
--     report under their account with no additional step.
--   * Mirrors 001_wallet_schema.sql conventions:
--       - service role (RPC / Node service client) does ALL writes,
--       - RLS grants users SELECT on their own rows only.
--
-- A row here means the purchaser PAID and OWNS this report. This is the
-- durable server-side record that survives refresh / session / device, and
-- it authorizes the profile's "Downloaded Reports" re-downloads without
-- re-payment. It is NOT a browser flag.

create table if not exists public.purchased_kundli_reports (
  id uuid primary key default gen_random_uuid(),

  -- Primary ownership key. Always present — anonymous purchases pass the
  -- checkout email here; signed-in purchases pass the account email.
  owner_email text not null,

  -- Nullable FK for signed-in owners (lets the profile tab list reports
  -- belonging to the auth user without an email equality check).
  user_id uuid references auth.users(id) on delete cascade,

  -- Stable hash of latitude|longitude|dateOfBirth|timeOfBirth|timezone so the
  -- same chart bought twice collapses to one owned report per email.
  chart_fingerprint text not null,

  client_name text not null default 'User',
  birth_date text not null default '',
  birth_time text not null default '',
  order_id text not null,
  payment_id text not null,

  -- Full paid report payload (chartData, calculations, pillars, paidTier,
  -- richPredictions, freeTier, narratives) so it can be re-read for PDF
  -- downloads without server-side regeneration.
  report jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  unique (owner_email, chart_fingerprint)
);

create index if not exists purchased_kundli_reports_email_idx
  on public.purchased_kundli_reports (owner_email, created_at desc);
create index if not exists purchased_kundli_reports_user_idx
  on public.purchased_kundli_reports (user_id, created_at desc)
  where user_id is not null;

alter table public.purchased_kundli_reports enable row level security;

drop policy if exists "purchased reports select own" on public.purchased_kundli_reports;
create policy "purchased reports select own" on public.purchased_kundli_reports
  for select using (
    auth.uid() = user_id
    -- allow lookup by email for the anonymous recovery / verification path:
    or (lower(auth.email()) = lower(owner_email))
  );

-- Writes happen exclusively via the service role (functions below), so no
-- insert/update policies are needed.

-- Idempotent record of a purchase: upsert on (owner_email, chart_fingerprint).
-- owner_email is the recovery key; user_id is populated only when the buyer
-- was signed in. Returns the row id so verification can confirm the write.
create or replace function public.record_purchased_kundli(
  p_owner_email text,
  p_chart_fingerprint text,
  p_client_name text,
  p_birth_date text,
  p_birth_time text,
  p_order_id text,
  p_payment_id text,
  p_report jsonb default '{}'::jsonb,
  p_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_lower_email text := lower(trim(both ' ' from p_owner_email));
begin
  if v_lower_email is null or v_lower_email = '' then
    raise exception 'owner_email is required to record a purchased kundli report';
  end if;

  insert into public.purchased_kundli_reports
    (owner_email, user_id, chart_fingerprint, client_name, birth_date,
     birth_time, order_id, payment_id, report)
  values
    (v_lower_email, p_user_id, p_chart_fingerprint, p_client_name,
     p_birth_date, p_birth_time, p_order_id, p_payment_id, p_report)
  on conflict (owner_email, chart_fingerprint)
  do update set
    order_id = p_order_id,
    payment_id = p_payment_id,
    report = p_report,
    client_name = p_client_name,
    birth_date = p_birth_date,
    birth_time = p_birth_time,
    -- Only backfill user_id if we don't already have a signed-in owner;
    -- never overwrite an existing account binding with null.
    user_id = coalesce(public.purchased_kundli_reports.user_id, p_user_id),
    created_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

-- Idempotent upsert that re-binds an email-keyed report to a newly created /
-- signed-in account (e.g. the user registered after purchasing as a guest, and
-- now uses the profile tab). Safe no-op if there's no matching email.
create or replace function public.bind_purchased_kundli_to_user(
  p_owner_email text,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.purchased_kundli_reports
  set user_id = p_user_id
  where lower(owner_email) = lower(trim(both ' ' from p_owner_email))
    and user_id is null;
end;
$$;