import Link from "next/link";
import { HiOutlineArrowLeft } from "react-icons/hi2";

import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Agent, Payment } from "@/types";

interface Props {
  agent: Agent;
  payments: Payment[];
}

export default function AgentDetailsPanel({ agent, payments }: Props) {
  const totalCollected = payments
    .filter((payment) => payment.status === "Paid")
    .reduce((sum, payment) => sum + Number(payment.amount.replace("$", "")), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/agents">
          <Button variant="outline">
            <HiOutlineArrowLeft className="size-5" />
            Back to agents
          </Button>
        </Link>
      </div>
      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-xl border border-border bg-surface p-6 shadow-card lg:col-span-1">
          <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            Agent Profile
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            {agent.name}
          </h1>
          <div className="mt-6 grid gap-4">
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="text-sm uppercase tracking-wide text-text-muted">Phone</p>
              <p className="mt-2 text-lg font-medium text-foreground">{agent.phone}</p>
            </div>
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="text-sm uppercase tracking-wide text-text-muted">Region</p>
              <p className="mt-2 text-lg font-medium text-foreground">{agent.region}</p>
            </div>
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="text-sm uppercase tracking-wide text-text-muted">Status</p>
              <div className="mt-3">
                <StatusBadge status={agent.status} />
              </div>
            </div>
          </div>
        </article>
        <section className="grid gap-5 lg:col-span-2 md:grid-cols-3">
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">
              Clients Served
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
              {agent.clientsServed}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">
              This Month
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-brand">
              {agent.performance}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">
              Collected
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
              ${totalCollected}
            </p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card md:col-span-3">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-foreground">
              Recent Collections
            </h2>
            <ul className="mt-5 space-y-4">
              {payments.slice(0, 5).map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-4"
                >
                  <div>
                    <p className="text-lg font-medium text-foreground">{payment.clientName}</p>
                    <p className="text-sm text-text-muted">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-foreground">{payment.amount}</p>
                    <p className="text-sm text-text-muted">{payment.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </section>
    </div>
  );
}
