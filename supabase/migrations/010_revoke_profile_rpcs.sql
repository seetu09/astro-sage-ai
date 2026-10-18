-- Revoke client-role EXECUTE on the profile RPCs (Task follow-up, review of 009).
--
-- WHY THIS IS NEEDED
-- ------------------
-- Migration 009 enables RLS on public.user_profiles but ships the three
-- profile RPCs as `security definer` functions. RLS default-deny protects the
-- TABLE (anon/authenticated see zero rows), but it does NOT protect a
-- security-definer function: Postgres grants EXECUTE on new functions to
-- PUBLIC by default, and Supabase exposes `public` schema functions over the
-- PostgREST /rpc endpoint. That means anyone holding the anon key (which
-- ships in every browser bundle BY DESIGN) could call e.g.
--   POST /rest/v1/rpc/get_user_profile {"p_user_id": "<uuid>"}"
-- and read, overwrite, or delete ANOTHER user's birth details if they could
-- guess that user's uuid — an IDOR that bypasses RLS entirely, because the
-- function body runs with owner privileges.
--
-- These functions are only ever invoked server-side through the service-role
-- client (lib/serverUserProfiles.ts), so no app code path needs anon or
-- authenticated EXECUTE. Service role is exempt from EXECUTE revocation by
-- default in Supabase, so the server read/write path keeps working.
--
-- CONVENTION
-- ----------
-- Follows migration 004_kundali_charts.sql, which revokes table privileges
-- from anon/authenticated as belt-and-braces on top of RLS. Here we revoke
-- EXECUTE on the functions instead of table grants.
--
-- ARGUMENT SIGNATURES
-- -------------------
-- REVOKE matches functions by FULL argument signature (schema + argument
-- types only; parameter names and defaults are ignored). The signatures below
-- are copied exactly from the `create ... function` declarations in 009:
--   upsert_user_profile(uuid, text, text, text, text, numeric, numeric, text, text, timestamptz)
--   get_user_profile(uuid)
--   delete_user_profile(uuid)
-- A mismatched signature makes REVOKE silently no-op, so the assertion block
-- at the bottom FAILS THE MIGRATION if any grant survives.

revoke execute
  on function public.upsert_user_profile(uuid, text, text, text, text, numeric, numeric, text, text, timestamptz)
  from public, anon, authenticated;

revoke execute
  on function public.get_user_profile(uuid)
  from public, anon, authenticated;

revoke execute
  on function public.delete_user_profile(uuid)
  from public, anon, authenticated;

-- --- ASSERTION: fail loudly if any client-role grant remains -----------------
do $$
declare
  bad_count int;
begin
  select count(*) into bad_count
  from information_schema.routine_privileges
  where routine_schema = 'public'
    and routine_name in ('upsert_user_profile','get_user_profile','delete_user_profile')
    and grantee in ('anon','authenticated','PUBLIC');
  if bad_count > 0 then
    raise exception 'Profile RPC revoke incomplete: % grants remain', bad_count;
  end if;
end $$;
