import {
  Pagination,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";

import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  page: number;
  onPageChange: (page: number) => void;
  total: number;
  headers: string[];
}

export default function DashboardTableShell({
  children,
  className,
  headers,
  onPageChange,
  page,
  total,
}: Props) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-sm border border-border bg-surface shadow-card h-[75vh] flex flex-col justify-between",
        className,
      )}
    >
      <TableScrollContainer minWidth={500}>
        <Table className="min-w-full">
          <TableThead className="bg-surface-muted">
            <TableTr>
              {headers.map((header) => (
                <TableTh
                  key={header}
                  className="px-8 py-5 font-semibold uppercase text-text-muted text-[14px] text-[#6B7C72]"
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
      <div className="flex justify-center px-6 py-7">
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
