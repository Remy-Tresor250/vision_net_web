import { Skeleton } from "@mantine/core";

export function RevenueChartSkeleton() {
  return (
    <div className="mt-4 rounded-sm border border-border bg-surface-muted/60 p-4">
      <div className="flex h-64 items-end gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="flex flex-1 flex-col justify-end gap-3" key={index}>
            <Skeleton
              animate
              className="w-full rounded-sm"
              height={48 + (index % 4) * 26 + 40}
            />
            <Skeleton animate className="mx-auto rounded-sm" height={10} width="60%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentTransactionsSkeleton() {
  return (
    <section className="overflow-hidden rounded-sm border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-5 py-2">
        <Skeleton animate className="rounded-sm" height={16} width={180} />
        <Skeleton animate className="rounded-sm" height={14} width={72} />
      </div>
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            className="grid grid-cols-5 gap-4 border-b border-border px-5 py-3 last:border-b-0"
            key={rowIndex}
          >
            {Array.from({ length: 5 }).map((__, cellIndex) => (
              <Skeleton animate className="rounded-sm" height={16} key={cellIndex} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function TopAgentsSkeleton({ className = "" }: { className?: string }) {
  return (
    <section
      className={`overflow-hidden rounded-sm border border-border bg-surface shadow-card ${className}`}
    >
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-5 py-2">
        <Skeleton animate className="rounded-sm" height={16} width={120} />
        <Skeleton animate className="rounded-sm" height={14} width={72} />
      </div>
      <div>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            className="flex items-center justify-between border-b border-border px-5 py-3 last:border-b-0"
            key={index}
          >
            <Skeleton animate className="rounded-sm" height={16} width="55%" />
            <Skeleton animate className="rounded-sm" height={16} width={90} />
          </div>
        ))}
      </div>
    </section>
  );
}
