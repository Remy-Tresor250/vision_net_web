"use client";

import { create } from "zustand";

import type { AuthTokenPayload, AuthUser } from "@/lib/api/types";
import {
  getAccessToken,
  getStoredUser,
  removeAuthCookies,
  setAuthCookies,
} from "@/lib/auth/cookies";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hasHydrated: boolean;
  hydrate: () => void;
  setSession: (payload: AuthTokenPayload) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hasHydrated: false,
  hydrate: () =>
    set({
      token: getAccessToken(),
      user: getStoredUser(),
      hasHydrated: true,
    }),
  setSession: (payload) => {
    setAuthCookies(payload.accessToken, payload.user, payload.expiresInSeconds);
    set({
      token: payload.accessToken,
      user: payload.user,
      hasHydrated: true,
    });
  },
  updateUser: (user) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...user } : state.user,
    })),
  logout: () => {
    removeAuthCookies();
    set({ token: null, user: null, hasHydrated: true });
  },
}));
