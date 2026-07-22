"use client";

import { Badge } from "@/components/ui/badge";
import { getAudienceDescription, getAudienceLabel, type HomeChoice } from "@/lib/roommate-flow";
import { Settings2, UsersRound } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyMatches } from "@/components/roommate-flow/empty-matches";
import { IncomingInterests } from "@/components/roommate-flow/incoming-interests";
import { MatchCard } from "@/components/roommate-flow/match-card";
import type { DiscoveryState } from "@/components/roommate-flow/types";
import Link from "next/link";

export function DiscoveryStep({
  userId,
  choice,
  discovery,
}: {
  userId: string;
  choice: HomeChoice;
  discovery: DiscoveryState;
}) {
  const incoming = discovery.interests.filter(
    (interest) => interest.to_profile_id === userId && interest.status === "pending",
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-20 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            Your discovery
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            People who could make sense. <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1.5">
              <UsersRound className="h-3.5 w-3.5" /> {getAudienceLabel(choice)}
            </Badge>
          </h2>
          <p className="mt-2 text-muted-foreground">{getAudienceDescription(choice)}</p>

        </div>
        <div className="self-start">
          <Button asChild variant="outline" size="sm">
            <Link href="/setup?step=preferences&returnTo=%2Fmatches">
              <Settings2 /> Update preferences
            </Link>
          </Button>
        </div>
      </div>
      {incoming.length > 0 ? <IncomingInterests interests={incoming} /> : null}
      {discovery.error ? (
        <div className="mb-5 rounded-brand-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {discovery.error}
        </div>
      ) : null}
      {discovery.loading ? (
        <LoadingMatches />
      ) : discovery.matches.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {discovery.matches.map((match) => (
            <MatchCard key={match.profile_id} match={match} userId={userId} discovery={discovery} />
          ))}
          {discovery.hasMore ? (
            <div className="col-span-full flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => void discovery.loadMore()}
                disabled={discovery.loadingMore}
              >
                {discovery.loadingMore ? (
                  <>
                    <Loader2 className="animate-spin" /> Loading more matches…
                  </>
                ) : (
                  "Load more matches"
                )}
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyMatches choice={choice} />
      )}
    </div>
  );
}

function LoadingMatches() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <div className="h-72 animate-pulse rounded-brand-md bg-muted" />
      <div className="h-72 animate-pulse rounded-brand-md bg-muted" />
      <div className="h-72 animate-pulse rounded-brand-md bg-muted" />
    </div>
  );
}
