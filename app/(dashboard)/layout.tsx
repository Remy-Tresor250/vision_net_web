import AuthGate from "@/components/auth/AuthGate";
import DashboardShell from "@/components/dashboard/DashboardShell";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <AuthGate>
      <DashboardShell>{children}</DashboardShell>
    </AuthGate>
  );
}
