"use client";

import { createClient } from "@/lib/supabase/client";

export type Match = {
  profile_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  gender: "male" | "female" | "non_binary" | "prefer_not_to_say" | null;
  home_id: string | null;
  home_title: string | null;
  home_city: string | null;
  home_state: string | null;
  home_rent: number | null;
  home_bedrooms: number | null;
  home_bathrooms: number | null;
  home_available_from: string | null;
  candidate_age: number | null;
  budget_overlap: boolean | null;
  budget_overlap_min: number | null;
  budget_overlap_max: number | null;
  age_in_range: boolean | null;
  preferred_gender_match: boolean | null;
  smoking_preference_match: boolean | null;
  pets_preference_match: boolean | null;
  move_in_window_overlap: boolean | null;
  move_in_overlap_from: string | null;
  move_in_overlap_to: string | null;
  distance_within_range: boolean | null;
  distance_miles: number | null;
  compatibility_percentage: number;
  is_fallback: boolean;
};

export async function getMatches(requestingProfileId: string): Promise<Match[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_matches", {
    requesting_profile_id: requestingProfileId,
  });

  if (error) throw error;

  return (data ?? []) as Match[];
}
