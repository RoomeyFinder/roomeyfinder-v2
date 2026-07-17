"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { DiscoveryStep } from "@/components/roommate-flow/discovery-step";
import { SetupWarningModal } from "@/components/roommate-flow/setup-warning-modal";
import { FlowLoading } from "@/components/roommate-flow/shared";
import { useDiscovery } from "@/hooks/useDiscovery";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";

export function MatchesPage({ userId }: { userId: string }) {
  const router = useRouter();
  const flow = useOnboardingFlow(userId);
  const [allowIncompleteSetup, setAllowIncompleteSetup] = useState(false);
  const canLoadMatches = !flow.loading && (flow.gate === "discover" || allowIncompleteSetup);
  const discovery = useDiscovery(userId, canLoadMatches);

  if (flow.loading) return <FlowLoading />;

  if (flow.gate !== "discover" && !allowIncompleteSetup) {
    return (
      <SetupWarningModal
        gate={flow.gate}
        onUpdateSetup={() => router.push("/setup")}
        onContinueAnyway={() => setAllowIncompleteSetup(true)}
      />
    );
  }

  return (
    <DiscoveryStep userId={userId} choice={flow.homeChoice ?? "seeker"} discovery={discovery} />
  );
}
