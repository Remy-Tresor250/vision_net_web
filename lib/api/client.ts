"use client";

import axios, { AxiosError } from "axios";

import { API_PREFIX } from "@/lib/api/endpoints";
import { getAccessToken, removeAuthCookies } from "@/lib/auth/cookies";

const baseURL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? API_PREFIX;

export interface ApiErrorPayload {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Accept-Language": "en",
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  const language =
    typeof window !== "undefined"
      ? window.localStorage.getItem("vision_net_language") ?? "fr"
      : "fr";

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Accept-Language"] = language === "en" ? "en" : "fr";

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    if (error.response?.status === 401) {
      removeAuthCookies();
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
    if (error.response?.data?.error) return error.response.data.error;
    if (error.message) return error.message;
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}
