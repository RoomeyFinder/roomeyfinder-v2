"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function InterestButton({
  viewerId,
  profileId,
  interestId,
  initialStatus,
  isIncoming,
}: {
  viewerId: string;
  profileId: string;
  interestId: string | null;
  initialStatus: "pending" | "accepted" | "declined" | null;
  isIncoming: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function sendInterest() {
    setSending(true);
    setError("");
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("interests")
      .insert({ from_profile_id: viewerId, to_profile_id: profileId, status: "pending" })
      .select("status")
      .single();

    if (insertError) {
      setError("Couldn’t send interest. Please try again.");
    } else {
      setStatus(data.status);
    }
    setSending(false);
  }

  async function respond(nextStatus: "accepted" | "declined") {
    if (!interestId) return;
    setSending(true);
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("interests")
      .update({ status: nextStatus })
      .eq("id", interestId)
      .eq("to_profile_id", viewerId);

    if (updateError) {
      setError("Couldn’t update this interest. Please try again.");
    } else {
      setStatus(nextStatus);
      if (nextStatus === "accepted") router.refresh();
    }
    setSending(false);
  }

  if (status === "accepted") {
    return (
      <Button
        variant="outline"
        // disabled
        size="sm"
        className="bg-whiite/30 pointer-events-none border-roomey-green-100 text-roomey-green-main"
      >
        <CheckCircle2 /> Connected
      </Button>
    );
  }
  if (status === "pending") {
    if (isIncoming) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex justify-start gap-2">
            <Button
              className="shrink-0"
              onClick={() => void respond("accepted")}
              disabled={sending}
            >
              {sending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Accept
            </Button>
            <Button
              className="shrink-0"
              variant="outline"
              onClick={() => void respond("declined")}
              disabled={sending}
            >
              Decline
            </Button>
          </div>
          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      );
    }
    return (
      <Button variant="outline" disabled>
        {isIncoming ? "Interest received" : "Interest sent"}
      </Button>
    );
  }
  if (status === "declined") {
    return (
      <Button variant="outline" disabled>
        Interest declined
      </Button>
    );
  }
  if (isIncoming)
    return (
      <Button variant="outline" disabled>
        Interest received
      </Button>
    );

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={() => void sendInterest()} disabled={sending}>
        {sending ? (
          <>
            <Loader2 className="animate-spin" /> Sending interest…
          </>
        ) : (
          <>
            <Send /> Send interest
          </>
        )}
      </Button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
