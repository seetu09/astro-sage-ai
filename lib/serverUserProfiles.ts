import { getServiceSupabase } from "./serverWallet";

/**
 * Server-side persistent user birth-details profile (Supabase `public.user_profiles`).
 *
 * The birth details (DOB / time / place / coordinates / timezone) are now
 * stored server-side instead of only in browser localStorage:
 *   - `app/hooks/useUserProfile.ts` keeps `localStorage` as a fast client-side
 *     cache + hydration source (it still powers the free kundali/matchmaking/
 *     chat/dosha-checker/numerology page pre-fill).
 *   - This module is the single server-side authority for writing + reading
 *     those values, via the `public.upsert_user_profile` RPC (service role,
 *     bypasses RLS), mirroring how `lib/serverPurchasedReports.ts` owns the
 *     paid kundli report rows.
 *
 * Auth: the user_id is always resolved server-side from the Bearer token
 * (`getUserFromAuthHeader` in `lib/serverWallet.ts`), so a signed-out client
 * can never pick which row it writes to. Anonymous users (guest) do not get a
 * row — callers should treat a null result as "no profile yet".
 *
 * Requires the `009_user_profiles` migration to have been applied.
 */

/** Read row returned by `public.get_user_profile`. */
export interface UserProfileRow {
  id: string;
  user_id: string;
  email: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  updated_at: string;
  client_name: string;
  created_at: string;
}

/**
 * Persist one user's birth details server-side (idempotent upsert).
 *
 * Call this on sign-in (so a brand-new user gets a row) and whenever the
 * client's `saveProfile()` changes. Prefer the single `saveUserProfile()`
 * wrapper below so callers can't partially update a row.
 *
 * @param userId - resolved from the authenticated user's Bearer token
 * @param email  - the account email (recovery key; lowercased server-side)
 * @param birthDetails - the birth details the user just saved
 */
export async function upsertUserProfileRow({
  userId,
  email,
  birthDate,
  birthTime,
  birthPlace,
  latitude,
  longitude,
  timezone,
  clientName,
}: {
  userId: string;
  email: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  clientName: string;
}): Promise<string | null> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc("upsert_user_profile", {
      p_user_id: userId,
      p_email: email,
      p_birth_date: birthDate,
      p_birth_time: birthTime,
      p_birth_place: birthPlace,
      p_latitude: latitude,
      p_longitude: longitude,
      p_timezone: timezone,
      p_client_name: clientName,
      p_updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("USER_PROFILES_UPSERT_FAILED", error.message, error.code);
      return null;
    }
    return data ? String(data) : null;
  } catch (err) {
    console.error("USER_PROFILES_UPSERT_ERR", err);
    return null;
  }
}

/**
 * Save a full user profile in one write (client wrapper over the RPC).
 * Mirrors the `saveProfile()` shape used by `useUserProfile()` + the pages.
 */
export async function saveUserProfile({
  userId,
  email,
  profile,
}: {
  userId: string;
  email: string;
  profile: {
    name: string;
    dob: string;
    tob: string;
    place: string;
    latitude: number | null;
    longitude: number | null;
    timezone: string;
  };
}): Promise<string | null> {
  return upsertUserProfileRow({
    userId,
    email,
    birthDate: profile.dob,
    birthTime: profile.tob,
    birthPlace: profile.place,
    latitude: profile.latitude,
    longitude: profile.longitude,
    timezone: profile.timezone,
    clientName: profile.name || "User",
  });
}

/**
 * Read the current profile row for a signed-in user.
 * Returns null when no row exists yet (never an error) so the client can fall
 * back to localStorage / default values.
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfileRow | null> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc("get_user_profile", {
      p_user_id: userId,
    });
    if (error) {
      console.error("USER_PROFILES_READ_FAILED", error.message, error.code);
      return null;
    }
    // `get_user_profile` returns a SETOF rows; PostgREST gives us an array.
    const rows = Array.isArray(data) ? data : [];
    return rows[0] as UserProfileRow | null;
  } catch (err) {
    console.error("USER_PROFILES_READ_ERR", err);
    return null;
  }
}
