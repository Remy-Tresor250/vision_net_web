"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface Item {
  label: string;
  value: ReactNode;
}

interface Props {
  actions?: ReactNode;
  className?: string;
  items: Item[];
  status?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
}

export default function MobileDataCard({
  actions,
  className,
  items,
  status,
  subtitle,
  title,
}: Props) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
          {subtitle ? (
            <div className="mt-1 text-[12px] text-text-muted">{subtitle}</div>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {status ? <div className="mt-3">{status}</div> : null}
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div
            className="grid grid-cols-[minmax(0,112px)_minmax(0,1fr)] items-start gap-3"
            key={item.label}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              {item.label}
            </p>
            <div className="min-w-0 text-[14px] text-foreground">{item.value}</div>
          </div>
        ))}
      </div>
    </article>
  );
}
