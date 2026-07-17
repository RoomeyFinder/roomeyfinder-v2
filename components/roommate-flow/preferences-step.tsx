"use client";

import { ArrowRight, Search, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, SideNote, StepIntro } from "@/components/roommate-flow/shared";
import { selectClass } from "@/components/roommate-flow/constants";
import { usePreferencesStep } from "@/hooks/usePreferencesStep";
import type { PreferenceDraft } from "@/lib/roommate-flow";

type PreferencesStepProps = { initialDraft: PreferenceDraft; onContinue: (draft: PreferenceDraft) => Promise<boolean>; saving: boolean };

export function PreferencesStep({ initialDraft, onContinue, saving }: PreferencesStepProps) {
  const { draft, update, submit } = usePreferencesStep(initialDraft, onContinue);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card><CardHeader><StepIntro eyebrow="Gate 2 of 3" title="Set your non-negotiables" description="This is where we tune the search. You can always update these preferences later." icon={Settings} /></CardHeader><CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div><p className="mb-3 text-sm font-medium">Monthly budget (₦)</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Minimum" htmlFor="budget-min"><Input id="budget-min" required type="number" min="0" value={draft.budgetMin} onChange={(event) => update("budgetMin", event.target.value)} placeholder="150000" /></Field><Field label="Maximum" htmlFor="budget-max"><Input id="budget-max" required type="number" min="0" value={draft.budgetMax} onChange={(event) => update("budgetMax", event.target.value)} placeholder="300000" /></Field></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Move in from" htmlFor="move-in-from"><Input id="move-in-from" required type="date" value={draft.moveInFrom} onChange={(event) => update("moveInFrom", event.target.value)} /></Field><Field label="Move in by" htmlFor="move-in-to"><Input id="move-in-to" required type="date" value={draft.moveInTo} onChange={(event) => update("moveInTo", event.target.value)} /></Field></div>
          <Field label="Search radius" htmlFor="distance" hint="We&apos;ll prioritise people within this distance of your location."><div className="flex items-center gap-3"><Input id="distance" required type="number" min="1" value={draft.maxDistanceMiles} onChange={(event) => update("maxDistanceMiles", event.target.value)} /><span className="shrink-0 text-sm text-muted-foreground">miles</span></div></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Smoking at home" htmlFor="smoking"><select id="smoking" className={selectClass} value={draft.smokingPreference} onChange={(event) => update("smokingPreference", event.target.value as PreferenceDraft["smokingPreference"])}><option value="no">Non-smoking home</option><option value="outside_only">Outside only</option><option value="yes">Smoking is okay</option></select></Field><Field label="Living with pets" htmlFor="pets"><select id="pets" className={selectClass} value={draft.petsPreference} onChange={(event) => update("petsPreference", event.target.value as PreferenceDraft["petsPreference"])}><option value="depends">Open to discussing</option><option value="no">No pets</option><option value="yes">Pet-friendly</option></select></Field></div>
          <Button type="submit" className="w-full sm:w-auto" disabled={saving}>{saving ? "Saving preferences..." : "Save & choose your home plan"} <ArrowRight /></Button>
        </form>
      </CardContent></Card>
      <SideNote title="Your shortlist, your rules" icon={Search}><p>These details power the compatibility score, so you spend less time filtering and more time meeting people who make sense.</p><div className="mt-6 rounded-brand-md bg-secondary/60 p-4"><p className="text-sm font-semibold text-brand">What we&apos;ll compare</p><div className="mt-3 flex flex-wrap gap-2">{["Budget overlap", "Move-in window", "Distance", "Home habits"].map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div></div></SideNote>
    </div>
  );
}
