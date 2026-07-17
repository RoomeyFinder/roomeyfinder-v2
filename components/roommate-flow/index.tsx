"use client";

import { Home, ShieldCheck } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { FlowLoading, FlowProgress } from "@/components/roommate-flow/shared";
import { gateLabels, lifestyleOptions } from "@/components/roommate-flow/constants";
import { HomeStep } from "@/components/roommate-flow/home-step";
import { PreferencesStep } from "@/components/roommate-flow/preferences-step";
import { ProfileStep } from "@/components/roommate-flow/profile-step";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import type { HomeChoice, HomeDraft, PreferenceDraft, ProfileDraft } from "@/lib/roommate-flow";

export function RoommateFlow({ userId }: { userId: string }) {
  const router = useRouter();
  const flow = useOnboardingFlow(userId);
  const { saveHomeChoice, saveHome: saveHomeToDatabase } = flow;

  const continueAsSeeker = useCallback(async (choice: Exclude<HomeChoice, "homeowner">) => {
    const completed = await saveHomeChoice(choice);
    if (completed) router.push("/matches");
    return completed;
  }, [router, saveHomeChoice]);

  const saveHome = useCallback(async (draft: HomeDraft) => {
    const completed = await saveHomeToDatabase(draft);
    if (completed) router.push("/matches");
    return completed;
  }, [router, saveHomeToDatabase]);

  useEffect(() => {
    if (!flow.loading && flow.gate === "discover") router.replace("/matches");
  }, [flow.gate, flow.loading, router]);

  if (flow.loading || flow.gate === "discover") return <FlowLoading />;

  const profileDraft: ProfileDraft = {
    firstName: flow.profile?.first_name ?? "",
    lastName: flow.privateProfile?.last_name ?? "",
    username: flow.profile?.username ?? "",
    birthDate: flow.privateProfile?.date_of_birth ?? "",
    gender: flow.profile?.gender ?? "prefer_not_to_say",
    lifestyleTags: flow.profile?.bio ? lifestyleOptions.filter((option) => flow.profile?.bio?.toLowerCase().includes(option.value)).map((option) => option.value) : [],
    location: null,
  };

  const preferenceDraft: PreferenceDraft = {
    budgetMin: flow.preferences?.budget_min?.toString() ?? "",
    budgetMax: flow.preferences?.budget_max?.toString() ?? "",
    maxDistanceMiles: flow.preferences?.max_distance_miles?.toString() ?? "25",
    moveInFrom: flow.preferences?.move_in_from ?? "",
    moveInTo: flow.preferences?.move_in_to ?? "",
    smokingPreference: flow.preferences?.smoking_preference ?? "no",
    petsPreference: flow.preferences?.pets_preference ?? "depends",
  };

  return <div className="mx-auto w-full max-w-6xl"><FlowHero /><FlowProgress current={flow.gate} gates={gateLabels} />{flow.error ? <div className="mt-6 rounded-brand-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{flow.error}</div> : null}<div className="mt-8">{flow.gate === "profile" ? <ProfileStep initialDraft={profileDraft} onContinue={flow.saveProfile} saving={flow.saving} /> : flow.gate === "preferences" ? <PreferencesStep initialDraft={preferenceDraft} onContinue={flow.savePreferences} saving={flow.saving} /> : <HomeStep initialTeamUp={flow.preferences?.match_with_home_seekers ?? false} saving={flow.saving} onContinue={continueAsSeeker} onSaveHome={saveHome} />}</div></div>;
}

function FlowHero() {
  return <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div><Badge variant="secondary" className="mb-3 gap-1.5 px-3 py-1"><Home className="h-3.5 w-3.5" /> A better way to share a home</Badge><h1 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">Find a living situation that feels like home.</h1><p className="mt-3 max-w-xl text-base text-muted-foreground">Tell us a little about yourself and we&apos;ll line up people who fit your budget, habits, and home plans.</p></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 text-brand" />Your contact details stay private until a match accepts.</div></div>;
}
