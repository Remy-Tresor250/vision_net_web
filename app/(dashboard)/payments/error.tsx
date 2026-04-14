"use client";

import ErrorState from "@/components/dashboard/ErrorState";

export default function Error({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <ErrorState
      message="The payments page could not be loaded right now. Please try again."
      reset={reset}
    />
  );
}
