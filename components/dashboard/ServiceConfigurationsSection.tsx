"use client";

import {
  Menu,
  Modal,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  TextInput,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import MobileDataCard from "@/components/dashboard/MobileDataCard";
import Button from "@/components/ui/Button";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import type { AdminServiceType } from "@/lib/api/types";

interface Props {
  canCreateService: boolean;
  canDeleteService: boolean;
  canEditService: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onDeleteService: (serviceTypeId: string) => void;
  onEditService: (serviceTypeId: string) => void;
  onOpenCreateService: () => void;
  onResetServiceForm: () => void;
  onSaveService: () => void;
  selectedServiceType: AdminServiceType | null;
  serviceModalOpened: boolean;
  serviceName: string;
  serviceSubscription: number;
  serviceTypes: AdminServiceType[];
  setServiceName: (value: string) => void;
  setServiceSubscription: (value: number) => void;
}

export default function ServiceConfigurationsSection({
  canCreateService,
  canDeleteService,
  canEditService,
  isLoading,
  isSaving,
  onDeleteService,
  onEditService,
  onOpenCreateService,
  onResetServiceForm,
  onSaveService,
  selectedServiceType,
  serviceModalOpened,
  serviceName,
  serviceSubscription,
  serviceTypes,
  setServiceName,
  setServiceSubscription,
}: Props) {
  const { t } = useTranslation();
  const canSaveService = selectedServiceType ? canEditService : canCreateService;
  const isMobile = useMediaQuery("(max-width: 47.99em)");

  const serviceForm = (
    <div className="mx-auto max-w-[590px]">
      <h2 className="text-center text-[20px] font-medium text-foreground sm:text-[24px] xl:text-[28px]">
        {selectedServiceType
          ? t("configurations.editService")
          : t("configurations.addNewService")}
      </h2>

      <div className="mt-5 space-y-4 sm:mt-8 sm:space-y-7">
        <TextInput
          classNames={appFieldClassNames}
          disabled={isSaving || !canSaveService}
          label={t("configurations.serviceName")}
          onChange={(event) => setServiceName(event.currentTarget.value)}
          placeholder={t("configurations.serviceName")}
          styles={appFieldStyles}
          value={serviceName}
        />
        <TextInput
          classNames={appFieldClassNames}
          disabled={isSaving || !canSaveService}
          label={t("configurations.subscription")}
          onChange={(event) => setServiceSubscription(Number(event.currentTarget.value))}
          placeholder="ex. 25"
          styles={appFieldStyles}
          value={serviceSubscription}
        />

        <div className="flex justify-end gap-3">
          {isMobile ? (
            <Button onClick={onResetServiceForm} variant="outline">
              <p className="text-[13px] sm:text-[14px]">{t("actions.cancel")}</p>
            </Button>
          ) : null}
          <Button
            className="mt-2 h-12 w-full rounded-sm font-medium sm:h-[61px]"
            disabled={isSaving || !canSaveService}
            onClick={onSaveService}
          >
            <p className="text-[13px] sm:text-[14px]">
              {isSaving
                ? t("forms.saving")
                : selectedServiceType
                  ? t("configurations.saveService")
                  : t("configurations.createService")}
            </p>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-start xl:gap-8">
      <section className="overflow-hidden rounded-sm border border-border bg-surface shadow-card">
        <div className="grid gap-3 p-3 md:hidden">
          <Button className="h-11" onClick={onOpenCreateService}>
            <p className="text-[13px]">{t("configurations.createService")}</p>
          </Button>
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <div
                  className="h-32 animate-pulse rounded-xl border border-border bg-surface-muted"
                  key={index}
                />
              ))
            : serviceTypes.map((serviceType) => (
                <MobileDataCard
                  actions={
                    <Menu position="bottom-end" shadow="md" width={160}>
                      <Menu.Target>
                        <Button
                          aria-label={`Open actions for ${serviceType.name}`}
                          size="icon"
                          variant="subtle"
                        >
                          <HiEllipsisHorizontal className="size-5" />
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {canEditService ? (
                          <Menu.Item onClick={() => onEditService(serviceType.id)}>
                            {t("configurations.edit")}
                          </Menu.Item>
                        ) : null}
                        {canDeleteService ? (
                          <Menu.Item color="red" onClick={() => onDeleteService(serviceType.id)}>
                            {t("configurations.delete")}
                          </Menu.Item>
                        ) : null}
                      </Menu.Dropdown>
                    </Menu>
                  }
                  items={[
                    { label: t("configurations.type"), value: serviceType.name },
                    {
                      label: t("configurations.subscription"),
                      value: serviceType.subscriptionAmountMinor
                        ? `$${(serviceType.subscriptionAmountMinor / 100).toFixed(0)}`
                        : "-",
                    },
                  ]}
                  key={serviceType.id}
                  title={serviceType.name}
                />
              ))}
        </div>
        <TableScrollContainer className="hidden md:block" minWidth={520}>
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
                          {canEditService ? (
                            <Menu.Item onClick={() => onEditService(serviceType.id)}>
                              {t("configurations.edit")}
                            </Menu.Item>
                          ) : null}
                          {canDeleteService ? (
                            <Menu.Item color="red" onClick={() => onDeleteService(serviceType.id)}>
                              {t("configurations.delete")}
                            </Menu.Item>
                          ) : null}
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

      <section className="hidden rounded-sm bg-transparent px-1 py-2 md:block xl:px-6">
        {serviceForm}
      </section>

      <Modal
        centered
        classNames={{
          body: "px-4 pb-5 sm:px-6 sm:pb-6",
          content: "rounded-sm",
          header: "px-4 pt-4 sm:px-6 sm:pt-6",
          title: "w-full text-center",
        }}
        onClose={onResetServiceForm}
        opened={Boolean(isMobile && serviceModalOpened)}
        radius="sm"
        size="lg"
        title={
          <span className="text-[20px] font-semibold text-foreground sm:text-[24px]">
            {selectedServiceType
              ? t("configurations.editService")
              : t("configurations.addNewService")}
          </span>
        }
      >
        {serviceForm}
      </Modal>
    </div>
  );
}
