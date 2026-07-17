"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { InterestStatus, InterestWithProfile } from "@/lib/interests";

export type InterestDirection = "sent" | "received";
export type InterestSort = "desc" | "asc";

export function useInterestsView(interests: InterestWithProfile[], userId: string) {
  const [items, setItems] = useState(interests);
  const [direction, setDirection] = useState<InterestDirection>("sent");
  const [status, setStatus] = useState<InterestStatus | "all">("all");
  const [sort, setSort] = useState<InterestSort>("desc");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visibleInterests = useMemo(
    () =>
      items
        .filter((interest) =>
          direction === "sent"
            ? interest.from_profile_id === userId
            : interest.to_profile_id === userId,
        )
        .filter((interest) => status === "all" || interest.status === status)
        .sort((a, b) => {
          const difference =
            new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
          return sort === "asc" ? difference : -difference;
        }),
    [direction, items, sort, status, userId],
  );

  async function respondToInterest(id: string, nextStatus: "accepted" | "declined") {
    setWorkingId(id);
    setError("");
    const { error: updateError } = await createClient()
      .from("interests")
      .update({ status: nextStatus })
      .eq("id", id)
      .eq("to_profile_id", userId);

    if (updateError) setError("Unable to update this interest. Please try again.");
    else
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)),
      );
    setWorkingId(null);
  }

  return {
    direction,
    setDirection,
    status,
    setStatus,
    sort,
    setSort,
    visibleInterests,
    respondToInterest,
    workingId,
    error,
  };
}
