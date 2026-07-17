import { Suspense } from "react";

import { FlowLoading } from "@/components/roommate-flow/shared";
import { createClient } from "@/lib/supabase/server";
import { RoommateFlow } from "@/components/roommate-flow";
import type { FlowGate } from "@/lib/roommate-flow";
import { redirect } from "next/navigation";

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
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string") redirect("/auth/login");

  return <RoommateFlow userId={userId} initialStep={initialStep} />;
}
