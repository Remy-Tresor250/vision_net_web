"use client";

import { create } from "zustand";

import i18n from "@/lib/i18n";
import type { Language } from "@/lib/api/types";

const LANGUAGE_KEY = "vision_net_language";

interface LanguageState {
  language: Language;
  hydrate: () => void;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "fr",
  hydrate: () => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(LANGUAGE_KEY);
    const language = stored === "en" ? "en" : "fr";
    i18n.changeLanguage(language);
    set({ language });
  },
  setLanguage: (language) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_KEY, language);
    }

    i18n.changeLanguage(language);
    set({ language });
  },
}));
