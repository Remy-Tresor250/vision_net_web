"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { I18nextProvider } from "react-i18next";
import { Toaster } from "react-hot-toast";

import i18n from "@/lib/i18n";
import QueryProvider from "@/lib/query/QueryProvider";

const theme = createTheme({
  colors: {
    brand: [
      "#E8F8F0",
      "#D1F0E0",
      "#A6E0C1",
      "#7AD1A3",
      "#4FC184",
      "#12A15E",
      "#0F8A51",
      "#0C7344",
      "#095C36",
      "#064529",
    ],
  },
  defaultRadius: "md",
  fontFamily: "var(--font-sans), sans-serif",
  primaryColor: "brand",
});

interface Props {
  children: React.ReactNode;
}

export default function Providers({ children }: Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <MantineProvider theme={theme}>
        <QueryProvider>
          {children}
          <Toaster
          position="top-right"
          toastOptions={{
            className:
              "border border-border bg-surface text-foreground shadow-card",
            duration: 3500,
            error: {
              iconTheme: {
                primary: "var(--color-danger)",
                secondary: "#ffffff",
              },
            },
            style: {
              borderRadius: 8,
              color: "var(--color-foreground)",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: 14,
              padding: "12px 14px",
            },
            success: {
              iconTheme: {
                primary: "var(--color-brand)",
                secondary: "#ffffff",
              },
            },
          }}
          />
        </QueryProvider>
      </MantineProvider>
    </I18nextProvider>
  );
}
