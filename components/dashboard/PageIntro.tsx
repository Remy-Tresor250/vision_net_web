import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageIntro({
  action,
  className,
  eyebrow,
  subtitle,
  title,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-widest text-text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[27px] font-medium tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-base leading-relaxed text-text-muted">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
