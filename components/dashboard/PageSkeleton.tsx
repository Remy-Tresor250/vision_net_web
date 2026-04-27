import { Skeleton } from "@mantine/core";

interface Props {
  showCards?: boolean;
}

export default function PageSkeleton({ showCards = false }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-3">
          <Skeleton animate className="h-10 w-52 rounded-md" />
          <Skeleton animate className="h-5 w-72 rounded-md" />
        </div>
        <Skeleton animate className="h-12 w-44 rounded-md" />
      </div>
      {showCards ? (
        <div className="grid gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              animate
              key={index}
              className="h-40 rounded-sm border border-border bg-surface"
            />
          ))}
        </div>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-12">
        <Skeleton animate className="h-96 rounded-sm border border-border bg-surface xl:col-span-8" />
        <Skeleton animate className="h-96 rounded-sm border border-border bg-surface xl:col-span-4" />
      </div>
    </div>
  );
}
