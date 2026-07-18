"use client";

import { Home, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { FlowLoading, FlowProgress } from "@/components/roommate-flow/shared";
import { lifestyleOptions, setupSteps } from "@/components/roommate-flow/constants";
import { HomeStep } from "@/components/roommate-flow/home-step";
import { PreferencesStep } from "@/components/roommate-flow/preferences-step";
import { ProfileStep } from "@/components/roommate-flow/profile-step";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { fromPostgisPoint } from "@/lib/location";
import type {
  FlowGate,
  HomeChoice,
  HomeDraft,
  PreferenceDraft,
  ProfileDraft,
} from "@/lib/roommate-flow";

export function RoommateFlow({
  userId,
  initialStep,
}: {
  userId: string;
  initialStep?: Exclude<FlowGate, "discover">;
}) {
  const router = useRouter();
  const flow = useOnboardingFlow(userId);
  const [activeStep, setActiveStep] = useState<FlowGate | null>(initialStep ?? null);
  const {
    saveHomeChoice,
    saveHome: saveHomeToDatabase,
    deleteHomePhoto,
    saveProfile: saveProfileToDatabase,
    savePreferences: savePreferencesToDatabase,
  } = flow;

  const saveProfile = useCallback(
    async (draft: ProfileDraft) => {
      const completed = await saveProfileToDatabase(draft);
      if (completed) {
        // The header reads the username in a server component. Refresh it after
        // saving so the Account link immediately points at the new profile URL.
        router.refresh();
        setActiveStep("preferences");
      }
      return completed;
    },
    [router, saveProfileToDatabase],
  );

  const savePreferences = useCallback(
    async (draft: PreferenceDraft) => {
      const completed = await savePreferencesToDatabase(draft);
      if (completed) setActiveStep("home");
      return completed;
    },
    [savePreferencesToDatabase],
  );

  const continueAsSeeker = useCallback(
    async (choice: Exclude<HomeChoice, "homeowner">) => {
      const completed = await saveHomeChoice(choice);
      if (completed) {
        setActiveStep(null);
        router.replace("/matches");
      }
      return completed;
    },
    [router, saveHomeChoice],
  );

  const saveHome = useCallback(
    async (draft: HomeDraft) => {
      const completed = await saveHomeToDatabase(draft);
      if (completed) {
        setActiveStep(null);
        router.replace("/matches");
      }
      return completed;
    },
    [router, saveHomeToDatabase],
  );

  const navigateToCompletedStep = useCallback((step: string) => {
    setActiveStep(step as FlowGate);
  }, []);

  const activeStepIndex = activeStep ? setupSteps.findIndex((step) => step.id === activeStep) : -1;
  const gateIndex =
    flow.gate === "discover"
      ? setupSteps.length
      : setupSteps.findIndex((step) => step.id === flow.gate);
  // An explicit step from the profile page is an edit request, so it should
  // remain selectable even when another onboarding step is still incomplete.
  const canViewActiveStep =
    activeStepIndex >= 0 && (activeStepIndex <= gateIndex || initialStep !== undefined);

  useEffect(() => {
    if (flow.error) toast.error(flow.error);
  }, [flow.error]);

  if (flow.loading) return <FlowLoading />;

  const savedProfileCoordinates = fromPostgisPoint(flow.privateProfile?.location);
  const savedProfileLocation = savedProfileCoordinates
    ? {
        ...savedProfileCoordinates,
        label: `Saved location (${savedProfileCoordinates.latitude.toFixed(4)}, ${savedProfileCoordinates.longitude.toFixed(4)})`,
      }
    : null;

  const profileDraft: ProfileDraft = {
    firstName: flow.profile?.first_name ?? "",
    lastName: flow.privateProfile?.last_name ?? "",
    contactPhone: flow.profileContact?.contact_phone ?? "",
    username: flow.profile?.username ?? "",
    birthDate: flow.privateProfile?.date_of_birth ?? "",
    gender: flow.profile?.gender ?? "prefer_not_to_say",
    lifestyleTags: flow.profile?.bio
      ? lifestyleOptions
          .filter((option) => flow.profile?.bio?.toLowerCase().includes(option.value))
          .map((option) => option.value)
      : [],
    location: savedProfileLocation,
    profilePhoto: null,
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

  const currentStep = canViewActiveStep
    ? activeStep!
    : flow.gate === "discover"
      ? "profile"
      : flow.gate;

  const existingHome =
    flow.homes.find((home) => home.status === "active") ??
    flow.homes.find((home) => home.status === "draft") ??
    flow.homes[0] ??
    null;
  const homeAddress = existingHome ? (flow.homeAddresses[existingHome.id] ?? null) : null;
  const existingPhotos = existingHome ? (flow.homePhotos[existingHome.id] ?? []) : [];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <FlowHero />
      <FlowProgress
        current={currentStep}
        gates={setupSteps}
        completedThrough={flow.gate}
        onStepChange={navigateToCompletedStep}
      />
      {flow.error ? (
        <div className="mt-6 rounded-brand-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {flow.error}
        </div>
      ) : null}
      <div className="mt-8">
        {currentStep === "profile" ? (
          <ProfileStep
            initialDraft={profileDraft}
            initialPhoto={flow.profilePhoto}
            onContinue={saveProfile}
            saving={flow.saving}
          />
        ) : currentStep === "preferences" ? (
          <PreferencesStep
            initialDraft={preferenceDraft}
            onContinue={savePreferences}
            saving={flow.saving}
          />
        ) : (
          <HomeStep
            initialChoice={flow.homeChoice}
            initialTeamUp={flow.preferences?.match_with_home_seekers ?? false}
            existingHome={existingHome}
            homeAddress={homeAddress}
            existingPhotos={existingPhotos}
            saving={flow.saving}
            onContinue={continueAsSeeker}
            onSaveHome={saveHome}
            onDeleteHomePhoto={deleteHomePhoto}
            onViewMatches={() => router.push("/matches")}
          />
        )}
      </div>
    </div>
  );
}

function FlowHero() {
  return (
    <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <Badge variant="secondary" className="mb-3 gap-1.5 px-3 py-1">
          <Home className="h-3.5 w-3.5" /> A better way to share a home
        </Badge>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Find a living situation that feels like home.
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          Tell us a little about yourself and we&apos;ll line up people who fit your budget, habits,
          and home plans.
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-brand" />
        Your contact details stay private until a match accepts.
      </div>
    </div>
  );
}
