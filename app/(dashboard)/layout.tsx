import DashboardShell from "@/components/dashboard/DashboardShell";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return <DashboardShell>{children}</DashboardShell>;
}
