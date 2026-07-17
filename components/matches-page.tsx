"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DiscoveryStep } from "@/components/roommate-flow/discovery-step";
import { FlowLoading } from "@/components/roommate-flow/shared";
import { useDiscovery } from "@/hooks/useDiscovery";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";

export function MatchesPage({ userId }: { userId: string }) {
  const router = useRouter();
  const flow = useOnboardingFlow(userId);
  const discovery = useDiscovery(userId, flow.gate === "discover");

  useEffect(() => {
    if (!flow.loading && flow.gate !== "discover") router.replace("/protected");
  }, [flow.gate, flow.loading, router]);

  if (flow.loading || flow.gate !== "discover") return <FlowLoading />;

  return <DiscoveryStep userId={userId} choice={flow.homeChoice ?? "seeker"} discovery={discovery} />;
}
