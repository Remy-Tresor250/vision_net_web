import Link from "next/link";
import {
  Pagination,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import {
  HiOutlineArrowLeft,
  HiOutlineBanknotes,
  HiOutlineUser,
} from "react-icons/hi2";

import type { Agent, Payment } from "@/types";

interface Props {
  agent: Agent;
  payments: Payment[];
}

export default function AgentDetailsPanel({ agent, payments }: Props) {
  const paidPayments = payments.filter((payment) => payment.status === "Paid");
  const totalCollected = paidPayments.reduce(
    (sum, payment) => sum + Number(payment.amount.replace("$", "")),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-text-muted">
        <HiOutlineArrowLeft className="size-5" />
        <Link
          className="text-[16px] font-medium transition-colors duration-200 ease-out hover:text-foreground"
          href="/agents"
        >
          Back to Agents
        </Link>
      </div>

      <section className="rounded-sm border border-border bg-surface px-7 py-6 shadow-card">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex size-16 items-center justify-center rounded-md bg-brand text-white">
            <HiOutlineUser className="size-6" />
          </div>
          <div className="flex flex-1 gap-[5vw] flex-row items-center">
            <div>
              <p className="text-[16px] font-medium uppercase tracking-wider text-text-muted">
                Full Names
              </p>
              <p className="text-[18px] font-medium tracking-tight text-foreground">
                {agent.name}
              </p>
            </div>
            <div>
              <p className="text-[16px] font-medium uppercase tracking-wider text-text-muted">
                Registered Date
              </p>
              <p className="text-[18px] font-medium tracking-tight text-foreground">
                {agent.registeredDate}
              </p>
            </div>
            <div>
              <p className="text-[16px] font-medium uppercase tracking-wider text-text-muted">
                Phone Number
              </p>
              <p className="text-[18px] font-medium tracking-tight text-foreground">
                {agent.phone}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid max-w-3xl gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                Total Collected (Aug)
              </p>
              <p className="mt-7 text-[40px] font-semibold tracking-tight text-foreground">
                ${totalCollected}
              </p>
            </div>
            <div className="flex h-10 min-w-18 items-center justify-center rounded-md bg-surface-muted px-4 text-text-muted">
              <HiOutlineBanknotes className="size-5" />
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                Unique Clients (Aug)
              </p>
              <p className="mt-7 text-[40px] font-semibold tracking-tight text-foreground">
                {new Set(paidPayments.map((payment) => payment.clientId)).size}
              </p>
            </div>
            <div className="flex h-10 min-w-18 items-center justify-center rounded-md bg-surface-muted px-4 text-text-muted">
              <HiOutlineBanknotes className="size-5" />
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <TableScrollContainer minWidth={1080}>
          <Table className="min-w-full">
            <TableThead className="bg-surface-muted">
              <TableTr>
                {[
                  "Client Name",
                  "Date Collected",
                  "Month",
                  "Amount",
                  "Receipt",
                ].map((header) => (
                  <TableTh
                    key={header}
                    className="px-7 py-5 text-sm font-semibold uppercase tracking-wider text-text-muted"
                    styles={{ th: { padding: 12 } }}
                  >
                    {header}
                  </TableTh>
                ))}
              </TableTr>
            </TableThead>
            <TableTbody>
              {paidPayments.map((payment) => (
                <TableTr
                  key={payment.id}
                  className="border-b border-border last:border-b-0"
                >
                  <TableTd className="px-7 py-6 text-[14px] font-medium text-foreground">
                    {payment.clientName}
                  </TableTd>
                  <TableTd className="px-7 py-6 text-[14px] text-text-muted">
                    23-04-2026
                  </TableTd>
                  <TableTd className="px-7 py-6 text-[14px] text-text-muted">
                    2
                  </TableTd>
                  <TableTd className="px-7 py-6 text-[14px] text-text-muted">
                    {payment.amount}
                  </TableTd>
                  <TableTd className="px-7 py-6 text-[14px]">
                    <button className="font-medium text-brand underline decoration-brand/40 underline-offset-4">
                      View
                    </button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </TableScrollContainer>
        <div className="flex justify-center px-6 py-7">
          <Pagination
            boundaries={1}
            color="brand"
            radius="xl"
            siblings={2}
            total={10}
            value={1}
          />
        </div>
      </section>
    </div>
  );
}
