import type { Home, Preference, Profile, ProfileContact, ProfilePrivate } from "@/types/schemas";
import type { LocationSelection } from "@/lib/location";

export type HomeChoice = "homeowner" | "seeker" | "team_up";
export type FlowGate = "profile" | "preferences" | "home" | "discover";

export type ProfileDraft = {
  firstName: string;
  lastName: string;
  contactPhone: string;
  username: string;
  birthDate: string;
  gender: "male" | "female" | "non_binary" | "prefer_not_to_say";
  lifestyleTags: string[];
  location: LocationSelection | null;
  profilePhoto: File | null;
};

export type ProfilePhotoDraft = {
  id: string;
  storagePath: string;
  previewUrl: string | null;
};

export type PreferenceDraft = {
  budgetMin: string;
  budgetMax: string;
  maxDistanceMiles: string;
  moveInFrom: string;
  moveInTo: string;
  smokingPreference: "yes" | "no" | "outside_only";
  petsPreference: "yes" | "no" | "depends";
};

export type HomeDraft = {
  id?: string;
  title: string;
  description: string;
  city: string;
  state: string;
  country: string;
  street: string;
  rent: string;
  deposit: string;
  bedrooms: string;
  bathrooms: string;
  availableFrom: string;
  location: LocationSelection | null;
  photos: File[];
};

export type HomeAddressDraft = {
  street: string;
  location: LocationSelection | null;
};

export type HomePhotoDraft = {
  id: string;
  storagePath: string;
  position: number;
  isPrimary: boolean;
  previewUrl: string | null;
};

export function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validatePreferenceDraft(draft: PreferenceDraft) {
  const budgetMin = Number(draft.budgetMin);
  const budgetMax = Number(draft.budgetMax);
  const maxDistanceMiles = Number(draft.maxDistanceMiles);

  if (
    !Number.isFinite(budgetMin) ||
    !Number.isFinite(budgetMax) ||
    budgetMin < 0 ||
    budgetMax < 0 ||
    budgetMin > budgetMax
  ) {
    return "Enter a valid budget range where the minimum is no greater than the maximum.";
  }

  if (!Number.isFinite(maxDistanceMiles) || maxDistanceMiles <= 0) {
    return "Enter a search radius greater than zero.";
  }

  const today = getTodayDate();
  if (draft.moveInFrom < today || draft.moveInTo < today) {
    return "Move-in dates must be today or later.";
  }

  if (draft.moveInFrom > draft.moveInTo) {
    return "Move-in from must be on or before move-in by.";
  }

  return null;
}

export function isProfileComplete(
  profile: Profile | null,
  privateProfile: ProfilePrivate | null,
  profileContact: ProfileContact | null,
) {
  return Boolean(
    profile?.username &&
    profile.first_name &&
    profile.gender &&
    profile.bio &&
    privateProfile?.date_of_birth &&
    privateProfile.location &&
    profileContact?.contact_phone,
  );
}

export function isPreferencesComplete(preferences: Preference | null) {
  const today = getTodayDate();

  return Boolean(
    preferences?.budget_min != null &&
    preferences.budget_max != null &&
    preferences.max_distance_miles != null &&
    preferences.move_in_from &&
    preferences.move_in_to &&
    preferences.move_in_from >= today &&
    preferences.move_in_to >= today &&
    preferences.move_in_from <= preferences.move_in_to &&
    preferences.smoking_preference &&
    preferences.pets_preference,
  );
}

export function getFlowGate({
  profileComplete,
  preferencesComplete,
  homeChoice,
}: {
  profileComplete: boolean;
  preferencesComplete: boolean;
  homeChoice: HomeChoice | null;
}): FlowGate {
  if (!profileComplete) return "profile";
  if (!preferencesComplete) return "preferences";
  if (!homeChoice) return "home";
  return "discover";
}

export function getHomeChoice(homes: Home[], storedChoice?: HomeChoice | null) {
  if (homes.some((home) => home.status === "active")) return "homeowner" as const;
  if (storedChoice) return storedChoice;
  if (homes.some((home) => home.status === "draft")) return "homeowner" as const;
  return null;
}

export function getAudienceLabel(choice: HomeChoice) {
  if (choice === "homeowner") return "Room seekers looking for a home";
  if (choice === "team_up") return "Homeowners and house-hunting teammates";
  return "Homeowners with a room available";
}

export function getAudienceDescription(choice: HomeChoice) {
  if (choice === "homeowner") {
    return "Your matches are people who need a room in a home like yours.";
  }
  if (choice === "team_up") {
    return "You can match with available rooms and people who want to team up to find one.";
  }
  return "You will only see people who already have a room available.";
}
