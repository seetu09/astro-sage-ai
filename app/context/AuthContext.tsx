"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  googleLogin: () => Promise<void>;
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
  googleLogin: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function mapSupabaseUser(user: SupabaseUser): User {
  const metadata = user.user_metadata;

  return {
    id: user.id,
    name: metadata.name || metadata.full_name || user.email?.split("@")[0] || "User",
    email: user.email || "",
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
      if (data.user) setUser(mapSupabaseUser(data.user));
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
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
