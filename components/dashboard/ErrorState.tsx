"use client";

import Button from "@/components/ui/Button";

interface Props {
  message: string;
  reset: () => void;
}

export default function ErrorState({ message, reset }: Props) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-xl border border-danger/20 bg-surface p-8 text-center shadow-card">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-text-muted">{message}</p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
