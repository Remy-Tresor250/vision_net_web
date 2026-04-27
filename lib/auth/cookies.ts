"use client";

import Cookies from "js-cookie";

import type { AuthUser } from "@/lib/api/types";

export const ACCESS_TOKEN_COOKIE = "vision_net_access_token";
export const USER_COOKIE = "vision_net_user";

const cookieOptions: Cookies.CookieAttributes = {
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
};

export function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN_COOKIE) ?? null;
}

export function getStoredUser() {
  const value = Cookies.get(USER_COOKIE);

  if (!value) return null;

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthCookies(
  token: string,
  user: AuthUser,
  expiresInSeconds: number,
) {
  const expires = new Date(Date.now() + expiresInSeconds * 1000);

  Cookies.set(ACCESS_TOKEN_COOKIE, token, { ...cookieOptions, expires });
  Cookies.set(USER_COOKIE, JSON.stringify(user), { ...cookieOptions, expires });
}

export function setStoredUser(user: AuthUser, expires?: Date) {
  Cookies.set(USER_COOKIE, JSON.stringify(user), {
    ...cookieOptions,
    expires,
  });
}

export function removeAuthCookies() {
  Cookies.remove(ACCESS_TOKEN_COOKIE);
  Cookies.remove(USER_COOKIE);
}
