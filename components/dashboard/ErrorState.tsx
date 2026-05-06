"use client";

import Button from "@/components/ui/Button";

interface Props {
  message: string;
  reset: () => void;
}

export default function ErrorState({ message, reset }: Props) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-danger/20 bg-surface p-5 text-center shadow-card sm:min-h-96 sm:p-8">
      <h1 className="text-[22px] font-semibold tracking-tight text-foreground sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-lg text-[14px] leading-6 text-text-muted sm:text-base sm:leading-relaxed">
        {message}
      </p>
      <Button className="mt-5 sm:mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
