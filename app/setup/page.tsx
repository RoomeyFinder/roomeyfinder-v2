import { Suspense } from "react";

import { FlowLoading } from "@/components/roommate-flow/shared";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";
import { RoommateFlow } from "@/components/roommate-flow";
import type { FlowGate } from "@/lib/roommate-flow";

type SetupStep = Exclude<FlowGate, "discover">;

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  return (
    <Suspense fallback={<FlowLoading />}>
      <SetupContent searchParams={searchParams} />
    </Suspense>
  );
}

function isSetupStep(step: string | undefined): step is SetupStep {
  return step === "profile" || step === "preferences" || step === "home";
}

async function SetupContent({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const { step } = await searchParams;
  const initialStep = isSetupStep(step) ? step : undefined;
  const { userId } = await requireAuthenticatedUser();

  return <RoommateFlow userId={userId} initialStep={initialStep} />;
}
