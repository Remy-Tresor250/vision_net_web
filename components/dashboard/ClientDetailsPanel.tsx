"use client";

import Link from "next/link";
import {
  Menu,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import { HiEllipsisHorizontal, HiOutlineArrowLeft } from "react-icons/hi2";

import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import type { Client, Payment } from "@/types";

interface Props {
  client: Client;
  payments: Payment[];
}

export default function ClientDetailsPanel({ client, payments }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 text-base font-medium text-foreground transition-colors duration-200 ease-out hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href="/clients"
        >
          <HiOutlineArrowLeft className="size-5" />
          Back to clients
        </Link>
      </div>
      <section className="w-full flex flex-col">
        <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            Client Profile
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            {client.name}
          </h1>
          <div className="mt-6 grid gap-4 text-base text-text-muted">
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="text-sm uppercase tracking-wide">Phone</p>
              <p className="mt-2 text-lg font-medium text-foreground">{client.phone}</p>
            </div>
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="text-sm uppercase tracking-wide">Address</p>
              <p className="mt-2 text-lg font-medium text-foreground">{client.address}</p>
            </div>
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="text-sm uppercase tracking-wide">Registered Date</p>
              <p className="mt-2 text-lg font-medium text-foreground">
                {client.registeredDate}
              </p>
            </div>
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="text-sm uppercase tracking-wide">Status</p>
              <div className="mt-3">
                <StatusBadge status={client.status} />
              </div>
            </div>
          </div>
        </article>
        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card xl:col-span-4">
          <div className="border-b border-border bg-surface-muted px-6 py-5">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-foreground">
              Payment History
            </h2>
          </div>
          <TableScrollContainer minWidth={760}>
            <Table className="min-w-full">
              <TableThead className="bg-surface">
                <TableTr>
                  {["Month(s)", "Date", "Amount", "Status", "Action"].map((header) => (
                    <TableTh
                      key={header}
                      className="px-6 py-5 text-sm font-semibold uppercase tracking-wider text-text-muted"
                    >
                      {header}
                    </TableTh>
                  ))}
                </TableTr>
              </TableThead>
              <TableTbody>
                {payments.map((payment) => (
                  <TableTr key={payment.id} className="border-b border-border last:border-b-0">
                    <TableTd className="px-6 py-5 text-lg text-text-muted">
                      {payment.months}
                    </TableTd>
                    <TableTd className="px-6 py-5 text-lg text-text-muted">
                      {payment.date}
                    </TableTd>
                    <TableTd className="px-6 py-5 text-lg text-text-muted">
                      {payment.amount}
                    </TableTd>
                    <TableTd className="px-6 py-5">
                      <StatusBadge status={payment.status} />
                    </TableTd>
                    <TableTd className="px-6 py-5 text-center">
                      {payment.status === "Overdue" ? (
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
                        <span className="text-sm font-medium text-text-muted">No action</span>
                      )}
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </TableScrollContainer>
        </section>
      </section>
    </div>
  );
}
