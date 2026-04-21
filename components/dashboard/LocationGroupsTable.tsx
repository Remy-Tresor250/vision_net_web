"use client";

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
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import TableEmptyRow from "@/components/dashboard/TableEmptyRow";
import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import Button from "@/components/ui/Button";

export interface LocationTableAvenue {
  id: string;
  name: string;
}

export interface LocationTableRow {
  avenueItems: LocationTableAvenue[];
  serineId: string | null;
  serineName: string;
}

export interface LocationTableGroup {
  quartierId: string;
  quartierName: string;
  rows: LocationTableRow[];
}

interface Props {
  disabled?: boolean;
  groups: LocationTableGroup[];
  isLoading: boolean;
  onAddAvenue: (group: LocationTableGroup, row: LocationTableRow) => void;
  onAddCell: (group: LocationTableGroup) => void;
  onDeleteCell: (group: LocationTableGroup, row: LocationTableRow) => void;
  onDeleteQuartier: (group: LocationTableGroup) => void;
  onEditRow: (group: LocationTableGroup, row: LocationTableRow) => void;
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
}

export default function LocationGroupsTable({
  disabled = false,
  groups,
  isLoading,
  onAddAvenue,
  onAddCell,
  onDeleteCell,
  onDeleteQuartier,
  onEditRow,
  onPageChange,
  page,
  totalPages,
}: Props) {
  const { t } = useTranslation();

  return (
    <section className="overflow-hidden rounded-sm border border-border bg-surface shadow-card">
      <TableScrollContainer minWidth={980}>
        <Table className="min-w-full">
          <TableThead className="bg-surface-muted">
            <TableTr>
              {[
                t("configurations.quartier"),
                t("configurations.cell"),
                t("configurations.avenues"),
                t("tables.action"),
              ].map((header) => (
                <TableTh
                  className="px-8 py-5 text-[14px] font-semibold uppercase tracking-[0.08em] text-text-muted"
                  key={header}
                >
                  {header}
                </TableTh>
              ))}
            </TableTr>
          </TableThead>
          <TableTbody>
            {isLoading ? (
              <TableSkeletonRows columns={4} rows={8} />
            ) : groups.length ? (
              groups.map((group) =>
                group.rows.map((row, rowIndex) => (
                  <TableTr
                    className="border-b border-border last:border-b-0"
                    key={`${group.quartierId}-${row.serineId ?? rowIndex}`}
                  >
                    {rowIndex === 0 ? (
                      <TableTd className="min-w-[220px] align-top" rowSpan={group.rows.length}>
                        <div className="px-4 py-6">
                          <p className="text-[14px] font-semibold text-foreground">
                            {group.quartierName}
                          </p>
                        </div>
                      </TableTd>
                    ) : null}

                    <TableTd className="min-w-[260px] px-8 py-5 align-top">
                      <div className="flex items-center gap-3">
                        <span className="size-3 shrink-0 rounded-full bg-brand" />
                        <p className="text-[14px] font-medium text-text-muted">
                          {row.serineName}
                        </p>
                      </div>
                    </TableTd>

                    <TableTd className="min-w-[360px] px-8 py-5 align-top">
                      <div className="max-w-[360px] overflow-x-auto pb-1">
                        <div className="flex min-w-max gap-3">
                          {row.avenueItems.length ? (
                            row.avenueItems.map((avenue) => (
                              <span
                                className="inline-flex h-10 items-center rounded-[6px] bg-[#D9DEDA] px-4 text-[14px] text-foreground"
                                key={avenue.id}
                              >
                                {avenue.name}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex h-10 items-center rounded-[6px] bg-surface-muted px-4 text-[14px] text-text-muted">
                              {t("configurations.noAvenues")}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableTd>

                    <TableTd className="w-[130px] px-8 py-5 text-center align-top">
                      <Menu position="bottom-end" shadow="md" width={190}>
                        <Menu.Target>
                          <Button
                            aria-label={`Open actions for ${group.quartierName}`}
                            disabled={disabled}
                            size="icon"
                            variant="subtle"
                          >
                            <HiEllipsisHorizontal className="size-6" />
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          {row.serineId ? (
                            <Menu.Item disabled={disabled} onClick={() => onEditRow(group, row)}>
                              {t("configurations.edit")}
                            </Menu.Item>
                          ) : null}
                          <Menu.Item disabled={disabled} onClick={() => onAddCell(group)}>
                            {t("configurations.addCell")}
                          </Menu.Item>
                          {row.serineId ? (
                            <Menu.Item disabled={disabled} onClick={() => onAddAvenue(group, row)}>
                              {t("configurations.addAvenue")}
                            </Menu.Item>
                          ) : null}
                          {row.serineId ? (
                            <Menu.Item
                              color="red"
                              disabled={disabled}
                              onClick={() => onDeleteCell(group, row)}
                            >
                              {t("configurations.deleteCell")}
                            </Menu.Item>
                          ) : null}
                          <Menu.Item
                            color="red"
                            disabled={disabled}
                            onClick={() => onDeleteQuartier(group)}
                          >
                            {t("configurations.deleteQuartier")}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </TableTd>
                  </TableTr>
                )),
              )
            ) : (
              <TableEmptyRow
                colSpan={4}
                message={t("configurations.emptyLocationsMessage")}
                title={t("configurations.emptyLocationsTitle")}
              />
            )}
          </TableTbody>
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
          total={totalPages}
          value={page}
        />
      </div>
    </section>
  );
}
