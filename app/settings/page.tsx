import { Suspense } from "react";

import { SettingsPage } from "@/components/settings-page";
import { FlowLoading } from "@/components/roommate-flow/shared";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

export default function SettingsRoute() {
  return (
    <Suspense fallback={<FlowLoading />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const { supabase, userId } = await requireAuthenticatedUser();
  const [
    { data: userData, error: userError },
    { data: profile, error: profileError },
    { data: preferences, error: preferencesError },
    { data: homes, error: homesError },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("profiles")
      .select("username, first_name, is_visible, is_verified, profile_status, created_at")
      .eq("id", userId)
      .single(),
    supabase
      .from("preferences")
      .select(
        "budget_min, budget_max, move_in_from, move_in_to, preferred_gender, min_age, max_age, smoking_preference, pets_preference, match_with_home_seekers",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("homes").select("id, status").eq("owner_id", userId),
  ]);

  if (userError || !userData.user || profileError || preferencesError || homesError || !profile) {
    throw new Error("Unable to load your settings.");
  }

  return (
    <SettingsPage
      userId={userId}
      email={userData.user.email ?? null}
      emailConfirmed={Boolean(userData.user.email_confirmed_at)}
      joinedAt={userData.user.created_at}
      profile={profile}
      preferences={preferences}
      homes={homes ?? []}
    />
  );
}
