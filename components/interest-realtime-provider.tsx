"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { toast } from "react-toastify";

import { createClient } from "@/lib/supabase/client";
import type { Interest } from "@/types/schemas";

type InterestChange = {
  payload: RealtimePostgresChangesPayload<Interest>;
  receivedAt: number;
};

const InterestRealtimeContext = createContext<InterestChange | null>(null);

export function InterestRealtimeProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [latestChange, setLatestChange] = useState<InterestChange | null>(null);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ) {
      return;
    }

    const supabase = createClient();
    let mounted = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUserId(data.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const handleInterestChange = (payload: RealtimePostgresChangesPayload<Interest>) => {
      const nextInterest = payload.new as Interest;
      if (!nextInterest.id) return;

      setLatestChange({ payload, receivedAt: Date.now() });

      if (payload.eventType === "INSERT" && nextInterest.to_profile_id === userId) {
        toast.info("You have a new interest.");
      }

      if (
        payload.eventType === "UPDATE" &&
        nextInterest.from_profile_id === userId &&
        payload.old.status === "pending" &&
        (nextInterest.status === "accepted" || nextInterest.status === "declined")
      ) {
        if (nextInterest.status === "accepted") {
          toast.success("Your interest was accepted.");
        } else {
          toast.info("Your interest was declined.");
        }
      }
    };

    const channel = supabase
      .channel(`interests:${userId}:global`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interests",
          filter: `from_profile_id=eq.${userId}`,
        },
        handleInterestChange,
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interests",
          filter: `to_profile_id=eq.${userId}`,
        },
        handleInterestChange,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "interests",
          filter: `from_profile_id=eq.${userId}`,
        },
        handleInterestChange,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "interests",
          filter: `to_profile_id=eq.${userId}`,
        },
        handleInterestChange,
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Interest realtime subscription failed:", status);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <InterestRealtimeContext.Provider value={latestChange}>
      {children}
    </InterestRealtimeContext.Provider>
  );
}

export function useInterestRealtime() {
  return useContext(InterestRealtimeContext);
}
