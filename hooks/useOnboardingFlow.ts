"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { MAX_HOME_PHOTOS } from "@/components/roommate-flow/constants";
import { fromPostgisPoint, toPostgisPoint, type LocationSelection } from "@/lib/location";
import { getUserFacingDatabaseError } from "@/lib/user-facing-errors";
import {
  getFlowGate,
  getHomeChoice,
  isPreferencesComplete,
  isProfileComplete,
  validatePreferenceDraft,
  type HomeChoice,
  type HomeAddressDraft,
  type HomeDraft,
  type HomePhotoDraft,
  type PreferenceDraft,
  type ProfilePhotoDraft,
  type ProfileDraft,
} from "@/lib/roommate-flow";
import type { Home, Preference, Profile, ProfileContact, ProfilePrivate } from "@/types/schemas";

export function useOnboardingFlow(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [privateProfile, setPrivateProfile] = useState<ProfilePrivate | null>(null);
  const [profileContact, setProfileContact] = useState<ProfileContact | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<ProfilePhotoDraft | null>(null);
  const [preferences, setPreferences] = useState<Preference | null>(null);
  const [homes, setHomes] = useState<Home[]>([]);
  const [homeAddresses, setHomeAddresses] = useState<Record<string, HomeAddressDraft>>({});
  const [homePhotos, setHomePhotos] = useState<Record<string, HomePhotoDraft[]>>({});
  const [storedChoice, setStoredChoice] = useState<HomeChoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();

    const [
      profileResult,
      privateResult,
      contactResult,
      preferenceResult,
      homesResult,
      profilePhotoResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("profile_private").select("*").eq("profile_id", userId).maybeSingle(),
      supabase.from("profile_contacts").select("*").eq("profile_id", userId).maybeSingle(),
      supabase.from("preferences").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("homes")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("profile_photos")
        .select("id, storage_path, position, is_primary")
        .eq("user_id", userId)
        .order("is_primary", { ascending: false })
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    const homeIds = (homesResult.data ?? []).map((home) => home.id);
    const [homeAddressesResult, homePhotosResult] =
      homeIds.length > 0
        ? await Promise.all([
            supabase
              .from("home_addresses")
              .select("home_id, street, location")
              .in("home_id", homeIds),
            supabase
              .from("home_photos")
              .select("id, home_id, storage_path, position, is_primary")
              .in("home_id", homeIds)
              .order("position", { ascending: true }),
          ])
        : [
            { data: [], error: null },
            { data: [], error: null },
          ];

    const failed = [
      profileResult.error,
      privateResult.error,
      contactResult.error,
      preferenceResult.error,
      homesResult.error,
      profilePhotoResult.error,
      homeAddressesResult.error,
      homePhotosResult.error,
    ].find(Boolean);

    if (failed) setError(failed.message);
    setProfile(profileResult.data);
    setPrivateProfile(privateResult.data);
    setProfileContact(contactResult.data);
    const profilePhotoUrl = profilePhotoResult.data
      ? await supabase.storage
          .from("profile-photos")
          .createSignedUrl(profilePhotoResult.data.storage_path, 60 * 60)
      : null;
    setProfilePhoto(
      profilePhotoResult.data
        ? {
            id: profilePhotoResult.data.id,
            storagePath: profilePhotoResult.data.storage_path,
            previewUrl: profilePhotoUrl?.data?.signedUrl ?? null,
          }
        : null,
    );
    setPreferences(preferenceResult.data);
    setHomes(homesResult.data ?? []);
    const homeById = new Map((homesResult.data ?? []).map((home) => [home.id, home]));
    setHomeAddresses(
      Object.fromEntries(
        (homeAddressesResult.data ?? []).map((address) => {
          const home = homeById.get(address.home_id);
          const coordinates = fromPostgisPoint(address.location);
          const location: LocationSelection | null = coordinates
            ? {
                ...coordinates,
                label:
                  [home?.city, home?.state].filter(Boolean).join(", ") || "Saved home location",
              }
            : null;
          return [address.home_id, { street: address.street ?? "", location }];
        }),
      ),
    );
    const photoEntries = await Promise.all(
      (homePhotosResult.data ?? []).map(async (photo) => {
        const signedUrlResult = await supabase.storage
          .from("home-photos")
          .createSignedUrl(photo.storage_path, 60 * 60);
        return [
          photo.home_id,
          {
            id: photo.id,
            storagePath: photo.storage_path,
            position: photo.position,
            isPrimary: photo.is_primary,
            previewUrl: signedUrlResult.data?.signedUrl ?? null,
          } satisfies HomePhotoDraft,
        ] as const;
      }),
    );
    const photosByHomeId: Record<string, HomePhotoDraft[]> = {};
    for (const [homeId, photo] of photoEntries) {
      photosByHomeId[homeId] = [...(photosByHomeId[homeId] ?? []), photo];
    }
    setHomePhotos(photosByHomeId);

    if (typeof window !== "undefined" && isPreferencesComplete(preferenceResult.data)) {
      const saved = window.localStorage.getItem(`roomey-home-choice-${userId}`);
      if (saved === "homeowner" || saved === "seeker" || saved === "team_up") {
        setStoredChoice(saved);
      }
    } else if (typeof window !== "undefined") {
      window.localStorage.removeItem(`roomey-home-choice-${userId}`);
      setStoredChoice(null);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const profileComplete = isProfileComplete(profile, privateProfile, profileContact);
  const preferencesComplete = isPreferencesComplete(preferences);
  const homeChoice = getHomeChoice(homes, storedChoice);
  const gate = getFlowGate({ profileComplete, preferencesComplete, homeChoice });

  const saveProfile = useCallback(
    async (draft: ProfileDraft) => {
      setSaving(true);
      setError("");
      const supabase = createClient();
      const location = draft.location ? toPostgisPoint(draft.location) : privateProfile?.location;

      if (!location) {
        setError("Choose an area or use your current location before continuing.");
        setSaving(false);
        return false;
      }

      if (!draft.contactPhone.trim()) {
        setError("Add a phone number before continuing.");
        setSaving(false);
        return false;
      }

      const { data: authUserResult, error: authUserError } = await supabase.auth.getUser();
      if (authUserError || !authUserResult.user) {
        setError("Unable to verify your account details. Please try again.");
        setSaving(false);
        return false;
      }

      const profileResult = await supabase
        .from("profiles")
        .update({
          first_name: draft.firstName.trim(),
          username: draft.username.trim().toLowerCase(),
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

      const contactResult = await supabase
        .from("profile_contacts")
        .upsert(
          {
            profile_id: userId,
            contact_phone: draft.contactPhone.trim(),
            contact_email: authUserResult.user.email ?? null,
          },
          { onConflict: "profile_id" },
        )
        .select()
        .single();

      if (contactResult.error) {
        setError(
          getUserFacingDatabaseError(contactResult.error, "Unable to save your contact details."),
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

      if (draft.profilePhoto) {
        const currentPhotoResult = await supabase
          .from("profile_photos")
          .select("id, storage_path")
          .eq("user_id", userId)
          .order("is_primary", { ascending: false })
          .order("position", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (currentPhotoResult.error) {
          setError(currentPhotoResult.error.message);
          setSaving(false);
          return false;
        }

        const safeName = draft.profilePhoto.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const storagePath = `${userId}/${crypto.randomUUID()}-${safeName}`;
        const uploadResult = await supabase.storage
          .from("profile-photos")
          .upload(storagePath, draft.profilePhoto, {
            contentType: draft.profilePhoto.type,
            upsert: false,
          });
        if (uploadResult.error) {
          setError(uploadResult.error.message);
          setSaving(false);
          return false;
        }

        const savedPhotoResult = currentPhotoResult.data
          ? await supabase
              .from("profile_photos")
              .update({ storage_path: storagePath, position: 0, is_primary: true })
              .eq("id", currentPhotoResult.data.id)
              .eq("user_id", userId)
              .select()
              .single()
          : await supabase
              .from("profile_photos")
              .insert({ user_id: userId, storage_path: storagePath, position: 0, is_primary: true })
              .select()
              .single();

        if (savedPhotoResult.error || !savedPhotoResult.data) {
          await supabase.storage.from("profile-photos").remove([storagePath]);
          setError(savedPhotoResult.error?.message ?? "Unable to save your profile photo.");
          setSaving(false);
          return false;
        }

        if (currentPhotoResult.data?.storage_path) {
          await supabase.storage
            .from("profile-photos")
            .remove([currentPhotoResult.data.storage_path]);
        }

        setProfilePhoto({ id: savedPhotoResult.data.id, storagePath, previewUrl: null });
      }

      setProfile(activationResult.data);
      setPrivateProfile(privateResult.data);
      setProfileContact(contactResult.data);
      setSaving(false);
      return true;
    },
    [privateProfile?.location, userId],
  );

  const savePreferences = useCallback(
    async (draft: PreferenceDraft) => {
      setSaving(true);
      setError("");
      const hadCompletePreferences = isPreferencesComplete(preferences);
      const validationError = validatePreferenceDraft(draft);
      if (validationError) {
        setError(validationError);
        setSaving(false);
        return false;
      }
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
        setError(getUserFacingDatabaseError(result.error, "Unable to save your preferences."));
        setSaving(false);
        return false;
      }
      setPreferences(result.data);
      if (!hadCompletePreferences) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(`roomey-home-choice-${userId}`);
        }
        setStoredChoice(null);
      }
      setSaving(false);
      return true;
    },
    [preferences, userId],
  );

  const saveHomeChoice = useCallback(
    async (choice: Exclude<HomeChoice, "homeowner">) => {
      setSaving(true);
      setError("");
      const supabase = createClient();
      const archiveResult = await supabase
        .from("homes")
        .update({ status: "archived" })
        .eq("owner_id", userId)
        .eq("status", "active");

      if (archiveResult.error) {
        setError(archiveResult.error.message);
        setSaving(false);
        return false;
      }

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
      setHomes((current) =>
        current.map((home) => (home.status === "active" ? { ...home, status: "archived" } : home)),
      );
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
      const homeValues = {
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
      };
      const homeResult = draft.id
        ? await supabase
            .from("homes")
            .update(homeValues)
            .eq("id", draft.id)
            .eq("owner_id", userId)
            .select()
            .single()
        : await supabase
            .from("homes")
            .insert({ ...homeValues, owner_id: userId, status: "draft" })
            .select()
            .single();

      if (homeResult.error || !homeResult.data) {
        setError(homeResult.error?.message ?? "Unable to save this home.");
        setSaving(false);
        return false;
      }

      const addressResult = await supabase.from("home_addresses").upsert(
        {
          home_id: homeResult.data.id,
          location: toPostgisPoint(draft.location),
          street: draft.street.trim() || null,
        },
        { onConflict: "home_id" },
      );

      if (addressResult.error) {
        setError(addressResult.error.message);
        setSaving(false);
        return false;
      }

      const existingPhotosResult = await supabase
        .from("home_photos")
        .select("id, is_primary, position")
        .eq("home_id", homeResult.data.id)
        .order("position", { ascending: true });

      if (existingPhotosResult.error) {
        setError(existingPhotosResult.error.message);
        setSaving(false);
        return false;
      }

      if ((existingPhotosResult.data?.length ?? 0) + draft.photos.length > MAX_HOME_PHOTOS) {
        setError(`A home can have a maximum of ${MAX_HOME_PHOTOS} photos.`);
        setSaving(false);
        return false;
      }

      for (const [index, photo] of draft.photos.entries()) {
        const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${userId}/${homeResult.data.id}/${crypto.randomUUID()}-${safeName}`;
        const uploadResult = await supabase.storage
          .from("home-photos")
          .upload(path, photo, { contentType: photo.type, upsert: false });
        if (uploadResult.error) {
          setError(uploadResult.error.message);
          setSaving(false);
          return false;
        }
        const photoResult = await supabase.from("home_photos").insert({
          home_id: homeResult.data.id,
          storage_path: path,
          position: (existingPhotosResult.data?.length ?? 0) + index,
          is_primary:
            !(existingPhotosResult.data ?? []).some((existing) => existing.is_primary) &&
            index === 0,
        });
        if (photoResult.error) {
          setError(photoResult.error.message);
          setSaving(false);
          return false;
        }
      }

      const activationResult =
        homeResult.data.status === "active"
          ? { data: homeResult.data, error: null }
          : await supabase
              .from("homes")
              .update({ status: "active" })
              .eq("id", homeResult.data.id)
              .select()
              .single();

      if (activationResult.error || !activationResult.data) {
        setError(
          getUserFacingDatabaseError(
            activationResult.error,
            "Complete the listing and add a primary photo before publishing it.",
          ),
        );
        setSaving(false);
        return false;
      }

      const preferenceResult = await supabase
        .from("preferences")
        .update({ match_with_home_seekers: false })
        .eq("user_id", userId)
        .select()
        .single();

      if (preferenceResult.error) {
        setError(preferenceResult.error.message);
        setSaving(false);
        return false;
      }

      setHomes((current) => [
        activationResult.data,
        ...current
          .filter((home) => home.id !== activationResult.data.id)
          .map((home) =>
            home.status === "active" ? { ...home, status: "archived" as const } : home,
          ),
      ]);
      setHomeAddresses((current) => ({
        ...current,
        [activationResult.data.id]: { street: draft.street.trim(), location: draft.location },
      }));
      setStoredChoice("homeowner");
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`roomey-home-choice-${userId}`, "homeowner");
      }
      setPreferences((current) =>
        current ? { ...current, match_with_home_seekers: false } : preferenceResult.data,
      );
      setSaving(false);
      return true;
    },
    [userId],
  );

  const deleteHomePhoto = useCallback(
    async (homeId: string, photo: HomePhotoDraft) => {
      setSaving(true);
      setError("");
      const supabase = createClient();
      const photosResult = await supabase
        .from("home_photos")
        .select("id, is_primary")
        .eq("home_id", homeId)
        .order("position", { ascending: true });

      if (photosResult.error) {
        setError(photosResult.error.message);
        setSaving(false);
        return false;
      }

      const replacement = photo.isPrimary
        ? photosResult.data.find((candidate) => candidate.id !== photo.id)
        : null;
      const home = homes.find((candidate) => candidate.id === homeId);
      if (photo.isPrimary && !replacement && home?.status === "active") {
        setError("Keep at least one home photo. Add a replacement before deleting this one.");
        setSaving(false);
        return false;
      }

      if (replacement) {
        const replacementResult = await supabase
          .from("home_photos")
          .update({ is_primary: true })
          .eq("id", replacement.id)
          .eq("home_id", homeId);
        if (replacementResult.error) {
          setError(replacementResult.error.message);
          setSaving(false);
          return false;
        }
      }

      const storageResult = await supabase.storage.from("home-photos").remove([photo.storagePath]);
      if (storageResult.error) {
        setError(storageResult.error.message);
        setSaving(false);
        return false;
      }

      const deleteResult = await supabase
        .from("home_photos")
        .delete()
        .eq("id", photo.id)
        .eq("home_id", homeId);
      if (deleteResult.error) {
        setError(deleteResult.error.message);
        setSaving(false);
        return false;
      }

      setHomePhotos((current) => ({
        ...current,
        [homeId]: (current[homeId] ?? [])
          .filter((currentPhoto) => currentPhoto.id !== photo.id)
          .map((currentPhoto) =>
            replacement && currentPhoto.id === replacement.id
              ? { ...currentPhoto, isPrimary: true }
              : currentPhoto,
          ),
      }));
      setSaving(false);
      return true;
    },
    [homes],
  );

  return useMemo(
    () => ({
      profile,
      privateProfile,
      profileContact,
      profilePhoto,
      preferences,
      homes,
      homeAddresses,
      homePhotos,
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
      deleteHomePhoto,
      reload: load,
    }),
    [
      profile,
      privateProfile,
      profileContact,
      profilePhoto,
      preferences,
      homes,
      homeAddresses,
      homePhotos,
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
      deleteHomePhoto,
      load,
    ],
  );
}
