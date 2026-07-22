"use client";

import {
  ArrowRight,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NoteLine } from "@/components/roommate-flow/shared";
import type { DiscoveryState } from "@/components/roommate-flow/types";
import Link from "next/link";

export function MatchCard({
  match,
  userId,
  discovery,
}: {
  match: DiscoveryState["matches"][number];
  userId: string;
  discovery: DiscoveryState;
}) {
  const interest = discovery.interestFor(match.profile_id);
  const contact = discovery.contacts[match.profile_id];
  const incoming = interest?.to_profile_id === userId && interest.status === "pending";
  const accepted = interest?.status === "accepted";
  const score = match.compatibility_percentage ?? 0;
  const sending = discovery.workingId === match.profile_id;
  const ageDifference =
    discovery.currentAge !== null && match.candidate_age !== null
      ? match.candidate_age - discovery.currentAge
      : null;
  const ageDifferenceLabel =
    ageDifference === null
      ? null
      : ageDifference === 0
        ? "Same age as you"
        : `${Math.abs(ageDifference)} year${Math.abs(ageDifference) === 1 ? "" : "s"} ${ageDifference > 0 ? "older" : "younger"} than you`;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-brand to-brand/30" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">
              <Link href={`/${match.username}`} className="hover:text-primary hover:underline">
                {match.username ? `@${match.username}` : "A potential match"}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {match.home_city ?? "Near your preferred area"}
            </CardDescription>
          </div>
          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-secondary text-brand">
            <span className="text-lg font-semibold">{score}%</span>
            <span className="text-[9px] uppercase tracking-wide">fit</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex flex-wrap gap-2">
          {match.home_id ? (
            <Badge variant="outline">
              <Home className="mr-1 h-3 w-3" /> Home available
            </Badge>
          ) : (
            <Badge variant="outline">
              <Users className="mr-1 h-3 w-3" /> House-hunting
            </Badge>
          )}
          {match.home_rent ? (
            <Badge variant="outline">₦{match.home_rent.toLocaleString()}/year · entire home</Badge>
          ) : null}
        </div>
        <div className="mt-5 space-y-2 text-sm text-muted-foreground">
          <NoteLine>
            {match.budget_overlap ? "Budget ranges overlap" : "Potential budget fit"}
          </NoteLine>
          <NoteLine>
            {match.move_in_window_overlap ? "Move-in dates line up" : "Flexible move-in timing"}
          </NoteLine>
          <NoteLine>
            {match.distance_miles
              ? `${match.distance_miles} miles away`
              : "Within your search area"}
          </NoteLine>
          {ageDifferenceLabel ? <NoteLine>{ageDifferenceLabel}</NoteLine> : null}
        </div>
        <div className="mt-auto pt-6">
          {accepted && contact ? (
            <ContactReveal contact={contact} />
          ) : incoming ? (
            <IncomingActions interestId={interest.id} discovery={discovery} />
          ) : interest?.status === "pending" ? (
            <Button variant="outline" className="w-full" disabled>
              <CheckCircle2 /> Interest sent
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={sending}
              onClick={() => void discovery.showInterest(match.profile_id)}
            >
              {sending ? (
                <>
                  <Loader2 className="animate-spin" /> Sending interest…
                </>
              ) : (
                <>
                  Show interest <ArrowRight />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ContactReveal({
  contact,
}: {
  contact: { contact_email: string | null; contact_phone: string | null };
}) {
  return (
    <div className="rounded-brand-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
      <p className="font-semibold">
        <MessageCircle className="mr-1 inline h-4 w-4" /> You’re connected
      </p>
      <p className="mt-1 break-all">
        {contact.contact_email ?? contact.contact_phone ?? "Contact details shared"}
      </p>
    </div>
  );
}

function IncomingActions({
  interestId,
  discovery,
}: {
  interestId: string;
  discovery: DiscoveryState;
}) {
  const working = discovery.workingId === interestId;
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="flex-1"
        disabled={working}
        onClick={() => void discovery.respondToInterest(interestId, "accepted")}
      >
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1"
        disabled={working}
        onClick={() => void discovery.respondToInterest(interestId, "declined")}
      >
        Pass
      </Button>
    </div>
  );
}
