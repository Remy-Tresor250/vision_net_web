"use client";

import Link from "next/link";
import { Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import {
  HiBars3,
  HiOutlineBanknotes,
  HiOutlineSquares2X2,
  HiOutlineUserCircle,
  HiOutlineUsers,
} from "react-icons/hi2";

import AppLogo from "@/components/dashboard/AppLogo";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: HiOutlineSquares2X2,
  },
  {
    href: "/clients",
    label: "Clients",
    icon: HiOutlineUsers,
  },
  {
    href: "/agents",
    label: "Agents",
    icon: HiOutlineUserCircle,
  },
  {
    href: "/payments",
    label: "Payment",
    icon: HiOutlineBanknotes,
  },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "",
  },
  "/clients": {
    title: "Clients",
    subtitle: "73,434 registered clients",
  },
  "/agents": {
    title: "Agents",
    subtitle: "8 registered agents",
  },
  "/payments": {
    title: "Payments",
    subtitle: "8000 Transactions for AUG",
  },
};

function SidebarContent({ pathname }: { pathname: string }) {
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
              <span className="text-[14px] ">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function DashboardShell({ children }: Props) {
  const pathname = usePathname();
  const [opened, { close, open }] = useDisclosure(false);

  const currentPage =
    navigationItems
      .map((item) => pageMeta[item.href])
      .find((_, index) =>
        pathname === navigationItems[index].href ||
        pathname.startsWith(`${navigationItems[index].href}/`)
      ) ?? pageMeta["/dashboard"];

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
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">Admin User</p>
                  <p className="-mt-1 text-xs uppercasemtext-text-muted">
                    Super Admin
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-foreground text-white">
                  <HiOutlineUserCircle className="size-8" />
                </div>
              </div>
            </div>
          </header>
          <main className="xl:w-[77vw] xl:self-end flex-1 px-2 py-7 md:px-4 xl:px-6 xl:py-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
