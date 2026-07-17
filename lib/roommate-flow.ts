import type { Home, Preference, Profile, ProfilePrivate } from "@/types/schemas";

export type HomeChoice = "homeowner" | "seeker" | "team_up";
export type FlowGate = "profile" | "preferences" | "home" | "discover";

export type ProfileDraft = {
  firstName: string;
  lastName: string;
  username: string;
  birthDate: string;
  gender: "male" | "female" | "non_binary" | "prefer_not_to_say";
  lifestyleTags: string[];
  city: string;
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
};

export function isProfileComplete(
  profile: Profile | null,
  privateProfile: ProfilePrivate | null,
) {
  return Boolean(
    profile?.username &&
      profile.first_name &&
      profile.gender &&
      profile.bio &&
      privateProfile?.date_of_birth &&
      privateProfile.location,
  );
}

export function isPreferencesComplete(preferences: Preference | null) {
  return Boolean(
    preferences?.budget_min != null &&
      preferences.budget_max != null &&
      preferences.max_distance_miles != null &&
      preferences.move_in_from &&
      preferences.move_in_to &&
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
  if (homes.length > 0) return "homeowner" as const;
  return storedChoice ?? null;
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
