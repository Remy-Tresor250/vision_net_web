"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import PageSkeleton from "@/components/dashboard/PageSkeleton";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  children: React.ReactNode;
}

export default function AuthGate({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrate = useAuthStore((state) => state.hydrate);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user && user.role !== "ADMIN") {
      router.replace("/login");
    }
  }, [hasHydrated, pathname, router, token, user]);

  if (!hasHydrated || !token || (user && user.role !== "ADMIN")) {
    return <PageSkeleton showCards />;
  }

  return children;
}
