'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export interface UserProfile {
  name: string;
  dob: string;
  tob: string;
  city: string;
  lat: number | null;
  lon: number | null;
  timeUnknown?: boolean;
  updatedAt?: string;
}

const STORAGE_KEY = 'astro_user_profile';
const LEGACY_STORAGE_KEY = 'astroveda_birth_details';

interface LegacyBirthDetails {
  name?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  timeUnknown?: boolean;
  placeOfBirth?: string;
}

function readStorage(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile;
      if (parsed && typeof parsed === 'object') return parsed;
    }
    // Back-compat: migrate from BirthDetailsModal's legacy storage key
    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as LegacyBirthDetails;
      if (legacy && typeof legacy === 'object') {
        const migrated: UserProfile = {
          name: legacy.name || '',
          dob: legacy.dateOfBirth || '',
          tob: (legacy.timeUnknown ? '12:00' : legacy.timeOfBirth) || '',
          city: legacy.placeOfBirth || '',
          lat: null,
          lon: null,
          timeUnknown: legacy.timeUnknown || false,
          updatedAt: new Date().toISOString(),
        };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        } catch {
          // Storage full / private mode — ignore
        }
        return migrated;
      }
    }
  } catch {
    // JSON parse error or storage unavailable — ignore
  }
  return null;
}

export function useUserProfile() {
  // AuthContext is the authority when the user is signed in:
  //  - `authUser`   — signed-in Supabase user (null for guests)
  //  - `authProfile`— profile derived from the server row (already in hook
  //                   shape — see mapServerUserProfile in AuthContext)
  //  - `authSaveProfile` — AuthContext.saveProfile(): updates AuthContext
  //    state and performs the fire-and-forget server write (option (a)).
  //    We must NOT call saveUserProfile() ourselves or we'd double-write.
  const { user: authUser, profile: authProfile, saveProfile: authSaveProfile } = useAuth();

  // Local (localStorage) shape. Kept in state as the readStorage() mirror so
  // the memoized resolution below has a STABLE identity across renders —
  // app/kundali has useEffect(..., [profile]) and a fresh object per render
  // would re-run it and overwrite in-progress form edits.
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  // One-shot local → server migration guard, keyed by user id. Set BEFORE the
  // push so React StrictMode's double-invoked effects can't push twice, and
  // so no effect loop can occur while AuthContext state settles.
  const migratedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setLocalProfile(readStorage());
  }, []);

  // One-shot migration seed: register() creates the server row with EMPTY
  // birth fields, so a guest who already typed details into localStorage
  // would see a blank form once the server row wins. Push local → server
  // exactly once per signed-in user, only when we observe an empty server
  // row AND local data exists. NOT a "push on every render": the ref guard
  // plus the empty-server-row condition make it fire at most once — after
  // the push, AuthContext's profile is non-empty and this branch is dead.
  useEffect(() => {
    if (!authUser || !authProfile) return;
    const serverEmpty = !authProfile.dob && !authProfile.tob && !authProfile.city;
    if (!serverEmpty) return;
    if (migratedForUserRef.current === authUser.id) return;
    const local = readStorage();
    if (!local || !(local.dob || local.tob || local.city)) return;
    // Mark first: guarantees one-shot even if state updates double-fire.
    migratedForUserRef.current = authUser.id;
    authSaveProfile(local);
    setLocalProfile(local);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, authProfile]);

  // Resolution order (memoized for stable identity):
  //  1. Not mounted → null (hydration parity, unchanged).
  //  2. Guest → localStorage shape (unchanged guest path).
  //  3. Signed in + server row has data → server wins; local only consulted
  //     for `timeUnknown`, which the server schema cannot store.
  //  4. Signed in + server row blank + local has data → local (migration
  //     effect pushes it server-side; render local first, no flicker).
  //  5. Signed in + server row not loaded → localStorage (no blank form).
  // Return shape stays UserProfile (city/lat/lon) — no page changes.
  const profile = useMemo<UserProfile | null>(() => {
    if (!mounted) return null;
    if (!authUser) return localProfile;
    if (authProfile) {
      const serverEmpty = !authProfile.dob && !authProfile.tob && !authProfile.city;
      if (serverEmpty) {
        if (localProfile && (localProfile.dob || localProfile.tob || localProfile.city)) {
          return localProfile;
        }
        return authProfile;
      }
      // Server wins. Preserve timeUnknown from local cache: the server row
      // has no column for it (mapServerUserProfile hardcodes false), so
      // without this a saved "time unknown" would flip back for users.
      return {
        ...authProfile,
        timeUnknown: authProfile.timeUnknown ?? localProfile?.timeUnknown ?? false,
      };
    }
    return localProfile;
  }, [mounted, authUser, authProfile, localProfile]);

  const saveProfile = useCallback(
    (data: UserProfile) => {
      const next: UserProfile = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      // Always update local state + localStorage (cache, never awaited).
      setLocalProfile(next);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Storage full / private mode — ignore
        }
      }
      // Signed in → also hand off to AuthContext, which updates its own
      // state and performs the server write (fire-and-forget, option (a)).
      // Guests get the localStorage write only. No double server write:
      // we never call saveUserProfile() directly from this hook.
      if (authUser) {
        authSaveProfile(next);
      }
    },
    [authUser, authSaveProfile]
  );

  const clearProfile = useCallback(() => {
    // Clears the LOCAL CACHE ONLY. The server row is authoritative once
    // signed in and is never deleted from this hook.
    setLocalProfile(null);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Unavailable — ignore
      }
    }
    if (authUser && authProfile && (authProfile.dob || authProfile.tob || authProfile.city)) {
      console.warn(
        'USER_PROFILE_CLEAR_LOCAL_ONLY',
        'clearProfile() cleared only the localStorage cache; the server row still has birth details and remains authoritative.'
      );
    }
    // TODO: add a proper "delete my data" server endpoint (e.g. a
    // delete_user_profile RPC) so users can request erasure of the
    // user_profiles row. Do NOT delete the row from this client hook.
  }, [authUser, authProfile]);

  return { profile, saveProfile, clearProfile, mounted };
}