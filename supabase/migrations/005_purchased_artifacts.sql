-- AstroVeda purchased-artifacts schema (store checkout ownership).
--
-- WHY THIS TABLE EXISTS
-- ---------------------
-- Store checkout (Phase 2 / Task 11) settles a Razorpay order whose amount is
-- validated server-side against `artifacts.price_inr` at order creation. Once
-- the order is PAID, this table is the durable record that the buyer owns the
-- item — the same role `purchased_kundli_reports` (002) plays for paid report
-- unlocks. Without it, ownership would live only in the browser.
--
-- WHERE THIS DELIBERATELY DIFFERS FROM 002
--   * NO foreign key to `artifacts`. The admin catalog editor does a
--     delete-then-upsert FULL REPLACE (`lib/serverArtifactCatalog.ts`), so a
--     row referencing an artifact that the admin later renames/removes must
--     survive. `artifact_name` and `price_inr` are snapshotted here at purchase
--     time for exactly that reason (receipts must not mutate with the catalog).
--   * `order_id` is UNIQUE — the Razorpay order id is the idempotency key:
--     one order can never produce two ownership rows, so a repeated
--     /api/payment/verify submission is safe.
--
-- CONVENTIONS (mirrors 001/002/003): snake_case columns, timestamptz
-- created_at default now(), named indexes `{table}_{purpose}_idx`, RLS enabled,
-- service role (Node service client) does ALL writes via the RPC below.

create table if not exists public.purchased_artifacts (
  id uuid primary key default gen_random_uuid(),

  -- Primary ownership key. Anonymous buyers pass the checkout email so they
  -- can be looked up by support / a future "purchases by email" flow.
  owner_email text not null,

  -- Nullable FK for signed-in buyers (profile tab listing, later follow-up).
  user_id uuid references auth.users(id) on delete cascade,

  -- `artifacts.id` slug (NO FK — see header) + receipt snapshots.
  artifact_id text not null,
  artifact_name text not null default '',
  price_inr numeric(12,2) not null default 0 check (price_inr >= 0),
  currency text not null default 'INR',

  -- Razorpay ids: order_id is the idempotency key (unique).
  order_id text not null unique,
  payment_id text not null,

  created_at timestamptz not null default now()
);

create index if not exists purchased_artifacts_email_idx
  on public.purchased_artifacts (owner_email, created_at desc);
create index if not exists purchased_artifacts_user_idx
  on public.purchased_artifacts (user_id, created_at desc)
  where user_id is not null;
create index if not exists purchased_artifacts_artifact_idx
  on public.purchased_artifacts (artifact_id);

alter table public.purchased_artifacts enable row level security;

drop policy if exists "purchased artifacts select own" on public.purchased_artifacts;
create policy "purchased artifacts select own" on public.purchased_artifacts
  for select using (
    auth.uid() = user_id
    -- email recovery, mirroring 002's policy
    or (lower(auth.email()) = lower(owner_email))
  );

-- Writes happen exclusively via the service role (function below), so no
-- insert/update/delete policies are defined.

-- Idempotent record of a purchase: insert, and on a repeat verification of the
-- same order (unique order_id) just refresh payment_id / backfill user_id.
-- Returns the row id so verification can confirm the write.
create or replace function public.record_purchased_artifact(
  p_owner_email text,
  p_artifact_id text,
  p_artifact_name text default '',
  p_price_inr numeric default 0,
  p_currency text default 'INR',
  p_order_id text,
  p_payment_id text,
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
    raise exception 'owner_email is required to record a purchased artifact';
  end if;
  if p_artifact_id is null or p_artifact_id = '' then
    raise exception 'artifact_id is required to record a purchased artifact';
  end if;
  if p_order_id is null or p_order_id = '' then
    raise exception 'order_id is required to record a purchased artifact';
  end if;

  insert into public.purchased_artifacts
    (owner_email, user_id, artifact_id, artifact_name, price_inr, currency,
     order_id, payment_id)
  values
    (v_lower_email, p_user_id, p_artifact_id, p_artifact_name, p_price_inr,
     p_currency, p_order_id, p_payment_id)
  on conflict (order_id)
  do update set
    payment_id = p_payment_id,
    -- Never overwrite an existing account binding with null.
    user_id = coalesce(public.purchased_artifacts.user_id, p_user_id)
  returning id into v_id;

  return v_id;
end;
$$;
