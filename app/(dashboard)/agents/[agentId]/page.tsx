import type { Metadata } from "next";

import PermissionGuard from "@/components/auth/PermissionGuard";
import AgentDetailsPanel from "@/components/dashboard/AgentDetailsPanel";

interface Props {
  params: Promise<{ agentId: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Agent Details | Vision Net",
    description: "Agent overview for Vision Net.",
  };
}

export default async function AgentDetailsPage({ params }: Props) {
  const { agentId } = await params;

  return (
    <PermissionGuard anyOf={["agents.view"]}>
      <AgentDetailsPanel agentId={agentId} />
    </PermissionGuard>
  );
}
