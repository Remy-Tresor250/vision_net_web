"use client";

import { MantineProvider, createTheme } from "@mantine/core";

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
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
