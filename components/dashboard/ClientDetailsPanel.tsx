"use client";

import Link from "next/link";
import {
  Menu,
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
  HiEllipsisHorizontal,
  HiOutlineArrowLeft,
  HiOutlineBanknotes,
  HiOutlineUser,
} from "react-icons/hi2";

import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Client, Payment } from "@/types";

interface Props {
  client: Client;
  payments: Payment[];
}

function getMonthLabel(payment: Payment) {
  if (payment.date.endsWith("04-2026")) return "January";
  if (payment.date.endsWith("03-2026")) return "February";
  return "January";
}

export default function ClientDetailsPanel({ client, payments }: Props) {
  const duePayments = payments.filter(
    (payment) => payment.status === "Overdue",
  );
  const dueAmount = duePayments.reduce(
    (sum, payment) => sum + Number(payment.amount.replace("$", "")),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-text-muted">
        <HiOutlineArrowLeft className="size-5" />
        <Link
          className="text-[16px] font-medium transition-colors duration-200 ease-out hover:text-foreground"
          href="/clients"
        >
          Back to Clients
        </Link>
      </div>

      <section className="rounded-sm border border-border bg-surface px-4 py-4 shadow-card">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex size-16 items-center justify-center rounded-md bg-brand text-white">
            <HiOutlineUser className="size-9" />
          </div>
          <div className="flex flex-1 gap-[5vw] flex-row items-center">
            <div>
              <p className="text-[16px] font-medium uppercase text-text-muted">
                Full Names
              </p>
              <p className="text-[18px] font-medium tracking-tight text-foreground">
                {client.name}
              </p>
            </div>
            <div>
              <p className="text-[16px] font-medium uppercase text-text-muted">
                Adress
              </p>
              <p className="text-[18px] font-medium tracking-tight text-foreground">
                {client.address}
              </p>
            </div>
            <div>
              <p className="text-[16px] font-medium uppercase text-text-muted">
                Phone Number
              </p>
              <p className="text-[18px] font-medium tracking-tight text-foreground">
                {client.phone}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid max-w-2xl gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                Due Payments
              </p>
              <p className="mt-7 text-[40px] font-semibold tracking-tight text-danger">
                ${dueAmount}
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
                Due Months
              </p>
              <p className="mt-7 text-[40px] font-semibold tracking-tight text-foreground">
                {duePayments.length}
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
                  "Month",
                  "Amount",
                  "Agent",
                  "Receipt",
                  "Status",
                  "Action",
                ].map((header) => (
                  <TableTh
                    key={header}
                    className="px-7 py-5 text-[14px] font-semibold uppercase tracking-wider text-text-muted"
                    styles={{ th: { padding: 12 } }}
                  >
                    {header}
                  </TableTh>
                ))}
              </TableTr>
            </TableThead>
            <TableTbody>
              {payments.map((payment) => {
                const isOverdue = payment.status === "Overdue";

                return (
                  <TableTr
                    key={payment.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <TableTd className="px-7 py-6 text-[14px] font-medium uppercase text-text-muted">
                      {getMonthLabel(payment)}
                    </TableTd>
                    <TableTd className="px-7 py-6 text-[14px] text-text-muted">
                      {payment.amount}
                    </TableTd>
                    <TableTd
                      className={`px-7 py-6 text-[14px] ${isOverdue ? "text-text-muted" : "text-foreground"}`}
                    >
                      {isOverdue ? "-" : payment.agentName}
                    </TableTd>
                    <TableTd className="px-7 py-6 text-[14px]">
                      {isOverdue ? (
                        <span className="text-text-muted">-</span>
                      ) : (
                        <button className="font-medium text-brand underline decoration-brand/40 underline-offset-4">
                          View
                        </button>
                      )}
                    </TableTd>
                    <TableTd className="px-3 py-6">
                      <StatusBadge status={payment.status} />
                    </TableTd>
                    <TableTd className="px-3 py-6 flex items-center">
                      {isOverdue ? (
                        <Menu position="bottom-end" shadow="md" width={180}>
                          <Menu.Target>
                            <Button
                              aria-label={`Open payment actions for ${payment.id}`}
                              size="icon"
                              variant="subtle"
                            >
                              <HiEllipsisHorizontal className="size-6" />
                            </Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item>Mark as paid</Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      ) : (
                        <Button
                          aria-label={`No actions for ${payment.id}`}
                          className="text-foreground"
                          disabled
                          size="icon"
                          variant="subtle"
                        >
                          <HiEllipsisHorizontal className="size-6" />
                        </Button>
                      )}
                    </TableTd>
                  </TableTr>
                );
              })}
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
