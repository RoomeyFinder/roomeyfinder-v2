"use client";

import { ArrowDownUp, Inbox, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInterestsView, type InterestDirection } from "@/hooks/useInterestsView";
import type { InterestStatus, InterestWithProfile } from "@/lib/interests";

const statuses: Array<InterestStatus | "all"> = ["all", "pending", "accepted", "declined"];

export function InterestsPage({
  interests,
  userId,
}: {
  interests: InterestWithProfile[];
  userId: string;
}) {
  const view = useInterestsView(interests, userId);
  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Your activity</p>
        <h1 className="mt-2 text-3xl font-bold">Interests</h1>
        <p className="mt-2 text-muted-foreground">
          Keep track of the people you’re connecting with.
        </p>
      </div>
      <div className="mb-6 flex flex-col gap-3 rounded-brand-md border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <DirectionButton
            active={view.direction === "sent"}
            value="sent"
            onChange={view.setDirection}
            icon={<Send />}
            label="Sent"
          />
          <DirectionButton
            active={view.direction === "received"}
            value="received"
            onChange={view.setDirection}
            icon={<Inbox />}
            label="Received"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filter by status"
            value={view.status}
            onChange={(event) => view.setStatus(event.target.value as InterestStatus | "all")}
            className="h-9 rounded-brand-sm border border-input bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            {statuses.slice(1).map((item) => (
              <option key={item} value={item}>
                {item[0].toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => view.setSort(view.sort === "desc" ? "asc" : "desc")}
            className="inline-flex h-9 items-center gap-2 rounded-brand-sm border border-input px-3 text-sm hover:bg-accent"
          >
            <ArrowDownUp className="h-4 w-4" />
            {view.sort === "desc" ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {view.visibleInterests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {emptyStateMessage(view.direction, view.status)}
            </CardContent>
          </Card>
        ) : (
          view.visibleInterests.map((interest) => {
            const profile = view.direction === "sent" ? interest.to_profile : interest.from_profile;
            const displayName = profile?.first_name || profile?.username || "Roommate";
            return (
              <Card key={interest.id}>
                <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
                  <div className="flex min-w-0 items-center gap-3">
                    {profile?.photo_url ? (
                      <Image
                        src={profile.photo_url}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      {profile?.username ? (
                        <Link
                          href={`/${profile.username}`}
                          className="truncate font-semibold hover:text-primary hover:underline"
                        >
                          {displayName}
                        </Link>
                      ) : (
                        <CardTitle className="truncate text-base">{displayName}</CardTitle>
                      )}
                      {profile?.occupation ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {profile.occupation}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Badge
                    variant={
                      interest.status === "accepted"
                        ? "default"
                        : interest.status === "declined"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {interest.status}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {view.direction === "sent" ? "Interest sent" : "Interest received"} ·{" "}
                  {formatInterestDate(interest.created_at)}
                  {profile?.bio ? (
                    <p className="mt-2 line-clamp-2 text-foreground/80">{profile.bio}</p>
                  ) : null}
                </CardContent>
                {view.direction === "received" && interest.status === "pending" ? (
                  <div className="flex gap-2 px-6 pb-6">
                    <Button
                      size="sm"
                      disabled={view.workingId === interest.id}
                      onClick={() => void view.respondToInterest(interest.id, "accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={view.workingId === interest.id}
                      onClick={() => void view.respondToInterest(interest.id, "declined")}
                    >
                      Decline
                    </Button>
                  </div>
                ) : null}
              </Card>
            );
          })
        )}
      </div>
      {view.error ? <p className="mt-4 text-sm text-destructive">{view.error}</p> : null}
    </section>
  );
}

function emptyStateMessage(direction: InterestDirection, status: InterestStatus | "all") {
  const side = direction === "sent" ? "outgoing" : "received";
  if (status === "all") return `You don't have any ${side} interests yet.`;
  return `You don't have any ${status} ${side} interests.`;
}

function formatInterestDate(value: string | null) {
  if (!value) return "Date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function DirectionButton({
  active,
  value,
  onChange,
  icon,
  label,
}: {
  active: boolean;
  value: InterestDirection;
  onChange: (value: InterestDirection) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`inline-flex h-9 items-center gap-2 rounded-brand-sm px-3 text-sm font-semibold ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
    >
      {icon}
      {label}
    </button>
  );
}
