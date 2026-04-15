import type { Metadata } from "next";
import { Suspense } from "react";

import AppLogo from "@/components/dashboard/AppLogo";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login | Vision Net",
  description: "Sign in to the Vision Net admin dashboard.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-sm border border-border bg-surface shadow-card lg:grid-cols-[1fr_440px]">
          <div className="hidden border-r border-border bg-surface-muted p-10 lg:flex lg:flex-col lg:justify-between">
            <AppLogo />
            <div className="max-w-lg">
              <p className="text-[42px] font-semibold leading-tight text-foreground">
                Admin panel
              </p>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-text-muted">
                Manage clients, agents, collections, receipts, imports, and daily
                billing operations from one secure workspace.
              </p>
            </div>
            
          </div>
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <div className="mb-9 lg:hidden">
              <AppLogo />
            </div>
            <div className="mb-8">
              <p className="text-[30px] font-semibold text-foreground">
                Connexion
              </p>
              <p className="mt-2 text-[14px] leading-6 text-text-muted">
                Utilisez votre telephone administrateur et votre mot de passe.
              </p>
            </div>
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
