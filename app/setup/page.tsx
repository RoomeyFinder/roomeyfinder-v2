import { Suspense } from "react";

import { FlowLoading } from "@/components/roommate-flow/shared";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";
import { RoommateFlow } from "@/components/roommate-flow";
import type { FlowGate } from "@/lib/roommate-flow";

type SetupStep = Exclude<FlowGate, "discover">;

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; returnTo?: string }>;
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

function isAllowedReturnPath(path: string | undefined) {
  return path === "/matches" ? path : undefined;
}

async function SetupContent({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; returnTo?: string }>;
}) {
  const { step, returnTo } = await searchParams;
  const initialStep = isSetupStep(step) ? step : undefined;
  const allowedReturnPath = isAllowedReturnPath(returnTo);
  const { userId } = await requireAuthenticatedUser();

  return <RoommateFlow userId={userId} initialStep={initialStep} returnTo={allowedReturnPath} />;
}
