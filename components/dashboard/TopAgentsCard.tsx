import { cn } from "@/lib/utils";

interface Props {
  agents: Array<{ id: string; name: string; amount: string }>;
  className?: string;
}

export default function TopAgentsCard({ agents, className }: Props) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-5 py-4">
        <h2 className="text-lg font-semibold uppercase tracking-wider text-foreground">
          Top Agents
        </h2>
        <button className="text-base font-semibold text-brand">View All</button>
      </div>
      <ul>
        {agents.map((agent) => (
          <li
            key={agent.id}
            className="flex items-center justify-between border-b border-border px-5 py-5 last:border-b-0"
          >
            <span className="text-xl text-text-muted">{agent.name}</span>
            <span className="text-lg font-semibold text-foreground">{agent.amount}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
