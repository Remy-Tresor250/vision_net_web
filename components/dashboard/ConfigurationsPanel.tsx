/* eslint-disable react-hooks/set-state-in-effect */
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
  TextInput,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiEllipsisHorizontal, HiPlus } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import TableSkeletonRows from "@/components/dashboard/TableSkeletonRows";
import Button from "@/components/ui/Button";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useAdminAvenuesQuery,
  useAdminQuartiersQuery,
  useAdminSerinesQuery,
  useAdminServiceTypesQuery,
  useCommissionConfigQuery,
  useCreateAvenueMutation,
  useCreateQuartierMutation,
  useCreateSerineMutation,
  useCreateServiceTypeMutation,
  useDeleteServiceTypeMutation,
  useUpdateCommissionConfigMutation,
  useUpdateServiceTypeMutation,
} from "@/lib/query/hooks";
import { cn } from "@/lib/utils";

type ConfigurationTab = "location" | "service" | "commission";

interface LocationRowGroup {
  quartierId: string;
  quartierName: string;
  rows: Array<{
    avenueNames: string[];
    serineId: string;
    serineName: string;
  }>;
}

const LOCATION_PAGE_SIZE = 2;

function ConfigurationTabs({
  activeTab,
  onChange,
}: {
  activeTab: ConfigurationTab;
  onChange: (tab: ConfigurationTab) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid w-full max-w-[520px] grid-cols-3 rounded-[14px] bg-surface-muted p-1.5">
      {(
        [
          { label: t("common.service"), value: "service" },
          { label: t("configurations.commission"), value: "commission" },
          { label: t("common.location"), value: "location" },
        ] as const
      ).map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <button
            className={cn(
              "h-10 rounded-[12px] font-semibold transition-colors",
              isActive
                ? "bg-surface text-brand shadow-card"
                : "text-text-muted hover:text-foreground",
            )}
            key={tab.value}
            onClick={() => onChange(tab.value)}
            type="button"
          >
            <p className="text-[14px]">{tab.label}</p>
          </button>
        );
      })}
    </div>
  );
}

export default function ConfigurationsPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ConfigurationTab>("service");
  const [serviceName, setServiceName] = useState("");
  const [serviceSubscription, setServiceSubscription] = useState(0);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<
    string | null
  >(null);
  const [commissionValue, setCommissionValue] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [locationPage, setLocationPage] = useState(1);
  const [createLocationOpened, setCreateLocationOpened] = useState(false);
  const [quartierName, setQuartierName] = useState("");
  const [cellName, setCellName] = useState("");
  const [avenueName, setAvenueName] = useState("");

  const serviceTypesQuery = useAdminServiceTypesQuery({ limit: 100, skip: 0 });
  const commissionConfigQuery = useCommissionConfigQuery();
  const quartiersQuery = useAdminQuartiersQuery({ limit: 100, skip: 0 });
  const serinesQuery = useAdminSerinesQuery({ limit: 300, skip: 0 });
  const avenuesQuery = useAdminAvenuesQuery({ limit: 500, skip: 0 });

  const createServiceTypeMutation = useCreateServiceTypeMutation();
  const updateServiceTypeMutation = useUpdateServiceTypeMutation(
    selectedServiceTypeId ?? undefined,
  );
  const deleteServiceTypeMutation = useDeleteServiceTypeMutation();
  const updateCommissionMutation = useUpdateCommissionConfigMutation();
  const createQuartierMutation = useCreateQuartierMutation();
  const createSerineMutation = useCreateSerineMutation();
  const createAvenueMutation = useCreateAvenueMutation();

  const serviceTypes = useMemo(
    () => serviceTypesQuery.data?.data ?? [],
    [serviceTypesQuery.data?.data],
  );
  const quartiers = useMemo(
    () => quartiersQuery.data?.data ?? [],
    [quartiersQuery.data?.data],
  );
  const serines = useMemo(
    () => serinesQuery.data?.data ?? [],
    [serinesQuery.data?.data],
  );
  const avenues = useMemo(
    () => avenuesQuery.data?.data ?? [],
    [avenuesQuery.data?.data],
  );

  const selectedServiceType =
    serviceTypes.find(
      (serviceType) => serviceType.id === selectedServiceTypeId,
    ) ?? null;
  const isSavingService =
    createServiceTypeMutation.isPending || updateServiceTypeMutation.isPending;
  const isSavingCommission = updateCommissionMutation.isPending;
  const isCreatingLocation =
    createQuartierMutation.isPending ||
    createSerineMutation.isPending ||
    createAvenueMutation.isPending;
  const isLocationsLoading =
    quartiersQuery.isLoading ||
    quartiersQuery.isFetching ||
    serinesQuery.isLoading ||
    serinesQuery.isFetching ||
    avenuesQuery.isLoading ||
    avenuesQuery.isFetching;

  const groupedLocations = useMemo<LocationRowGroup[]>(() => {
    const normalizedSearch = locationSearch.trim().toLowerCase();

    return quartiers
      .map((quartier) => {
        const quartierSerines = serines
          .filter((serine) => serine.quartierId === quartier.id)
          .map((serine) => ({
            avenueNames: avenues
              .filter((avenue) => avenue.serineId === serine.id)
              .map((avenue) => avenue.name),
            serineId: serine.id,
            serineName: serine.name,
          }));

        const matchesSearch =
          !normalizedSearch ||
          quartier.name.toLowerCase().includes(normalizedSearch) ||
          quartierSerines.some(
            (row) =>
              row.serineName.toLowerCase().includes(normalizedSearch) ||
              row.avenueNames.some((name) =>
                name.toLowerCase().includes(normalizedSearch),
              ),
          );

        if (!matchesSearch) {
          return null;
        }

        return {
          quartierId: quartier.id,
          quartierName: quartier.name,
          rows: quartierSerines.length
            ? quartierSerines
            : [
                {
                  avenueNames: [],
                  serineId: `empty-${quartier.id}`,
                  serineName: "-",
                },
              ],
        };
      })
      .filter((group): group is LocationRowGroup => Boolean(group));
  }, [avenues, locationSearch, quartiers, serines]);

  const totalLocationPages = Math.max(
    1,
    Math.ceil(groupedLocations.length / LOCATION_PAGE_SIZE),
  );
  const visibleLocationGroups = groupedLocations.slice(
    (locationPage - 1) * LOCATION_PAGE_SIZE,
    locationPage * LOCATION_PAGE_SIZE,
  );

  useEffect(() => {
    if (commissionConfigQuery.data?.ratePercent === undefined) {
      return;
    }

    setCommissionValue(String(commissionConfigQuery.data.ratePercent));
  }, [commissionConfigQuery.data?.ratePercent]);

  useEffect(() => {
    setLocationPage(1);
  }, [locationSearch]);

  useEffect(() => {
    if (locationPage > totalLocationPages) {
      setLocationPage(totalLocationPages);
    }
  }, [locationPage, totalLocationPages]);

  function resetServiceForm() {
    setSelectedServiceTypeId(null);
    setServiceName("");
    setServiceSubscription(0);
  }

  function resetLocationForm() {
    setQuartierName("");
    setCellName("");
    setAvenueName("");
  }

  function handleEditService(serviceTypeId: string) {
    const serviceType = serviceTypes.find((item) => item.id === serviceTypeId);

    if (!serviceType) {
      return;
    }

    setSelectedServiceTypeId(serviceType.id);
    setServiceName(serviceType.name);
    setServiceSubscription(
      Number(((serviceType.subscriptionAmountMinor ?? 0) / 100).toFixed(0)) ??
        0,
    );
  }

  function handleDeleteService(serviceTypeId: string) {
    deleteServiceTypeMutation.mutate(serviceTypeId, {
      onError: (error) => toast.error(getApiErrorMessage(error)),
      onSuccess: () => {
        toast.success(t("configurations.serviceDeleted"));

        if (serviceTypeId === selectedServiceTypeId) {
          resetServiceForm();
        }
      },
    });
  }

  function handleSaveService() {
    if (!serviceName.trim() || !serviceSubscription) {
      toast.error(t("configurations.enterService"));
      return;
    }

    const payload = {
      name: serviceName.trim(),
      subscriptionAmount: String(serviceSubscription),
    };

    if (selectedServiceType) {
      updateServiceTypeMutation.mutate(payload, {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => {
          toast.success(t("configurations.serviceUpdated"));
          resetServiceForm();
        },
      });

      return;
    }

    createServiceTypeMutation.mutate(payload, {
      onError: (error) => toast.error(getApiErrorMessage(error)),
      onSuccess: () => {
        toast.success(t("configurations.serviceCreated"));
        resetServiceForm();
      },
    });
  }

  function handleSaveCommission() {
    const ratePercent = Number(commissionValue);

    if (Number.isNaN(ratePercent)) {
      toast.error(t("configurations.enterCommission"));
      return;
    }

    updateCommissionMutation.mutate(
      { ratePercent },
      {
        onError: (error) => toast.error(getApiErrorMessage(error)),
        onSuccess: () => toast.success(t("configurations.commissionUpdated")),
      },
    );
  }

  async function handleCreateLocation() {
    const trimmedQuartierName = quartierName.trim();
    const trimmedCellName = cellName.trim();
    const trimmedAvenueName = avenueName.trim();

    if (!trimmedQuartierName || !trimmedCellName || !trimmedAvenueName) {
      toast.error(t("configurations.enterFullLocation"));
      return;
    }

    try {
      const matchingQuartier = quartiers.find(
        (quartier) =>
          quartier.name.toLowerCase() === trimmedQuartierName.toLowerCase(),
      );

      const quartier =
        matchingQuartier ??
        (await createQuartierMutation.mutateAsync({
          name: trimmedQuartierName,
        }));

      const matchingSerine = serines.find(
        (serine) =>
          serine.quartierId === quartier.id &&
          serine.name.toLowerCase() === trimmedCellName.toLowerCase(),
      );

      const serine =
        matchingSerine ??
        (await createSerineMutation.mutateAsync({
          name: trimmedCellName,
          quartierId: quartier.id,
        }));

      await createAvenueMutation.mutateAsync({
        name: trimmedAvenueName,
        serineId: serine.id,
      });

      toast.success(t("configurations.createLocationSuccess"));
      resetLocationForm();
      setCreateLocationOpened(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  function handlePrepareLocationForm(
    group: LocationRowGroup,
    row: LocationRowGroup["rows"][number],
  ) {
    setActiveTab("location");
    setCreateLocationOpened(true);
    setQuartierName(group.quartierName);
    setCellName(row.serineName === "-" ? "" : row.serineName);
    setAvenueName("");
  }

  return (
    <div className="space-y-4 py-3">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <ConfigurationTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "service" ? (
          <Button
            className="h-12 min-w-[188px] rounded-[14px] px-3 text-[14px] font-medium"
            disabled={isSavingService}
            onClick={resetServiceForm}
          >
            <HiPlus className="size-4" />
            <p className="text-[14px]">{t("configurations.newService")}</p>
          </Button>
        ) : activeTab === "location" ? (
          <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
            <div className="w-full xl:max-w-[44rem]">
              <TextInput
                classNames={appFieldClassNames}
                onChange={(event) =>
                  setLocationSearch(event.currentTarget.value)
                }
                placeholder={t("configurations.searchLocation")}
                styles={appFieldStyles}
                value={locationSearch}
              />
            </div>
            <Button
              className="h-12 rounded-[14px] px-4 text-[14px] font-medium"
              disabled={isCreatingLocation}
              onClick={() => setCreateLocationOpened((current) => !current)}
            >
              <HiPlus className="size-4" />
              <p className="text-[14px]">
                {t("configurations.createLocation")}
              </p>
            </Button>
          </div>
        ) : null}
      </div>

      {activeTab === "service" ? (
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
          <section className="overflow-hidden rounded-sm border border-border bg-surface shadow-card">
            <TableScrollContainer minWidth={520}>
              <Table className="min-w-full">
                <TableThead className="bg-surface-muted">
                  <TableTr>
                    {[
                      t("configurations.type"),
                      t("configurations.subscription"),
                      t("tables.action"),
                    ].map((header) => (
                      <TableTh
                        className="px-8 py-5 font-semibold uppercase tracking-[0.08em] text-text-muted"
                        key={header}
                      >
                        <p className="pl-[5px] text-center text-[14px]">
                          {header}
                        </p>
                      </TableTh>
                    ))}
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {serviceTypesQuery.isLoading ||
                  serviceTypesQuery.isFetching ? (
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
                              <Menu.Item
                                onClick={() =>
                                  handleEditService(serviceType.id)
                                }
                              >
                                {t("configurations.edit")}
                              </Menu.Item>
                              <Menu.Item
                                color="red"
                                onClick={() =>
                                  handleDeleteService(serviceType.id)
                                }
                              >
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
                  disabled={isSavingService}
                  label={t("configurations.serviceName")}
                  onChange={(event) =>
                    setServiceName(event.currentTarget.value)
                  }
                  placeholder={t("configurations.serviceName")}
                  styles={appFieldStyles}
                  value={serviceName}
                />
                <TextInput
                  classNames={appFieldClassNames}
                  disabled={isSavingService}
                  label={t("configurations.subscription")}
                  onChange={(event) =>
                    setServiceSubscription(Number(event.currentTarget.value))
                  }
                  placeholder="ex. 25"
                  styles={appFieldStyles}
                  value={serviceSubscription}
                />

                <Button
                  className="mt-4 h-[61px] w-full rounded-sm font-medium"
                  disabled={isSavingService}
                  onClick={handleSaveService}
                >
                  <p className="text-[14px]">
                    {isSavingService
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
      ) : activeTab === "commission" ? (
        <section className="space-y-8 rounded-sm border border-border bg-surface p-6 shadow-card xl:p-8">
          <div className="max-w-[70%]">
            <h2 className="text-[28px] font-medium text-foreground">
              {t("configurations.commission")}
            </h2>
            <div className="mt-8 flex w-full flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <TextInput
                  classNames={appFieldClassNames}
                  disabled={
                    commissionConfigQuery.isLoading || isSavingCommission
                  }
                  label={t("configurations.commission")}
                  onChange={(event) =>
                    setCommissionValue(event.currentTarget.value)
                  }
                  placeholder="10"
                  styles={appFieldStyles}
                  value={commissionValue}
                />
              </div>
              <Button
                className="h-12 min-w-[135px] rounded-sm px-8 text-[16px] font-medium"
                disabled={commissionConfigQuery.isLoading || isSavingCommission}
                onClick={handleSaveCommission}
              >
                <p className="text-[14px]">
                  {isSavingCommission ? t("forms.saving") : t("actions.save")}
                </p>
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-5">
          {createLocationOpened ? (
            <section className="rounded-sm border border-border bg-surface p-6 shadow-card">
              <div className="grid gap-5 md:grid-cols-3">
                <TextInput
                  classNames={appFieldClassNames}
                  disabled={isCreatingLocation}
                  label={t("configurations.quartier")}
                  onChange={(event) =>
                    setQuartierName(event.currentTarget.value)
                  }
                  placeholder={t("configurations.quartierName")}
                  styles={appFieldStyles}
                  value={quartierName}
                />
                <TextInput
                  classNames={appFieldClassNames}
                  disabled={isCreatingLocation}
                  label={t("configurations.cell")}
                  onChange={(event) => setCellName(event.currentTarget.value)}
                  placeholder={t("configurations.cellName")}
                  styles={appFieldStyles}
                  value={cellName}
                />
                <TextInput
                  classNames={appFieldClassNames}
                  disabled={isCreatingLocation}
                  label={t("configurations.avenueName")}
                  onChange={(event) => setAvenueName(event.currentTarget.value)}
                  placeholder={t("configurations.avenueName")}
                  styles={appFieldStyles}
                  value={avenueName}
                />
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <Button
                  className="h-12 rounded-sm px-6 text-[14px]"
                  disabled={isCreatingLocation}
                  onClick={handleCreateLocation}
                >
                  {isCreatingLocation
                    ? t("forms.creation")
                    : t("configurations.saveLocation")}
                </Button>
              </div>
            </section>
          ) : null}

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
                  {isLocationsLoading ? (
                    <TableSkeletonRows columns={4} rows={8} />
                  ) : visibleLocationGroups.length ? (
                    visibleLocationGroups.map((group) =>
                      group.rows.map((row, rowIndex) => (
                        <TableTr
                          className="border-b border-border last:border-b-0"
                          key={`${group.quartierId}-${row.serineId}`}
                        >
                          {rowIndex === 0 ? (
                            <TableTd
                              className="min-w-[230px] align-top"
                              rowSpan={group.rows.length}
                            >
                              <div className="px-4 py-6">
                                <p className="text-[16px] font-semibold text-foreground">
                                  {group.quartierName}
                                </p>
                              </div>
                            </TableTd>
                          ) : null}

                          <TableTd className="min-w-[260px] px-8 py-5 align-top">
                            <div className="flex items-center gap-3 border-b border-border pb-5 last:border-b-0">
                              <span className="size-3 shrink-0 rounded-full bg-brand" />
                              <p className="text-[15px] font-medium text-text-muted">
                                {row.serineName}
                              </p>
                            </div>
                          </TableTd>

                          <TableTd className="min-w-[360px] px-8 py-5 align-top">
                            <div className="max-w-[360px] overflow-x-auto pb-1">
                              <div className="flex min-w-max gap-3">
                                {row.avenueNames.length ? (
                                  row.avenueNames.map((name) => (
                                    <span
                                      className="inline-flex h-10 items-center rounded-[6px] bg-[#D9DEDA] px-4 text-[14px] text-foreground"
                                      key={`${row.serineId}-${name}`}
                                    >
                                      {name}
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

                          <TableTd className="w-[110px] px-8 py-5 align-top text-center">
                            <Menu position="bottom-end" shadow="md" width={180}>
                              <Menu.Target>
                                <Button
                                  aria-label={`Open actions for ${row.serineName}`}
                                  size="icon"
                                  variant="subtle"
                                >
                                  <HiEllipsisHorizontal className="size-6" />
                                </Button>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  onClick={() =>
                                    handlePrepareLocationForm(group, row)
                                  }
                                >
                                  {t("configurations.addAvenue")}
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </TableTd>
                        </TableTr>
                      )),
                    )
                  ) : (
                    <TableTr>
                      <TableTd
                        className="px-8 py-10 text-center text-[15px] text-text-muted"
                        colSpan={4}
                      >
                        {t("configurations.noLocationsFound")}
                      </TableTd>
                    </TableTr>
                  )}
                </TableTbody>
              </Table>
            </TableScrollContainer>

            <div className="flex justify-center px-6 py-7">
              <Pagination
                boundaries={1}
                color="brand"
                onChange={setLocationPage}
                radius="xl"
                siblings={2}
                size="md"
                total={totalLocationPages}
                value={locationPage}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
