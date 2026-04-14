interface Props {
  showCards?: boolean;
}

export default function PageSkeleton({ showCards = false }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-10 w-52 animate-pulse rounded-md bg-surface-muted" />
        <div className="h-5 w-72 animate-pulse rounded-md bg-surface-muted" />
      </div>
      {showCards ? (
        <div className="grid gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-xl border border-border bg-surface"
            />
          ))}
        </div>
      ) : null}
      <div className="h-96 animate-pulse rounded-xl border border-border bg-surface" />
    </div>
  );
}
