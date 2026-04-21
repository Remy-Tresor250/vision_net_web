"use client";

import {
  Menu,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  TextInput,
} from "@mantine/core";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import Button from "@/components/ui/Button";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import type { AdminServiceType } from "@/lib/api/types";

interface Props {
  isLoading: boolean;
  isSaving: boolean;
  onDeleteService: (serviceTypeId: string) => void;
  onEditService: (serviceTypeId: string) => void;
  onSaveService: () => void;
  selectedServiceType: AdminServiceType | null;
  serviceName: string;
  serviceSubscription: number;
  serviceTypes: AdminServiceType[];
  setServiceName: (value: string) => void;
  setServiceSubscription: (value: number) => void;
}

export default function ServiceConfigurationsSection({
  isLoading,
  isSaving,
  onDeleteService,
  onEditService,
  onSaveService,
  selectedServiceType,
  serviceName,
  serviceSubscription,
  serviceTypes,
  setServiceName,
  setServiceSubscription,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
      <section className="overflow-hidden rounded-sm border border-border bg-surface shadow-card">
        <TableScrollContainer minWidth={520}>
          <Table className="min-w-full">
            <TableThead className="bg-surface-muted">
              <TableTr>
                {[t("configurations.type"), t("configurations.subscription"), t("tables.action")].map(
                  (header) => (
                    <TableTh
                      className="px-8 py-5 font-semibold uppercase tracking-[0.08em] text-text-muted"
                      key={header}
                    >
                      <p className="pl-[5px] text-center text-[14px]">{header}</p>
                    </TableTh>
                  ),
                )}
              </TableTr>
            </TableThead>
            <TableTbody>
              {isLoading ? (
                <TableSkeletonRows columns={3} rows={6} />
              ) : (
                serviceTypes.map((serviceType) => (
                  <TableTr
                    className="border-b border-border last:border-b-0"
                    key={serviceType.id}
                  >
                    <TableTd className="font-medium text-foreground">
                      <p className="text-center text-[14px] text-[#6B7C72]">
                        {serviceType.name}
                      </p>
                    </TableTd>
                    <TableTd className="py-6">
                      <p className="text-center text-[16px] font-medium text-[#0A3B24]">
                        {serviceType.subscriptionAmountMinor
                          ? `$${(serviceType.subscriptionAmountMinor / 100).toFixed(0)}`
                          : "-"}
                      </p>
                    </TableTd>
                    <TableTd className="px-8 py-6 text-center">
                      <Menu position="bottom-end" shadow="md" width={160}>
                        <Menu.Target>
                          <Button
                            aria-label={`Open actions for ${serviceType.name}`}
                            size="icon"
                            variant="subtle"
                          >
                            <HiEllipsisHorizontal className="size-6" />
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item onClick={() => onEditService(serviceType.id)}>
                            {t("configurations.edit")}
                          </Menu.Item>
                          <Menu.Item color="red" onClick={() => onDeleteService(serviceType.id)}>
                            {t("configurations.delete")}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </TableTd>
                  </TableTr>
                ))
              )}
            </TableTbody>
          </Table>
        </TableScrollContainer>
      </section>

      <section className="rounded-sm bg-transparent px-1 py-2 xl:px-6">
        <div className="mx-auto max-w-[590px]">
          <h2 className="text-center text-[28px] font-medium text-foreground">
            {selectedServiceType
              ? t("configurations.editService")
              : t("configurations.addNewService")}
          </h2>

          <div className="mt-10 space-y-7">
            <TextInput
              classNames={appFieldClassNames}
              disabled={isSaving}
              label={t("configurations.serviceName")}
              onChange={(event) => setServiceName(event.currentTarget.value)}
              placeholder={t("configurations.serviceName")}
              styles={appFieldStyles}
              value={serviceName}
            />
            <TextInput
              classNames={appFieldClassNames}
              disabled={isSaving}
              label={t("configurations.subscription")}
              onChange={(event) => setServiceSubscription(Number(event.currentTarget.value))}
              placeholder="ex. 25"
              styles={appFieldStyles}
              value={serviceSubscription}
            />

            <Button
              className="mt-4 h-[61px] w-full rounded-sm font-medium"
              disabled={isSaving}
              onClick={onSaveService}
            >
              <p className="text-[14px]">
                {isSaving
                  ? t("forms.saving")
                  : selectedServiceType
                    ? t("configurations.saveService")
                    : t("configurations.createService")}
              </p>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
