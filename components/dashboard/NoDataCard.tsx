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
        "flex min-h-56 flex-col items-center justify-center rounded-sm border border-border bg-surface px-5 py-8 text-center sm:min-h-64 sm:px-6 sm:py-10",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-md bg-surface-muted text-text-muted">
        <HiOutlineDocumentMagnifyingGlass className="size-6" />
      </div>
      <p className="mt-4 text-[15px] font-semibold text-foreground sm:text-[17px]">{title}</p>
      <p className="mt-2 max-w-md text-[12px] leading-5 text-text-muted sm:text-[13px] sm:leading-6">
        {message}
      </p>
    </div>
  );
}
