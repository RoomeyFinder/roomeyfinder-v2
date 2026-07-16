"use client";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export type Match =
  Database["public"]["Functions"]["get_matches"]["Returns"][number];

export async function getMatches(requestingProfileId: string): Promise<Match[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_matches", {
    requesting_profile_id: requestingProfileId,
  });

  if (error) throw error;

  return data ?? [];
}
