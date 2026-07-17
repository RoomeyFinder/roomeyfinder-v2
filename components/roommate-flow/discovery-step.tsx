"use client";

import { Badge } from "@/components/ui/badge";
import { getAudienceDescription, getAudienceLabel, type HomeChoice } from "@/lib/roommate-flow";
import { UsersRound } from "lucide-react";
import { EmptyMatches } from "@/components/roommate-flow/empty-matches";
import { IncomingInterests } from "@/components/roommate-flow/incoming-interests";
import { MatchCard } from "@/components/roommate-flow/match-card";
import type { DiscoveryState } from "@/components/roommate-flow/types";

export function DiscoveryStep({ userId, choice, discovery }: { userId: string; choice: HomeChoice; discovery: DiscoveryState }) {
  const incoming = discovery.interests.filter((interest) => interest.to_profile_id === userId && interest.status === "pending");

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Your discovery</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">People who could make sense.</h2>
          <p className="mt-2 text-muted-foreground">{getAudienceDescription(choice)}</p>
        </div>
        <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1.5">
          <UsersRound className="h-3.5 w-3.5" /> {getAudienceLabel(choice)}
        </Badge>
      </div>
      {incoming.length > 0 ? <IncomingInterests interests={incoming} /> : null}{discovery.error ?
        <div className="mb-5 rounded-brand-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{discovery.error}</div> :
        null}
      {discovery.loading ? <LoadingMatches /> : discovery.matches.length > 0 ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{discovery.matches.map((match) => <MatchCard key={match.profile_id} match={match} userId={userId} discovery={discovery} />)}</div> : <EmptyMatches choice={choice} />}
    </div>
  );
}

function LoadingMatches() {
  return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><div className="h-72 animate-pulse rounded-brand-md bg-muted" /><div className="h-72 animate-pulse rounded-brand-md bg-muted" /><div className="h-72 animate-pulse rounded-brand-md bg-muted" /></div>;
}
