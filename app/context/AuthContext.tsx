"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseClient, uploadAvatar as uploadAvatarToStorage } from "../../lib/supabase";
import { getUserProfile, saveUserProfile } from "../../lib/serverUserProfiles";
import type { UserProfile } from "@/types/user";
import type { UserProfile as UserProfileHook } from "../../hooks/useUserProfile";

import type { UserProfileRow } from "../../lib/serverUserProfiles";

export type User = UserProfile;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  googleLogin: () => Promise<void>;
  sendPhoneOtp: (phoneNumber: string) => Promise<void>;
  verifyPhoneOtp: (phoneNumber: string, otp: string) => Promise<void>;
  profile: UserProfileHook | null;
  saveProfile: (data: UserProfileHook) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  resetPassword: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  uploadAvatar: async () => {},
  googleLogin: async () => {},
  sendPhoneOtp: async () => {},
  verifyPhoneOtp: async () => {},
  profile: null,
  saveProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

function mapSupabaseUser(user: SupabaseUser): User {
  const metadata = user.user_metadata;

  return {
    id: user.id,
    name: metadata.name || metadata.full_name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    phone: user.phone || undefined,
    avatar: metadata.avatar_url || metadata.picture,
    birthDate: metadata.birthDate,
    birthTime: metadata.birthTime,
    birthPlace: metadata.birthPlace,
    latitude: metadata.latitude,
    longitude: metadata.longitude,
    timezone: metadata.timezone,
  };
}

/** Populate the AuthContext `user` from a server-side `UserProfileRow`. */
function mapServerUserProfile(row: UserProfileRow): UserProfileHook {
  return {
    name: row.client_name,
    dob: row.birth_date,
    tob: row.birth_time,
    city: row.birth_place,
    lat: row.latitude ?? null,
    lon: row.longitude ?? null,
    timeUnknown: false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileHook | null>(null);
  const [profileMounted, setProfileMounted] = useState(false);
  // Last server-side profile row fetched for the signed-in user. Kept in
  // state (not a module-level variable) so `useEffect` / `useCallback` see
  // updates via the dependency array — mutating a module-level variable
  // doesn't re-render, so the pages wouldn't re-prefill.
  const [serverRow, setServerRow] = useState<UserProfileRow | null>(null);

  // Set this when the server-side profile row is loaded, then reconcile the
  // client `useUserProfile` state from it.
  const setUserProfileFromServerRow = useCallback((row: UserProfileRow) => {
    setServerRow(row);
    setProfile(mapServerUserProfile(row));
    setProfileMounted(true);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const sessionUser = data.session?.user;
        if (!sessionUser) {
          setUser(null);
          setProfile(null);
          setServerRow(null);
          return;
        }
        setUser(mapSupabaseUser(sessionUser));
        // Reconcile the client-side profile from the server-side row so the
        // user's persisted birth details (DOB/time/place) are authoritative.
        // The client's `useUserProfile` still falls back to localStorage for
        // unsigned users / first render; for a signed-in user the server row
        // wins and the next `saveProfile()` write goes through the RPC.
        try {
          const serverRow = await getUserProfile(sessionUser.id);
          if (serverRow) {
            setUserProfileFromServerRow(serverRow);
            setProfile(mapServerUserProfile(serverRow));
            setProfileMounted(true);
          }
        } catch (reconcileError) {
          // If we can't reach Supabase, the client's localStorage still
          // serves as the fallback — never block the session restore.
          console.error("USER_PROFILES_RECONCILE_FAILED", reconcileError);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
        setProfile(null);
        setServerRow(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    let unsubscribe: (() => void) | undefined;
    try {
      const supabase = getSupabaseClient();
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ? mapSupabaseUser(session.user) : null);
        // On sign-in / session restore via the listener, reconcile the
        // client profile from the server-side row if the user is signed in.
        // `setUser` only rewrites birth fields from `user_metadata`, which
        // may be stale vs the persisted server row.
        if (session?.user) {
          void (async () => {
            try {
              const serverRow = await getUserProfile(session.user.id);
              if (serverRow) {
                setUserProfileFromServerRow(serverRow);
                setProfile(mapServerUserProfile(serverRow));
                setProfileMounted(true);
              }
            } catch (reconcileError) {
              console.error("USER_PROFILES_ON_AUTH_STATECHANGE_FAILED", reconcileError);
            }
          })();
        }
        setIsLoading(false);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch (error) {
      console.error("Auth listener setup failed:", error);
    }

    return () => unsubscribe?.();
    // `setUserProfileFromServerRow` is a stable `useCallback` with an empty
    // dep array, so listing it here is a no-op but silences the lint rule
    // without an eslint-disable.
  }, [setUserProfileFromServerRow]);

  // Keep the client-side profile state in sync with the server row whenever
  // the server row changes, so pages reading `useAuth().profile` always see
  // the authoritative value.
  useEffect(() => {
    if (!serverRow) return;
    setProfile(mapServerUserProfile(serverRow));
    setProfileMounted(true);
  }, [serverRow]);

  const saveProfile: AuthContextType["saveProfile"] = useCallback((data) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : data));
    // Keep the server-row cache in sync so the avatar-save path (and the
    // sync useEffect) always see the freshest values; only overwrite the
    // birth fields the client actually changed.
    setServerRow((prev) =>
      prev
        ? {
            ...prev,
            client_name: data.name || prev.client_name,
            birth_date: data.dob,
            birth_time: data.tob,
            birth_place: data.city,
            latitude: data.lat,
            longitude: data.lon,
            updated_at: new Date().toISOString(),
          }
        : prev
    );
    // Write server-side immediately so the value survives refresh / device /
    // session loss; the client's localStorage is the fast cache.
    void saveUserProfile({
      userId: user?.id ?? "",
      email: user?.email ?? "",
      profile: {
        name: data.name,
        dob: data.dob,
        tob: data.tob,
        place: data.city,
        latitude: data.lat,
        longitude: data.lon,
        timezone: serverRow?.timezone || "Asia/Kolkata",
      },
    }).catch((err) => {
      console.error("USER_PROFILES_SAVE_FAILED", err);
      // Keep the client state (cache) intact even if the server write fails.
    });
    // `serverRow?.timezone` is only used as a fallback; listing it here
    // re-runs the callback when the timezone changes, which is cheap.
  }, [user, serverRow?.timezone]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) {
        throw new Error("Login failed. Please check your credentials and try again.");
      }
      const userId = data.user.id;
      const emailLower = (data.user.email ?? "").toLowerCase();
      // Reconcile the server-side profile row with what the client already has
      // in localStorage (or with the auth `user_metadata` birth fields). This
      // matters on first login: the user may have typed birth details on a
      // previous page that only lived in localStorage.
      try {
        const serverRow = await getUserProfile(userId);
        if (!serverRow) {
          await saveUserProfile({
            userId,
            email: emailLower,
            profile: {
              name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || email.split("@")[0] || "User",
              dob: data.user.user_metadata?.birthDate || "",
              tob: data.user.user_metadata?.birthTime || "",
              place: data.user.user_metadata?.birthPlace || "",
              latitude: data.user.user_metadata?.latitude ?? null,
              longitude: data.user.user_metadata?.longitude ?? null,
              timezone: data.user.user_metadata?.timezone || "Asia/Kolkata",
            },
          });
        }
      } catch (persistError) {
        // A failed write must not break the login flow; the client-only
        // localStorage still works as a fallback.
        console.error("USER_PROFILES_ON_LOGIN_FAILED", persistError);
      }
      setUser(mapSupabaseUser(data.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (userId) {
        // Create the server-side profile row immediately on sign-up so the
        // user's birth details can live server-side from the first page view.
        // Best-effort: never block the register flow on a write.
        try {
          await saveUserProfile({
            userId,
            email: email.toLowerCase(),
            profile: {
              name,
              dob: "",
              tob: "",
              place: "",
              latitude: null,
              longitude: null,
              timezone: "Asia/Kolkata",
            },
          });
        } catch (persistError) {
          console.error("USER_PROFILES_ON_REGISTER_FAILED", persistError);
        }
      }
      setUser(data.session?.user ? mapSupabaseUser(data.session.user) : null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendPhoneOtp = useCallback(async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyPhoneOtp = useCallback(async (phoneNumber: string, otp: string) => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      if (data.user) setUser(mapSupabaseUser(data.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    void getSupabaseClient().auth.signOut();
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: authData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: result, error } = await supabase.auth.updateUser({
        data: { ...authData.user.user_metadata, ...data },
      });
      if (error) throw error;
      setUser(mapSupabaseUser(result.user));

      // Mirror the birth fields into the server-side persistent profile row
      // so the value survives refresh / device / session loss. Best-effort —
      // a transient network failure here must not break the profile save.
      const birthDate = data.birthDate ?? authData.user.user_metadata?.birthDate;
      const birthTime = data.birthTime ?? authData.user.user_metadata?.birthTime;
      const birthPlace = data.birthPlace ?? authData.user.user_metadata?.birthPlace;
      if (birthDate || birthTime || birthPlace) {
        try {
          await saveUserProfile({
            userId: authData.user.id,
            email: authData.user.email ?? "",
            profile: {
              name: data.name ?? authData.user.user_metadata?.name ?? "",
              dob: birthDate || "",
              tob: birthTime || "",
              place: birthPlace || "",
              latitude: data.latitude ?? authData.user.user_metadata?.latitude ?? null,
              longitude: data.longitude ?? authData.user.user_metadata?.longitude ?? null,
              timezone: data.timezone ?? authData.user.user_metadata?.timezone ?? "Asia/Kolkata",
            },
          });
        } catch (profileError) {
          console.warn("USER_PROFILES_UPDATE_MIRROR_FAILED", profileError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) throw new Error("You must be signed in to update your avatar.");
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const publicUrl = await uploadAvatarToStorage(user.id, file);

      const { data: authData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: result, error } = await supabase.auth.updateUser({
        data: { ...authData.user.user_metadata, avatar_url: publicUrl },
      });
      if (error) throw error;

      // Persist the avatar URL into the server-side profile row so the
      // `public.user_profiles` table always stays in sync with the auth
      // user metadata (the legacy `profiles` table sync is removed — it
      // never existed in any migration).
      if (user.id && publicUrl) {
        try {
          await saveUserProfile({
            userId: user.id,
            email: user.email ?? "",
            profile: {
              name: user.name || "User",
              dob: serverRow?.birth_date ?? "",
              tob: serverRow?.birth_time ?? "",
              place: serverRow?.birth_place ?? "",
              latitude: serverRow?.latitude ?? null,
              longitude: serverRow?.longitude ?? null,
              timezone: serverRow?.timezone ?? "Asia/Kolkata",
            },
          });
        } catch (profileError) {
          console.warn("Could not sync avatar to user_profiles table:", profileError);
        }
      }

      setUser(mapSupabaseUser(result.user));
    } finally {
      setIsLoading(false);
    }
    // `serverRow?.*` is only used as a fallback for the birth fields the
    // avatar-save path re-writes; listing them keeps the lint rule happy
    // without an eslint-disable.
  }, [user, serverRow]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        resetPassword,
        logout,
        updateProfile,
        uploadAvatar,
        googleLogin,
        sendPhoneOtp,
        verifyPhoneOtp,
        profile,
        saveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
