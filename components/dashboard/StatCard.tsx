import { HiOutlineBanknotes, HiOutlineUsers } from "react-icons/hi2";

import type { MetricCard } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  card: MetricCard;
  className?: string;
}

export default function StatCard({ card, className }: Props) {
  const isDanger = card.tone === "danger";
  const isBrand = card.tone === "brand";

  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-surface p-5 shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            {card.label}
          </p>
          <p
            className={cn(
              "mt-5 text-4xl font-semibold tracking-tight",
              isDanger ? "text-danger" : "text-foreground",
              isBrand && "text-brand"
            )}
          >
            {card.value}
          </p>
        </div>
        <div className="flex h-9 min-w-16 items-center justify-center rounded-md bg-surface-muted px-3 text-text-muted">
          {card.id === "clients" || card.id === "agents" ? (
            <HiOutlineUsers className="size-5" />
          ) : (
            <HiOutlineBanknotes className="size-5" />
          )}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p
          className={cn(
            "text-sm",
            isDanger ? "text-danger" : "text-text-muted",
            isBrand && "text-text-muted"
          )}
        >
          {card.caption}
        </p>
        {card.trend ? (
          <p className="text-right text-xs font-semibold text-brand">{card.trend}</p>
        ) : null}
      </div>
    </article>
  );
}
