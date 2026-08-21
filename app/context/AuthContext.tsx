"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseClient, uploadAvatar as uploadAvatarToStorage } from "../../lib/supabase";
import type { UserProfile } from "@/types/user";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(data.session?.user ? mapSupabaseUser(data.session.user) : null);
      } catch (error) {
        console.error("Session check failed:", error);
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
        setIsLoading(false);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch (error) {
      console.error("Auth listener setup failed:", error);
    }

    return () => unsubscribe?.();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) {
        throw new Error("Login failed. Please check your credentials and try again.");
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

      // Best-effort sync to a profiles table if it exists.
      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });
      } catch (profileError) {
        console.warn("Could not sync avatar to profiles table:", profileError);
      }

      setUser(mapSupabaseUser(result.user));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
