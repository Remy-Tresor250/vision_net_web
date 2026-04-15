import { cn } from "@/lib/utils";
import NoDataCard from "@/components/dashboard/NoDataCard";

interface Props {
  agents: Array<{ id: string; name: string; amount: string }>;
  className?: string;
}

export default function TopAgentsCard({ agents, className }: Props) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-sm border border-border bg-surface shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-5 py-2">
        <h2 className="text-[14px] font-semibold uppercase tracking-wider text-foreground">
          Top Agents
        </h2>
        <button className="text-base font-semibold text-brand">
          <p className="text-[13px]">View all</p>
        </button>
      </div>
      {agents.length ? (
        <ul>
          {agents.map((agent) => (
            <li
              key={agent.id}
              className="flex items-center justify-between border-b border-border px-5 py-3 last:border-b-0"
            >
              <span className="text-[14px] text-text-muted">{agent.name}</span>
              <span className="text-[14px] font-semibold text-foreground">
                {agent.amount}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <NoDataCard
          className="min-h-80 border-0"
          message="Agent collection rankings will appear after payments are recorded."
          title="No top agents"
        />
      )}
    </section>
  );
}
