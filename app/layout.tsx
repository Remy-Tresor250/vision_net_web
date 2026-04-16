import type { Metadata } from "next";
import localFont from "next/font/local";

import Providers from "@/app/providers";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-datatable/styles.css";
import "react-phone-input-2/lib/style.css";
import "./globals.css";

const poppins = localFont({
  src: [
    {
      path: "../assets/fonts/Poppins/Poppins-Regular.ttf",
      style: "normal",
      weight: "400",
    },
    {
      path: "../assets/fonts/Poppins/Poppins-Medium.ttf",
      style: "normal",
      weight: "500",
    },
    {
      path: "../assets/fonts/Poppins/Poppins-SemiBold.ttf",
      style: "normal",
      weight: "600",
    },
    {
      path: "../assets/fonts/Poppins/Poppins-Bold.ttf",
      style: "normal",
      weight: "700",
    },
  ],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Vision Net",
  description: "Keep our area clean",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
