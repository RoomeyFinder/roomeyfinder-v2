"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
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

type Coordinates = { latitude: number; longitude: number };

export function useOnboardingFlow(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [privateProfile, setPrivateProfile] = useState<ProfilePrivate | null>(null);
  const [preferences, setPreferences] = useState<Preference | null>(null);
  const [homes, setHomes] = useState<Home[]>([]);
  const [storedChoice, setStoredChoice] = useState<HomeChoice | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");

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

  const requestLocation = useCallback(() => {
    return new Promise<Coordinates | null>((resolve) => {
      if (!navigator.geolocation) {
        setLocationError("Location is not available in this browser.");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const next = { latitude: coords.latitude, longitude: coords.longitude };
          setCoordinates(next);
          setLocationError("");
          resolve(next);
        },
        () => {
          setLocationError("Allow location access so we can find matches near you.");
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000 },
      );
    });
  }, []);

  const saveProfile = useCallback(
    async (draft: ProfileDraft) => {
      setSaving(true);
      setError("");
      const supabase = createClient();
      let nextCoordinates = coordinates;

      if (!nextCoordinates && !privateProfile?.location) {
        nextCoordinates = await requestLocation();
      }

      if (!nextCoordinates && !privateProfile?.location) {
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

      const location = nextCoordinates
        ? `SRID=4326;POINT(${nextCoordinates.longitude} ${nextCoordinates.latitude})`
        : privateProfile?.location;
      const privateResult = await supabase
        .from("profile_private")
        .upsert(
          {
            profile_id: userId,
            last_name: draft.lastName.trim() || null,
            date_of_birth: draft.birthDate,
            ...(location ? { location } : {}),
          },
          { onConflict: "profile_id" },
        )
        .select()
        .single();

      if (profileResult.error || privateResult.error) {
        setError(profileResult.error?.message ?? privateResult.error?.message ?? "Unable to save your profile.");
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
    [coordinates, privateProfile?.location, requestLocation, userId],
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
      locationError,
      locationReady: Boolean(coordinates || privateProfile?.location),
      requestLocation,
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
      locationError,
      coordinates,
      requestLocation,
      saveProfile,
      savePreferences,
      saveHomeChoice,
      saveHome,
      load,
    ],
  );
}
