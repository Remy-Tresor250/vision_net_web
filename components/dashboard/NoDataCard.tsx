import { HiOutlineDocumentMagnifyingGlass } from "react-icons/hi2";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  title?: string;
  message?: string;
}

export default function NoDataCard({
  className,
  title = "No data yet",
  message = "Once records are available, they will appear here.",
}: Props) {
  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-sm border border-border bg-surface px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-md bg-surface-muted text-text-muted">
        <HiOutlineDocumentMagnifyingGlass className="size-6" />
      </div>
      <p className="mt-4 text-[17px] font-semibold text-foreground">{title}</p>
      <p className="mt-2 max-w-md text-[13px] leading-6 text-text-muted">
        {message}
      </p>
    </div>
  );
}
