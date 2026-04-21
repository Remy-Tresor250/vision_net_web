"use client";

import Link from "next/link";
import { Drawer, Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  HiBars3,
  HiOutlineBanknotes,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineDocumentChartBar,
  HiOutlineSquares2X2,
  HiOutlineUserCircle,
  HiOutlineUsers,
} from "react-icons/hi2";

import AppLogo from "@/components/dashboard/AppLogo";
import Button from "@/components/ui/Button";
import { useAdminDashboardQuery } from "@/lib/query/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguageStore } from "@/stores/language-store";
import { useTranslation } from "react-i18next";

interface Props {
  children: React.ReactNode;
}

const navigationItems = [
  {
    href: "/dashboard",
    labelKey: "dashboard",
    icon: HiOutlineSquares2X2,
  },
  {
    href: "/clients",
    labelKey: "clients",
    icon: HiOutlineUsers,
  },
  {
    href: "/agents",
    labelKey: "agents",
    icon: HiOutlineUserCircle,
  },
  {
    href: "/payments",
    labelKey: "payment",
    icon: HiOutlineBanknotes,
  },
  {
    href: "/configurations",
    labelKey: "configurations",
    icon: HiOutlineCog6Tooth,
  },
  {
    href: "/reports",
    labelKey: "reports",
    icon: HiOutlineDocumentChartBar,
  },
] as const;

function SidebarContent({ pathname }: { pathname: string }) {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <div className="flex h-full flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between gap-4 px-4 py-6">
        <AppLogo />
        <div className="hidden size-11 items-center justify-center rounded-lg border border-border text-text-muted xl:flex">
          <HiBars3 className="size-6" />
        </div>
      </div>
      <nav className="flex-1 space-y-3 px-5 py-8">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={cn(
                "flex items-center gap-4 rounded-sm px-5 py-4 text-lg font-medium text-text-muted transition-colors duration-200 ease-out hover:bg-surface-muted hover:text-foreground",
                isActive && "bg-brand text-white hover:bg-brand hover:text-white"
              )}
              href={item.href}
            >
              <item.icon className="size-6" />
              <span className="text-[14px] ">{t(`nav.${item.labelKey}`)}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-5 pb-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {t("common.language")}
        </p>
        <div className="grid grid-cols-2 rounded-sm border border-border bg-surface-muted p-1">
          {(["fr", "en"] as const).map((option) => (
            <button
              className={cn(
                "h-9 rounded-sm text-[13px] font-medium text-text-muted",
                language === option && "bg-brand text-white",
              )}
              key={option}
              onClick={() => setLanguage(option)}
              type="button"
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [opened, { close, open }] = useDisclosure(false);
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const hydrateLanguage = useLanguageStore((state) => state.hydrate);
  const dashboardQuery = useAdminDashboardQuery({
    topAgentsLimit: 10,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    hydrateLanguage();
  }, [hydrateLanguage]);

  const currentNavigationItem =
    navigationItems
      .find(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      );
  const currentPage = (() => {
    const title = currentNavigationItem
      ? t(`nav.${currentNavigationItem.labelKey}`)
      : t("nav.dashboard");

    if (pathname === "/clients") {
      return {
        title,
        subtitle: t("dashboard.clientsCount", {
          count: dashboardQuery.data?.kpis?.totalClientsActive?.count ?? 0,
        }),
      };
    }

    if (pathname === "/agents") {
      return {
        title,
        subtitle: t("dashboard.agentsCount", {
          count: dashboardQuery.data?.kpis?.totalAgentsActive?.count ?? 0,
        }),
      };
    }

    if (pathname === "/payments") {
      return {
        title,
        subtitle: "",
      };
    }

    if (pathname === "/configurations") {
      return {
        title,
        subtitle: "System configurations",
      };
    }

    if (pathname === "/reports") {
      return {
        title,
        subtitle: "Monthly billing reports",
      };
    }

    if (pathname === "/settings") {
      return {
        title: t("account.settings"),
        subtitle: "",
      };
    }

    return {
      title,
      subtitle: "",
    };
  })();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Drawer
        classNames={{
          body: "p-0",
          content: "bg-surface",
          header: "hidden",
        }}
        onClose={close}
        opened={opened}
        padding={0}
        position="left"
        size="19rem"
      >
        <SidebarContent pathname={pathname} />
      </Drawer>
      <div className="flex min-h-screen">
        <aside className="hidden w-[23vw] shrink-0 xl:block fixed h-screen">
          <SidebarContent pathname={pathname} />
        </aside>
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="xl:w-[77vw] xl:self-end border-b border-border bg-surface px-5 py-2 md:px-6 xl:px-8">
            <div className="flex items-start justify-between gap-5">
              <div className="flex items-start gap-4">
                <Button className="xl:hidden" onClick={open} size="icon" variant="outline">
                  <HiBars3 className="size-6" />
                </Button>
                <div>
                  <p className="text-[27px] font-semibold text-foreground">
                    {currentPage.title}
                  </p>
                  {currentPage.subtitle ? (
                    <p className="-mt-[6px] text-[13px] text-[#6B7C72]">
                      {currentPage.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
              <Menu position="bottom-end" shadow="md" width={220}>
                <Menu.Target>
                  <button
                    className="flex items-center gap-4 rounded-sm px-2 py-1 hover:bg-surface-muted"
                    type="button"
                  >
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        {user?.fullNames ?? "Admin User"}
                      </p>
                      <p className="-mt-1 text-xs uppercase text-text-muted">
                        {t("account.role")}
                      </p>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-xl bg-foreground text-white">
                      <HiOutlineUserCircle className="size-8" />
                    </div>
                  </button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    component={Link}
                    href="/settings"
                    leftSection={<HiOutlineCog6Tooth className="size-4" />}
                  >
                    {t("account.settings")}
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    leftSection={<HiOutlineArrowRightOnRectangle className="size-4" />}
                    onClick={handleLogout}
                  >
                    {t("account.logout")}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          </header>
          <main className="xl:w-[77vw] xl:self-end flex-1 px-2 py-7 md:px-4 xl:px-6 xl:py-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
