"use client";

import { TextInput } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { HiPlus } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

import LocationGroupsTable, {
  type LocationTableGroup,
  type LocationTableRow,
} from "@/components/dashboard/LocationGroupsTable";
import LocationConfigurationModal, {
  createAvenueDraft,
  createCellDraft,
  type CellDraft,
  type LocationModalMode,
} from "@/components/dashboard/LocationConfigurationModal";
import ServiceConfigurationsSection from "@/components/dashboard/ServiceConfigurationsSection";
import NoDataCard from "@/components/dashboard/NoDataCard";
import Button from "@/components/ui/Button";
import { appFieldClassNames, appFieldStyles } from "@/components/ui/formStyles";
import { hasAnyPermission } from "@/lib/auth/permissions";
import { adminApi } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useAdminAvenuesQuery,
  useAdminQuartiersQuery,
  useAdminSerinesQuery,
  useAdminServiceTypesQuery,
  useCommissionConfigQuery,
  useCreateServiceTypeMutation,
  useDeleteServiceTypeMutation,
  useUpdateCommissionConfigMutation,
  useUpdateServiceTypeMutation,
} from "@/lib/query/hooks";
import { invalidateLocations } from "@/lib/query/invalidation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
type ConfigurationTab = "location" | "service" | "commission";

const LOCATION_PAGE_SIZE = 2;
function ConfigurationTabs({
  activeTab,
  onChange,
  tabs,
}: {
  activeTab: ConfigurationTab;
  onChange: (tab: ConfigurationTab) => void;
  tabs: ConfigurationTab[];
}) {
  const { t } = useTranslation();

  return (
    <div
      className="grid w-full max-w-[520px] rounded-[14px] bg-surface-muted p-1.5"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tabValue) => {
        const tab =
          tabValue === "location"
            ? { label: t("common.location"), value: "location" as const }
            : tabValue === "service"
              ? { label: t("common.service"), value: "service" as const }
              : { label: t("configurations.commission"), value: "commission" as const };
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
            <p className="text-[14px] font-medium">{tab.label}</p>
          </button>
        );
      })}
    </div>
  );
}

export default function ConfigurationsPanel() {
  const { t } = useTranslation();
  const permissions = useAuthStore((state) => state.user?.permissions);
  const canViewLocations = hasAnyPermission(permissions, ["locations.view"]);
  const canCreateLocation = hasAnyPermission(permissions, ["locations.create"]);
  const canEditLocation = hasAnyPermission(permissions, ["locations.edit"]);
  const canDeleteLocation = hasAnyPermission(permissions, ["locations.delete"]);
  const canViewServices = hasAnyPermission(permissions, ["service_types.view"]);
  const canCreateService = hasAnyPermission(permissions, ["service_types.create"]);
  const canEditService = hasAnyPermission(permissions, ["service_types.edit"]);
  const canDeleteService = hasAnyPermission(permissions, ["service_types.delete"]);
  const canViewCommissions = hasAnyPermission(permissions, ["commissions.view"]);
  const canEditCommissions = hasAnyPermission(permissions, ["commissions.edit"]);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ConfigurationTab>("location");
  const [serviceName, setServiceName] = useState("");
  const [serviceSubscription, setServiceSubscription] = useState(0);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | null>(null);
  const [commissionValue, setCommissionValue] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [locationPage, setLocationPage] = useState(1);
  const [locationModalOpened, setLocationModalOpened] = useState(false);
  const [locationModalMode, setLocationModalMode] = useState<LocationModalMode>("new-location");
  const [locationQuartierId, setLocationQuartierId] = useState<string | null>(null);
  const [locationQuartierName, setLocationQuartierName] = useState("");
  const [locationOriginalAvenueIds, setLocationOriginalAvenueIds] = useState<string[]>([]);
  const [quartierLocked, setQuartierLocked] = useState(false);
  const [locationCells, setLocationCells] = useState<CellDraft[]>([createCellDraft()]);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isLocationTablePending, setIsLocationTablePending] = useState(false);
  const locationTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const serviceTypesQuery = useAdminServiceTypesQuery(
    { limit: 100, skip: 0 },
    { enabled: canViewServices },
  );
  const commissionConfigQuery = useCommissionConfigQuery({ enabled: canViewCommissions });
  const quartiersQuery = useAdminQuartiersQuery(
    { limit: 100, skip: 0 },
    { enabled: canViewLocations },
  );
  const serinesQuery = useAdminSerinesQuery(
    { limit: 100, skip: 0 },
    { enabled: canViewLocations },
  );
  const avenuesQuery = useAdminAvenuesQuery(
    { limit: 100, skip: 0 },
    { enabled: canViewLocations },
  );

  const createServiceTypeMutation = useCreateServiceTypeMutation();
  const updateServiceTypeMutation = useUpdateServiceTypeMutation(selectedServiceTypeId ?? undefined);
  const deleteServiceTypeMutation = useDeleteServiceTypeMutation();
  const updateCommissionMutation = useUpdateCommissionConfigMutation();

  const serviceTypes = serviceTypesQuery.data?.data ?? [];

  const selectedServiceType =
    serviceTypes.find((serviceType) => serviceType.id === selectedServiceTypeId) ?? null;
  const isSavingService =
    createServiceTypeMutation.isPending || updateServiceTypeMutation.isPending;
  const isSavingCommission = updateCommissionMutation.isPending;
  const isLocationsLoading =
    quartiersQuery.isLoading ||
    quartiersQuery.isFetching ||
    serinesQuery.isLoading ||
    serinesQuery.isFetching ||
    avenuesQuery.isLoading ||
    avenuesQuery.isFetching ||
    isLocationTablePending;

  const groupedLocations = useMemo<LocationTableGroup[]>(() => {
    const quartiers = quartiersQuery.data?.data ?? [];
    const serines = serinesQuery.data?.data ?? [];
    const avenues = avenuesQuery.data?.data ?? [];
    const normalizedSearch = locationSearch.trim().toLowerCase();

    return quartiers
      .map((quartier) => {
        const quartierSerines = serines
          .filter((serine) => serine.quartierId === quartier.id)
          .map((serine) => ({
            avenueItems: avenues
              .filter((avenue) => avenue.serineId === serine.id)
              .map((avenue) => ({
                id: avenue.id,
                name: avenue.name,
              })),
            serineId: serine.id,
            serineName: serine.name,
          }));

        const matchesSearch =
          !normalizedSearch ||
          quartier.name.toLowerCase().includes(normalizedSearch) ||
          quartierSerines.some(
            (row) =>
              row.serineName.toLowerCase().includes(normalizedSearch) ||
              row.avenueItems.some((avenue) =>
                avenue.name.toLowerCase().includes(normalizedSearch),
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
                  avenueItems: [],
                  serineId: null,
                  serineName: t("configurations.noCellsYet"),
                },
              ],
        };
      })
      .filter((group): group is LocationTableGroup => Boolean(group));
  }, [quartiersQuery.data?.data, serinesQuery.data?.data, avenuesQuery.data?.data, locationSearch, t]);

  const totalLocationPages = Math.max(1, Math.ceil(groupedLocations.length / LOCATION_PAGE_SIZE));
  const visibleLocationGroups = groupedLocations.slice(
    (locationPage - 1) * LOCATION_PAGE_SIZE,
    locationPage * LOCATION_PAGE_SIZE,
  );
  const locationModalTitle =
    locationModalMode === "new-location"
      ? t("configurations.newLocationTitle")
      : locationModalMode === "add-cell"
        ? t("configurations.addCellTitle")
        : locationModalMode === "edit"
          ? t("configurations.editLocationTitle")
          : t("configurations.addAvenueTitle");
  const availableTabs = (
    [
      canViewLocations ? "location" : null,
      canViewServices ? "service" : null,
      canViewCommissions ? "commission" : null,
    ] as const
  ).filter((tab): tab is ConfigurationTab => Boolean(tab));

  useEffect(() => {
    if (commissionConfigQuery.data?.ratePercent === undefined) {
      return;
    }

    setCommissionValue(String(commissionConfigQuery.data.ratePercent));
  }, [commissionConfigQuery.data?.ratePercent]);

  useEffect(() => {
    if (locationPage > totalLocationPages) {
      setLocationPage(totalLocationPages);
    }
  }, [locationPage, totalLocationPages]);

  useEffect(() => {
    if (availableTabs.length && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [activeTab, availableTabs]);

  useEffect(
    () => () => {
      if (locationTransitionTimeoutRef.current) {
        clearTimeout(locationTransitionTimeoutRef.current);
      }
    },
    [],
  );

  function resetServiceForm() {
    setSelectedServiceTypeId(null);
    setServiceName("");
    setServiceSubscription(0);
  }

  function closeLocationModal() {
    setLocationModalOpened(false);
    setLocationModalMode("new-location");
    setLocationQuartierId(null);
    setLocationQuartierName("");
    setLocationOriginalAvenueIds([]);
    setQuartierLocked(false);
    setLocationCells([createCellDraft()]);
  }

  function openNewLocationModal() {
    setLocationModalMode("new-location");
    setLocationQuartierId(null);
    setLocationQuartierName("");
    setLocationOriginalAvenueIds([]);
    setQuartierLocked(false);
    setLocationCells([createCellDraft()]);
    setLocationModalOpened(true);
  }

  function openAddCellModal(group: LocationTableGroup) {
    setLocationOriginalAvenueIds([]);
    setLocationModalMode("add-cell");
    setLocationQuartierId(group.quartierId);
    setLocationQuartierName(group.quartierName);
    setQuartierLocked(true);
    setLocationCells([createCellDraft()]);
    setLocationModalOpened(true);
  }

  function openAddAvenueModal(group: LocationTableGroup, row: LocationTableRow) {
    setLocationOriginalAvenueIds([]);
    setLocationModalMode("add-avenue");
    setLocationQuartierId(group.quartierId);
    setLocationQuartierName(group.quartierName);
    setQuartierLocked(true);
    setLocationCells([
      createCellDraft({
        locked: true,
        name: row.serineName,
        serineId: row.serineId ?? undefined,
      }),
    ]);
    setLocationModalOpened(true);
  }

  function openEditLocationModal(group: LocationTableGroup, row: LocationTableRow) {
    if (!row.serineId) {
      return;
    }

    setLocationModalMode("edit");
    setLocationQuartierId(group.quartierId);
    setLocationQuartierName(group.quartierName);
    setLocationOriginalAvenueIds(row.avenueItems.map((avenue) => avenue.id));
    setQuartierLocked(false);
    setLocationCells([
      createCellDraft({
        avenues: row.avenueItems.length
          ? row.avenueItems.map((avenue) => createAvenueDraft(avenue.name, avenue.id))
          : [createAvenueDraft()],
        locked: false,
        name: row.serineName,
        serineId: row.serineId,
      }),
    ]);
    setLocationModalOpened(true);
  }

  function runLocationTableTransition(callback: () => void) {
    setIsLocationTablePending(true);
    callback();

    if (locationTransitionTimeoutRef.current) {
      clearTimeout(locationTransitionTimeoutRef.current);
    }

    locationTransitionTimeoutRef.current = setTimeout(() => {
      setIsLocationTablePending(false);
    }, 180);
  }

  function updateCellDraft(
    targetCellId: string,
    updater: (cell: CellDraft) => CellDraft,
  ) {
    setLocationCells((current) =>
      current.map((cell) => (cell.id === targetCellId ? updater(cell) : cell)),
    );
  }

  function addCellDraft() {
    setLocationCells((current) => [createCellDraft(), ...current]);
  }

  function removeCellDraft(cellId: string) {
    setLocationCells((current) =>
      current.length === 1 ? current : current.filter((cell) => cell.id !== cellId),
    );
  }

  function addAvenueDraft(cellId: string) {
    updateCellDraft(cellId, (cell) => ({
      ...cell,
      avenues: [createAvenueDraft(), ...cell.avenues],
    }));
  }

  function removeAvenueDraft(cellId: string, avenueId: string) {
    updateCellDraft(cellId, (cell) => ({
      ...cell,
      avenues:
        cell.avenues.length === 1
          ? cell.avenues
          : cell.avenues.filter((avenue) => avenue.id !== avenueId),
    }));
  }

  function resetLocationSearch() {
    setLocationSearch("");
    setLocationPage(1);
  }

  function getNormalizedLocationCells() {
    return locationCells.map((cell) => {
      const seenAvenues = new Set<string>();
      const avenues = cell.avenues.reduce<typeof cell.avenues>((result, avenue) => {
        const trimmedName = avenue.name.trim();

        if (!trimmedName) {
          return result;
        }

        const normalizedName = trimmedName.toLowerCase();

        if (seenAvenues.has(normalizedName)) {
          return result;
        }

        seenAvenues.add(normalizedName);
        result.push({
          ...avenue,
          name: trimmedName,
        });

        return result;
      }, []);

      return {
        ...cell,
        avenues,
        name: cell.name.trim(),
      };
    });
  }

  function handleEditService(serviceTypeId: string) {
    const serviceType = serviceTypes.find((item) => item.id === serviceTypeId);

    if (!serviceType) {
      return;
    }

    setSelectedServiceTypeId(serviceType.id);
    setServiceName(serviceType.name);
    setServiceSubscription(
      Number(((serviceType.subscriptionAmountMinor ?? 0) / 100).toFixed(0)) ?? 0,
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

  async function handleSaveLocation() {
    const trimmedQuartierName = locationQuartierName.trim();

    if (!trimmedQuartierName) {
      toast.error(t("configurations.enterQuartier"));
      return;
    }

    const normalizedCells = getNormalizedLocationCells();

    if (
      normalizedCells.some((cell) => !cell.name || cell.avenues.length === 0)
    ) {
      toast.error(t("configurations.enterFullLocation"));
      return;
    }

    setIsSavingLocation(true);

    try {
      let quartierId = locationQuartierId;
      const quartiers = quartiersQuery.data?.data ?? [];

      if (locationModalMode === "edit" && quartierId) {
        await adminApi.updateQuartier(quartierId, { name: trimmedQuartierName });
      } else if (!quartierId) {
        const matchingQuartier = quartiers.find(
          (quartier) => quartier.name.toLowerCase() === trimmedQuartierName.toLowerCase(),
        );

        if (matchingQuartier) {
          quartierId = matchingQuartier.id;
        } else {
          const quartier = await adminApi.createQuartier({
            name: trimmedQuartierName,
          });
          quartierId = quartier.id;
        }
      }

      if (!quartierId) {
        throw new Error("Quartier creation failed.");
      }

      for (const cell of normalizedCells) {
        let serineId = cell.serineId;

        if (locationModalMode === "edit" && serineId) {
          await adminApi.updateSerine(serineId, {
            name: cell.name,
            quartierId,
          });
        } else if (!serineId) {
          const serine = await adminApi.createSerine({
            name: cell.name,
            quartierId,
          });
          serineId = serine.id;
        }

        const remainingAvenueIds = new Set<string>();

        for (const avenue of cell.avenues) {
          if (avenue.avenueId) {
            remainingAvenueIds.add(avenue.avenueId);
            await adminApi.updateAvenue(avenue.avenueId, {
              name: avenue.name,
              serineId,
            });
            continue;
          }

          await adminApi.createAvenue({
            name: avenue.name,
            serineId,
          });
        }

        if (locationModalMode === "edit") {
          const deletedAvenueIds = locationOriginalAvenueIds.filter(
            (avenueId) => !remainingAvenueIds.has(avenueId),
          );

          for (const avenueId of deletedAvenueIds) {
            await adminApi.deleteAvenue(avenueId);
          }
        }
      }

      await invalidateLocations(queryClient);
      toast.success(
        locationModalMode === "edit"
          ? t("configurations.locationUpdated")
          : t("configurations.createLocationSuccess"),
      );
      resetLocationSearch();
      closeLocationModal();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSavingLocation(false);
    }
  }

  async function handleDeleteCell(row: LocationTableRow) {
    if (!row.serineId) {
      return;
    }

    const shouldDelete = window.confirm(
      t("configurations.confirmDeleteCell", { name: row.serineName }),
    );

    if (!shouldDelete) {
      return;
    }

    setIsSavingLocation(true);

    try {
      for (const avenue of row.avenueItems) {
        await adminApi.deleteAvenue(avenue.id);
      }

      await adminApi.deleteSerine(row.serineId);
      await invalidateLocations(queryClient);
      toast.success(t("configurations.cellDeleted", { name: row.serineName }));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSavingLocation(false);
    }
  }

  async function handleDeleteQuartier(group: LocationTableGroup) {
    const shouldDelete = window.confirm(
      t("configurations.confirmDeleteQuartier", { name: group.quartierName }),
    );

    if (!shouldDelete) {
      return;
    }

    setIsSavingLocation(true);

    try {
      for (const row of group.rows) {
        for (const avenue of row.avenueItems) {
          await adminApi.deleteAvenue(avenue.id);
        }

        if (row.serineId) {
          await adminApi.deleteSerine(row.serineId);
        }
      }

      await adminApi.deleteQuartier(group.quartierId);
      await invalidateLocations(queryClient);
      toast.success(t("configurations.quartierDeleted", { name: group.quartierName }));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSavingLocation(false);
    }
  }

  return (
    <>
      <div className="space-y-4 py-3">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <ConfigurationTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={availableTabs}
          />

          {activeTab === "service" && canViewServices ? (
            <Button
              className="h-12 min-w-[188px] rounded-[14px] px-3 text-[14px] font-medium"
              disabled={isSavingService || !canCreateService}
              onClick={resetServiceForm}
            >
              <HiPlus className="size-4" />
              <p className="text-[14px]">{t("configurations.newService")}</p>
            </Button>
          ) : activeTab === "location" && canViewLocations ? (
            <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
              <div className="w-full xl:max-w-[44rem]">
                <TextInput
                  classNames={appFieldClassNames}
                  onChange={(event) =>
                    runLocationTableTransition(() => {
                      setLocationSearch(event.currentTarget.value);
                      setLocationPage(1);
                    })
                  }
                  placeholder={t("configurations.searchLocation")}
                  styles={appFieldStyles}
                  value={locationSearch}
                />
              </div>
              <Button
                className="h-12 rounded-[14px] px-4 text-[14px] font-medium"
                disabled={isSavingLocation || !canCreateLocation}
                onClick={openNewLocationModal}
              >
                <HiPlus className="size-4" />
                <p className="text-[14px]">{t("configurations.createLocation")}</p>
              </Button>
            </div>
          ) : null}
        </div>

        {activeTab === "service" ? canViewServices ? (
          <ServiceConfigurationsSection
            canCreateService={canCreateService}
            canDeleteService={canDeleteService}
            canEditService={canEditService}
            isLoading={serviceTypesQuery.isLoading || serviceTypesQuery.isFetching}
            isSaving={isSavingService}
            onDeleteService={handleDeleteService}
            onEditService={handleEditService}
            onSaveService={handleSaveService}
            selectedServiceType={selectedServiceType}
            serviceName={serviceName}
            serviceSubscription={serviceSubscription}
            serviceTypes={serviceTypes}
            setServiceName={setServiceName}
            setServiceSubscription={setServiceSubscription}
          />
        ) : (
          <NoDataCard message={t("permissions.limitedData")} title={t("common.service")} />
        ) : activeTab === "commission" ? canViewCommissions ? (
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
                      commissionConfigQuery.isLoading ||
                      isSavingCommission ||
                      !canEditCommissions
                    }
                    label={t("configurations.commission")}
                    onChange={(event) => setCommissionValue(event.currentTarget.value)}
                    placeholder="10"
                    styles={appFieldStyles}
                    value={commissionValue}
                  />
                </div>
                <Button
                  className="h-12 min-w-[135px] rounded-sm px-8 text-[16px] font-medium"
                  disabled={
                    commissionConfigQuery.isLoading ||
                    isSavingCommission ||
                    !canEditCommissions
                  }
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
          <NoDataCard
            message={t("permissions.limitedData")}
            title={t("configurations.commission")}
          />
        ) : canViewLocations ? (
          <LocationGroupsTable
            canCreateLocation={canCreateLocation}
            canDeleteLocation={canDeleteLocation}
            canEditLocation={canEditLocation}
            disabled={isSavingLocation}
            groups={visibleLocationGroups}
            isLoading={isLocationsLoading}
            onAddAvenue={openAddAvenueModal}
            onAddCell={openAddCellModal}
            onDeleteCell={(_, row) => handleDeleteCell(row)}
            onDeleteQuartier={handleDeleteQuartier}
            onEditRow={openEditLocationModal}
            onPageChange={(page) => runLocationTableTransition(() => setLocationPage(page))}
            page={locationPage}
            totalPages={totalLocationPages}
          />
        ) : (
          <NoDataCard message={t("permissions.limitedData")} title={t("common.location")} />
        )}
      </div>

      <LocationConfigurationModal
        cells={locationCells}
        isSaving={isSavingLocation}
        mode={locationModalMode}
        onAddAvenue={addAvenueDraft}
        onAddCell={addCellDraft}
        onClose={closeLocationModal}
        onRemoveAvenue={removeAvenueDraft}
        onRemoveCell={removeCellDraft}
        onSave={handleSaveLocation}
        onUpdateAvenue={(cellId, avenueId, value) =>
          updateCellDraft(cellId, (current) => ({
            ...current,
            avenues: current.avenues.map((item) =>
              item.id === avenueId ? { ...item, name: value } : item,
            ),
          }))
        }
        onUpdateCell={(cellId, value) =>
          updateCellDraft(cellId, (current) => ({
            ...current,
            name: value,
          }))
        }
        opened={locationModalOpened}
        quartierLocked={quartierLocked}
        quartierName={locationQuartierName}
        submitLabel={
          locationModalMode === "edit"
            ? t("forms.saveChanges")
            : t("configurations.saveLocation")
        }
        setQuartierName={setLocationQuartierName}
        title={locationModalTitle}
      />
    </>
  );
}
