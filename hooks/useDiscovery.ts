"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { getMatches, type Match } from "@/lib/matches";
import type { Interest, ProfileContact } from "@/types/schemas";

export function useDiscovery(userId: string, enabled: boolean) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [contacts, setContacts] = useState<Record<string, ProfileContact>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    const supabase = createClient();

    try {
      const [matchData, outgoing, incoming] = await Promise.all([
        getMatches(userId),
        supabase.from("interests").select("*").eq("from_profile_id", userId),
        supabase.from("interests").select("*").eq("to_profile_id", userId),
      ]);

      const interestData = [...(outgoing.data ?? []), ...(incoming.data ?? [])];
      const acceptedIds = interestData
        .filter((interest) => interest.status === "accepted")
        .map((interest) =>
          interest.from_profile_id === userId
            ? interest.to_profile_id
            : interest.from_profile_id,
        );
      const uniqueAcceptedIds = [...new Set(acceptedIds)];
      const contactResult = uniqueAcceptedIds.length
        ? await supabase
            .from("profile_contacts")
            .select("*")
            .in("profile_id", uniqueAcceptedIds)
        : { data: [], error: null };

      if (outgoing.error || incoming.error || contactResult.error) {
        throw outgoing.error ?? incoming.error ?? contactResult.error;
      }

      setMatches(matchData);
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
      const result = await supabase.from("interests").insert({
        from_profile_id: userId,
        to_profile_id: candidateId,
        status: "pending",
      });
      if (result.error) setError(result.error.message);
      else await load();
      setWorkingId(null);
    },
    [load, userId],
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
    () => ({ matches, interests, contacts, loading, error, workingId, interestFor, showInterest, respondToInterest, reload: load }),
    [matches, interests, contacts, loading, error, workingId, interestFor, showInterest, respondToInterest, load],
  );
}
