"use client";

import { create } from "zustand";

import type { AuthTokenPayload, AuthUser } from "@/lib/api/types";
import {
  getAccessToken,
  getStoredUser,
  removeAuthCookies,
  setAuthCookies,
  setStoredUser,
} from "@/lib/auth/cookies";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hasHydrated: boolean;
  hydrate: () => void;
  setUser: (user: AuthUser | null) => void;
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
  setUser: (user) => {
    if (user) {
      setStoredUser(user);
    }

    set({ user });
  },
  setSession: (payload) => {
    setAuthCookies(payload.accessToken, payload.user, payload.expiresInSeconds);
    set({
      token: payload.accessToken,
      user: payload.user,
      hasHydrated: true,
    });
  },
  updateUser: (user) =>
    set((state) => {
      if (!state.user) {
        return { user: state.user };
      }

      const nextUser = { ...state.user, ...user };
      setStoredUser(nextUser);

      return { user: nextUser };
    }),
  logout: () => {
    removeAuthCookies();
    set({ token: null, user: null, hasHydrated: true });
  },
}));
