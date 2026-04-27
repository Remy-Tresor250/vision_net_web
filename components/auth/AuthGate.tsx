"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import PageSkeleton from "@/components/dashboard/PageSkeleton";
import { setStoredUser } from "@/lib/auth/cookies";
import { useAuthMeQuery } from "@/lib/query/hooks";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  children: React.ReactNode;
}

export default function AuthGate({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrate = useAuthStore((state) => state.hydrate);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const meQuery = useAuthMeQuery({
    enabled: hasHydrated && Boolean(token),
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!meQuery.data) {
      return;
    }

    setUser(meQuery.data);
    setStoredUser(meQuery.data);
  }, [meQuery.data, setUser]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user && user.role !== "ADMIN") {
      router.replace("/login");
    }

    if (!user && meQuery.isError) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hasHydrated, meQuery.isError, pathname, router, token, user]);

  const isResolvingSession =
    !hasHydrated ||
    !token ||
    (!user && !meQuery.isError) ||
    meQuery.isLoading;

  if (
    isResolvingSession ||
    (user && user.role !== "ADMIN") ||
    (!user && meQuery.isError)
  ) {
    return <PageSkeleton showCards />;
  }

  return children;
}
