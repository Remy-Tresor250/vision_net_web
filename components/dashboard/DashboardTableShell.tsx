"use client";

import {
  Pagination,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";

import MobileInfiniteLoader from "@/components/dashboard/MobileInfiniteLoader";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  emptyMobileState?: React.ReactNode;
  headers: string[];
  hasMoreMobileItems?: boolean;
  isLoadingMore?: boolean;
  mobileCards?: React.ReactNode[];
  mobileClassName?: string;
  mobileLoadingState?: React.ReactNode;
  onLoadMore?: () => void;
  onPageChange: (page: number) => void;
  page: number;
  total: number;
}

export default function DashboardTableShell({
  children,
  className,
  emptyMobileState,
  headers,
  hasMoreMobileItems = false,
  isLoadingMore = false,
  mobileCards = [],
  mobileClassName,
  mobileLoadingState,
  onLoadMore,
  onPageChange,
  page,
  total,
}: Props) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-sm border border-border bg-surface shadow-card flex min-h-[32rem] flex-col justify-between md:h-[75vh]",
        className,
      )}
    >
      <div className={cn("grid gap-3 p-3 md:hidden", mobileClassName)}>
        {mobileLoadingState}
        {!mobileLoadingState && mobileCards.length ? mobileCards : emptyMobileState}
        {!mobileLoadingState && hasMoreMobileItems ? (
          <MobileInfiniteLoader
            hasMore={hasMoreMobileItems}
            isLoading={isLoadingMore}
            onLoadMore={onLoadMore}
          />
        ) : null}
      </div>

      <TableScrollContainer className="hidden md:block" minWidth={500}>
        <Table className="min-w-full">
          <TableThead className="bg-surface-muted">
            <TableTr>
              {headers.map((header) => (
                <TableTh
                  key={header}
                  className="px-8 py-5 text-[13px] font-semibold uppercase text-[#6B7C72] text-text-muted"
                  styles={{ th: { padding: 12 } }}
                >
                  {header}
                </TableTh>
              ))}
            </TableTr>
          </TableThead>
          <TableTbody>{children}</TableTbody>
        </Table>
      </TableScrollContainer>

      <div className="hidden justify-center px-6 py-7 md:flex">
        <Pagination
          boundaries={1}
          color="brand"
          onChange={onPageChange}
          radius="xl"
          siblings={2}
          size="md"
          total={total}
          value={page}
        />
      </div>
    </section>
  );
}
