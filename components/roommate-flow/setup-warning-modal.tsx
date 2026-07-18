"use client";

import { ArrowRight, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { FlowGate } from "@/lib/roommate-flow";

const setupDetails = {
  profile: {
    title: "Finish your profile first",
    description:
      "A few critical details are still missing. Completing them helps us calculate matches more accurately.",
    missing: "your name, age, lifestyle, and location",
  },
  preferences: {
    title: "Complete your preferences",
    description:
      "Your matches will be more useful when we know what you can afford, when you want to move, and how you live.",
    missing: "your budget, move-in window, search radius, and home habits",
  },
  home: {
    title: "Choose your home plan",
    description:
      "Tell us whether you have a room to offer or are looking for a home so we can calculate the right matches.",
    missing: "your home or home-seeker plan",
  },
} satisfies Record<
  Exclude<FlowGate, "discover">,
  { title: string; description: string; missing: string }
>;

export function SetupWarningModal({
  gate,
  onUpdateSetup,
  // onContinueAnyway,
}: {
  gate: Exclude<FlowGate, "discover">;
  onUpdateSetup: () => void;
  onContinueAnyway: () => void;
}) {
  const details = setupDetails[gate];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/5 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-warning-title"
      aria-describedby="setup-warning-description"
    >
      <Card className="w-full max-w-lg">
        <CardHeader className="p-6 pb-4">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-brand-md bg-secondary text-brand">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <CardTitle id="setup-warning-title" className="text-2xl">
            {details.title}
          </CardTitle>
          <p
            id="setup-warning-description"
            className="mt-2 text-sm leading-6 text-muted-foreground"
          >
            {details.description}
          </p>
        </CardHeader>
        <CardContent className="px-6 pb-2">
          <p className="rounded-brand-md bg-secondary/60 p-4 text-sm text-muted-foreground">
            Missing or incomplete:{" "}
            <span className="font-semibold text-foreground">{details.missing}</span>.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-3 p-6 sm:flex-row sm:justify-end">
          {/* <Button variant="outline" className="w-full sm:w-auto" onClick={onContinueAnyway}>
            Find matches anyway
          </Button> */}
          <Button className="w-full sm:w-auto" onClick={onUpdateSetup}>
            Update my info <ArrowRight />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
