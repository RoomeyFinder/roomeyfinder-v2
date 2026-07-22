"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { getMatches, type Match } from "@/lib/matches";
import { getAge } from "@/lib/profile-validation";
import type { Interest, ProfileContact } from "@/types/schemas";

export function useDiscovery(userId: string, enabled: boolean) {
  const pageSize = 12;
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentAge, setCurrentAge] = useState<number | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [contacts, setContacts] = useState<Record<string, ProfileContact>>({});
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    const supabase = createClient();

    try {
      const [matchData, outgoing, incoming, privateProfile] = await Promise.all([
        getMatches(userId, pageSize, 0),
        supabase.from("interests").select("*").eq("from_profile_id", userId),
        supabase.from("interests").select("*").eq("to_profile_id", userId),
        supabase
          .from("profile_private")
          .select("date_of_birth")
          .eq("profile_id", userId)
          .maybeSingle(),
      ]);

      const interestData = [...(outgoing.data ?? []), ...(incoming.data ?? [])];
      const acceptedIds = interestData
        .filter((interest) => interest.status === "accepted")
        .map((interest) =>
          interest.from_profile_id === userId ? interest.to_profile_id : interest.from_profile_id,
        );
      const uniqueAcceptedIds = [...new Set(acceptedIds)];
      const contactResult = uniqueAcceptedIds.length
        ? await supabase.from("profile_contacts").select("*").in("profile_id", uniqueAcceptedIds)
        : { data: [], error: null };

      if (outgoing.error || incoming.error || privateProfile.error || contactResult.error) {
        throw outgoing.error ?? incoming.error ?? privateProfile.error ?? contactResult.error;
      }

      setMatches(matchData);
      setCurrentAge(
        privateProfile.data?.date_of_birth ? getAge(privateProfile.data.date_of_birth) : null,
      );
      setHasMore(matchData.length === pageSize);
      setInterests(interestData);
      setContacts(
        Object.fromEntries(
          (contactResult.data ?? []).map((contact) => [contact.profile_id, contact]),
        ),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load matches.");
    } finally {
      setLoading(false);
    }
  }, [enabled, userId]);

  const loadMore = useCallback(async () => {
    if (!enabled || loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const nextMatches = await getMatches(userId, pageSize, matches.length);
      setMatches((current) => [...current, ...nextMatches]);
      setHasMore(nextMatches.length === pageSize);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load more matches.");
    } finally {
      setLoadingMore(false);
    }
  }, [enabled, hasMore, loading, loadingMore, matches.length, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const interestFor = useCallback(
    (candidateId: string) =>
      interests.find(
        (interest) =>
          (interest.from_profile_id === userId && interest.to_profile_id === candidateId) ||
          (interest.to_profile_id === userId && interest.from_profile_id === candidateId),
      ),
    [interests, userId],
  );

  const showInterest = useCallback(
    async (candidateId: string) => {
      setWorkingId(candidateId);
      setError("");
      const supabase = createClient();
      try {
        const result = await supabase
          .from("interests")
          .insert({
            from_profile_id: userId,
            to_profile_id: candidateId,
            status: "pending",
          })
          .select()
          .single();
        if (result.error) throw result.error;

        // Keep the existing match cards in place and update only this card's
        // interest state instead of reloading the entire discovery view.
        setInterests((current) => [...current, result.data]);
      } catch (interestError) {
        setError(
          interestError instanceof Error
            ? interestError.message
            : "Unable to send interest. Please try again.",
        );
      } finally {
        setWorkingId(null);
      }
    },
    [userId],
  );

  const respondToInterest = useCallback(
    async (interestId: string, status: "accepted" | "declined") => {
      setWorkingId(interestId);
      setError("");
      const supabase = createClient();
      const result = await supabase
        .from("interests")
        .update({ status })
        .eq("id", interestId)
        .eq("to_profile_id", userId);
      if (result.error) setError(result.error.message);
      else await load();
      setWorkingId(null);
    },
    [load, userId],
  );

  return useMemo(
    () => ({
      matches,
      currentAge,
      interests,
      contacts,
      loading,
      loadingMore,
      hasMore,
      error,
      workingId,
      interestFor,
      showInterest,
      respondToInterest,
      reload: load,
      loadMore,
    }),
    [
      matches,
      currentAge,
      interests,
      contacts,
      loading,
      loadingMore,
      hasMore,
      error,
      workingId,
      interestFor,
      showInterest,
      respondToInterest,
      load,
      loadMore,
    ],
  );
}
