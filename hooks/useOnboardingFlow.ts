"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { toPostgisPoint } from "@/lib/location";
import { getUserFacingDatabaseError } from "@/lib/user-facing-errors";
import {
  getFlowGate,
  getHomeChoice,
  isPreferencesComplete,
  isProfileComplete,
  type HomeChoice,
  type HomeDraft,
  type PreferenceDraft,
  type ProfileDraft,
} from "@/lib/roommate-flow";
import type { Home, Preference, Profile, ProfilePrivate } from "@/types/schemas";

export function useOnboardingFlow(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [privateProfile, setPrivateProfile] = useState<ProfilePrivate | null>(null);
  const [preferences, setPreferences] = useState<Preference | null>(null);
  const [homes, setHomes] = useState<Home[]>([]);
  const [storedChoice, setStoredChoice] = useState<HomeChoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();

    const [profileResult, privateResult, preferenceResult, homesResult] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("profile_private")
          .select("*")
          .eq("profile_id", userId)
          .maybeSingle(),
        supabase
          .from("preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("homes")
          .select("*")
          .eq("owner_id", userId)
          .order("created_at", { ascending: false }),
      ]);

    const failed = [
      profileResult.error,
      privateResult.error,
      preferenceResult.error,
      homesResult.error,
    ].find(Boolean);

    if (failed) setError(failed.message);
    setProfile(profileResult.data);
    setPrivateProfile(privateResult.data);
    setPreferences(preferenceResult.data);
    setHomes(homesResult.data ?? []);

    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(`roomey-home-choice-${userId}`);
      if (saved === "seeker" || saved === "team_up") setStoredChoice(saved);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const profileComplete = isProfileComplete(profile, privateProfile);
  const preferencesComplete = isPreferencesComplete(preferences);
  const homeChoice = getHomeChoice(homes, storedChoice);
  const gate = getFlowGate({ profileComplete, preferencesComplete, homeChoice });

  const saveProfile = useCallback(
    async (draft: ProfileDraft) => {
      setSaving(true);
      setError("");
      const supabase = createClient();
      const location = draft.location
        ? toPostgisPoint(draft.location)
        : privateProfile?.location;

      if (!location) {
        setError("Choose an area or use your current location before continuing.");
        setSaving(false);
        return false;
      }

      const profileResult = await supabase
        .from("profiles")
        .update({
          first_name: draft.firstName.trim(),
          username: draft.username.trim(),
          gender: draft.gender,
          bio: draft.lifestyleTags.join(", "),
        })
        .eq("id", userId)
        .select()
        .single();

      const privateResult = await supabase
        .from("profile_private")
        .upsert(
          {
            profile_id: userId,
            last_name: draft.lastName.trim() || null,
            date_of_birth: draft.birthDate,
            location,
          },
          { onConflict: "profile_id" },
        )
        .select()
        .single();

      if (profileResult.error || privateResult.error) {
        setError(
          getUserFacingDatabaseError(
            profileResult.error ?? privateResult.error,
            "Unable to save your profile.",
          ),
        );
        setSaving(false);
        return false;
      }

      const activationResult = await supabase
        .from("profiles")
        .update({ profile_status: "active" })
        .eq("id", userId)
        .select()
        .single();

      if (activationResult.error) {
        setError(activationResult.error.message);
        setSaving(false);
        return false;
      }

      setProfile(activationResult.data);
      setPrivateProfile(privateResult.data);
      setSaving(false);
      return true;
    },
    [privateProfile?.location, userId],
  );

  const savePreferences = useCallback(
    async (draft: PreferenceDraft) => {
      setSaving(true);
      setError("");
      const supabase = createClient();
      const result = await supabase
        .from("preferences")
        .update({
          budget_min: Number(draft.budgetMin),
          budget_max: Number(draft.budgetMax),
          max_distance_miles: Number(draft.maxDistanceMiles),
          move_in_from: draft.moveInFrom,
          move_in_to: draft.moveInTo,
          smoking_preference: draft.smokingPreference,
          pets_preference: draft.petsPreference,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (result.error) {
        setError(result.error.message);
        setSaving(false);
        return false;
      }
      setPreferences(result.data);
      setSaving(false);
      return true;
    },
    [userId],
  );

  const saveHomeChoice = useCallback(
    async (choice: Exclude<HomeChoice, "homeowner">) => {
      setSaving(true);
      setError("");
      const supabase = createClient();
      const result = await supabase
        .from("preferences")
        .update({ match_with_home_seekers: choice === "team_up" })
        .eq("user_id", userId)
        .select()
        .single();

      if (result.error) {
        setError(result.error.message);
        setSaving(false);
        return false;
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(`roomey-home-choice-${userId}`, choice);
      }
      setStoredChoice(choice);
      setPreferences(result.data);
      setSaving(false);
      return true;
    },
    [userId],
  );

  const saveHome = useCallback(
    async (draft: HomeDraft) => {
      setSaving(true);
      setError("");
      if (!draft.location) {
        setError("Choose the home location before saving this listing.");
        setSaving(false);
        return false;
      }

      const supabase = createClient();
      const homeResult = await supabase
        .from("homes")
        .insert({
          owner_id: userId,
          title: draft.title.trim(),
          description: draft.description.trim(),
          city: draft.city.trim(),
          state: draft.state.trim(),
          country: draft.country.trim(),
          rent: Number(draft.rent),
          deposit: draft.deposit ? Number(draft.deposit) : null,
          bedrooms: Number(draft.bedrooms),
          bathrooms: Number(draft.bathrooms),
          available_from: draft.availableFrom,
          status: "draft",
        })
        .select()
        .single();

      if (homeResult.error || !homeResult.data) {
        setError(homeResult.error?.message ?? "Unable to save this home.");
        setSaving(false);
        return false;
      }

      const addressResult = await supabase.from("home_addresses").insert({
        home_id: homeResult.data.id,
        location: toPostgisPoint(draft.location),
        street: draft.street.trim() || null,
      });

      if (addressResult.error) {
        setError(addressResult.error.message);
        setSaving(false);
        return false;
      }

      await supabase
        .from("preferences")
        .update({ match_with_home_seekers: true })
        .eq("user_id", userId);

      setHomes((current) => [homeResult.data, ...current]);
      setStoredChoice("homeowner");
      setPreferences((current) =>
        current ? { ...current, match_with_home_seekers: true } : current,
      );
      setSaving(false);
      return true;
    },
    [userId],
  );

  return useMemo(
    () => ({
      profile,
      privateProfile,
      preferences,
      homes,
      homeChoice,
      profileComplete,
      preferencesComplete,
      gate,
      loading,
      saving,
      error,
      saveProfile,
      savePreferences,
      saveHomeChoice,
      saveHome,
      reload: load,
    }),
    [
      profile,
      privateProfile,
      preferences,
      homes,
      homeChoice,
      profileComplete,
      preferencesComplete,
      gate,
      loading,
      saving,
      error,
      saveProfile,
      savePreferences,
      saveHomeChoice,
      saveHome,
      load,
    ],
  );
}
