-- AstroVeda wallet schema (Phase 4: server-side monetization enforcement)
-- Run in Supabase SQL editor or via `supabase db push`.

-- 1) One wallet row per user. free_questions_used counts the first N free chats.
create table if not exists public.wallet_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance numeric(12,2) not null default 0 check (balance >= 0),
  free_questions_used integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 2) Append-only ledger of credits/debits.
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('wallet_topup', 'chat_usage')),
  amount numeric(12,2) not null,          -- positive = credit, negative = debit
  currency text not null default 'INR',
  status text not null default 'completed',
  order_id text,
  payment_id text,
  description text,
  created_at timestamptz not null default now()
);
create index if not exists wallet_transactions_user_idx on public.wallet_transactions (user_id, created_at desc);

alter table public.wallet_balances enable row level security;
alter table public.wallet_transactions enable row level security;

drop policy if exists "wallet select own" on public.wallet_balances;
create policy "wallet select own" on public.wallet_balances
  for select using (auth.uid() = user_id);

drop policy if exists "wallet tx select own" on public.wallet_transactions;
create policy "wallet tx select own" on public.wallet_transactions
  for select using (auth.uid() = user_id);

-- Writes happen exclusively via the service role (RPC below), so no insert/update policies.

-- 3) Atomic per-question debit: free tier (first 3), then ₹5 wallet charge.
--    Returns 'free' | 'wallet' | 'insufficient'.
create or replace function public.consume_chat_credit(p_user uuid, p_free_limit integer default 3, p_price numeric default 5)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_free_used integer;
  v_balance numeric;
begin
  insert into public.wallet_balances (user_id) values (p_user)
  on conflict (user_id) do nothing;

  select free_questions_used, balance into v_free_used, v_balance
  from public.wallet_balances where user_id = p_user for update;

  if v_free_used < p_free_limit then
    update public.wallet_balances
      set free_questions_used = free_questions_used + 1, updated_at = now()
      where user_id = p_user;
    insert into public.wallet_transactions (user_id, type, amount, description)
      values (p_user, 'chat_usage', 0, 'Free question used');
    return 'free';
  end if;

  if v_balance >= p_price then
    update public.wallet_balances
      set balance = balance - p_price, updated_at = now()
      where user_id = p_user;
    insert into public.wallet_transactions (user_id, type, amount, description)
      values (p_user, 'chat_usage', -p_price, 'AI astrologer question (₹5)');
    return 'wallet';
  end if;

  return 'insufficient';
end;
$$;

-- 5) Refund a charged question when the AI call fails before answering
--    (restores free quota or wallet balance).
create or replace function public.refund_chat_credit(
  p_user uuid, p_charged_as text, p_price numeric default 5
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_charged_as = 'free' then
    update public.wallet_balances
      set free_questions_used = greatest(free_questions_used - 1, 0), updated_at = now()
      where user_id = p_user;
  elsif p_charged_as = 'wallet' then
    update public.wallet_balances
      set balance = balance + p_price, updated_at = now()
      where user_id = p_user;
    insert into public.wallet_transactions (user_id, type, amount, description)
      values (p_user, 'chat_usage', p_price, 'Refund — AI service unavailable');
  end if;
end;
$$;

create or replace function public.credit_wallet(
  p_user uuid, p_amount numeric, p_order_id text default null, p_payment_id text default null
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance numeric;
begin
  insert into public.wallet_balances (user_id, balance) values (p_user, p_amount)
  on conflict (user_id) do update set balance = wallet_balances.balance + p_amount, updated_at = now()
  returning balance into v_new_balance;

  insert into public.wallet_transactions (user_id, type, amount, order_id, payment_id, description)
    values (p_user, 'wallet_topup', p_amount, p_order_id, p_payment_id, 'Wallet top-up');

  return v_new_balance;
end;
$$;
