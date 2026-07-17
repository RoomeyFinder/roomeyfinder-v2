"use client";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export type Match = Database["public"]["Functions"]["get_matches"]["Returns"][number];

export async function getMatches(
  requestingProfileId: string,
  limit = 12,
  offset = 0,
): Promise<Match[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_matches", {
    requesting_profile_id: requestingProfileId,
    result_limit: limit,
    result_offset: offset,
  });

  if (error) throw error;

  return data ?? [];
}
