'use client';

import { useEffect, useState, useCallback } from 'react';

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProfile(readStorage());
  }, []);

  const saveProfile = useCallback((data: UserProfile) => {
    const next: UserProfile = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setProfile(next);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage full or private mode — ignore
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Unavailable — ignore
    }
  }, []);

  return { profile, saveProfile, clearProfile, mounted };
}