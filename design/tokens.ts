export const tokens = {
  color: {
    background: "#F9FBF9",
    surface: "#FFFFFF",
    surfaceMuted: "#F3F7F4",
    foreground: "#154734",
    textMuted: "#6F837A",
    border: "#D8E4DD",
    brand: "#12A15E",
    brandDark: "#0F4B2E",
    brandSoft: "#12A15E33",
    danger: "#E83C27",
    dangerSoft: "#E83C2733",
    warning: "#FFB23E",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    full: "9999px",
  },
  shadow: {
    card: "0 10px 30px -24px rgb(16 63 43 / 0.35)",
    panel: "0 20px 45px -35px rgb(16 63 43 / 0.35)",
  },
} as const;

export type Tokens = typeof tokens;
