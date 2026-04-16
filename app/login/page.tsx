import type { Metadata } from "next";
import { Suspense } from "react";

import LoginPageContent from "@/components/auth/LoginPageContent";

export const metadata: Metadata = {
  title: "Admin Login | Vision Net",
  description: "Sign in to the Vision Net admin dashboard.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <Suspense fallback={null}>
          <LoginPageContent />
        </Suspense>
      </div>
    </main>
  );
}
