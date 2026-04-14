import { cn } from "@/lib/utils";

interface Props {
  status: "Active" | "Inactive" | "Paid" | "Overdue";
  className?: string;
}

export default function StatusBadge({ status, className }: Props) {
  const isPositive = status === "Active" || status === "Paid";

  return (
    <span
      className={cn(
        "inline-flex min-w-20 items-center justify-center rounded-md p-2 text-[12px] font-semibold",
        isPositive
          ? "bg-brand-soft text-brand"
          : "bg-danger-soft text-danger",
        className
      )}
    >
      {status}
    </span>
  );
}
