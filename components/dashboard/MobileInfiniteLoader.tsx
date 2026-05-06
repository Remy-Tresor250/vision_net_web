"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore?: () => void;
}

export default function MobileInfiniteLoader({
  className,
  hasMore,
  isLoading,
  onLoadMore,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const handleLoadMore = useEffectEvent(() => {
    if (!hasMore || isLoading || !onLoadMore) {
      return;
    }

    onLoadMore();
  });

  useEffect(() => {
    const node = ref.current;

    if (!node || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        rootMargin: "240px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore]);

  if (!hasMore) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn("flex h-14 items-center justify-center", className)}
      ref={ref}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-full border-2 border-border border-t-brand transition-opacity",
          isLoading ? "animate-spin opacity-100" : "opacity-60",
        )}
      />
    </div>
  );
}
