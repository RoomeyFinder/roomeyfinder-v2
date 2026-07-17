"use client";

import { ArrowRight, Check, ShieldCheck, UserRound } from "lucide-react";

import { LocationPicker } from "@/components/location-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, NoteLine, SideNote, StepIntro } from "@/components/roommate-flow/shared";
import { lifestyleOptions, selectClass } from "@/components/roommate-flow/constants";
import { useProfileStep } from "@/hooks/useProfileStep";
import { getDateOfBirthError } from "@/lib/profile-validation";
import type { ProfileDraft } from "@/lib/roommate-flow";
import { useState } from "react";

type ProfileStepProps = {
  initialDraft: ProfileDraft;
  onContinue: (draft: ProfileDraft) => Promise<boolean>;
  saving: boolean;
};

export function ProfileStep({ initialDraft, onContinue, saving }: ProfileStepProps) {
  const { draft, update, toggleTag, submit } = useProfileStep(initialDraft, onContinue);
  const [birthDateError, setBirthDateError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dateError = getDateOfBirthError(draft.birthDate);
    if (dateError) {
      setBirthDateError(dateError);
      return;
    }

    await submit();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <StepIntro eyebrow="Gate 1 of 3" title="Start with the real you" description="A few details help us introduce you to the right people. Your age and exact location are never shown publicly." icon={UserRound} />
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="first-name"><Input id="first-name" required value={draft.firstName} onChange={(event) => update("firstName", event.target.value)} placeholder="Ada" /></Field>
              <Field label="Last name" htmlFor="last-name" optional><Input id="last-name" value={draft.lastName} onChange={(event) => update("lastName", event.target.value)} placeholder="Lovelace" /></Field>
              <Field label="Username" htmlFor="username" hint="This is what other members will see."><Input id="username" required value={draft.username} onChange={(event) => update("username", event.target.value)} placeholder="ada.l" /></Field>
              <Field label="Date of birth" htmlFor="birth-date" error={birthDateError} hint="You must be 18 or older."><Input id="birth-date" required type="date" value={draft.birthDate} onChange={(event) => { const value = event.target.value; update("birthDate", value); setBirthDateError(value ? getDateOfBirthError(value) : ""); }} /></Field>
            </div>

            <Field label="How should we refer to you?" htmlFor="gender">
              <select id="gender" className={selectClass} value={draft.gender} onChange={(event) => update("gender", event.target.value as ProfileDraft["gender"]) }>
                <option value="prefer_not_to_say">Prefer not to say</option><option value="female">Woman</option><option value="male">Man</option><option value="non_binary">Non-binary</option>
              </select>
            </Field>

            <LocationPicker
              id="profile-location"
              label="Where do you want to live?"
              hint="Choose an area or use your current location. We use it for matching and never show your exact coordinates."
              required
              value={draft.location}
              onChange={(location) => update("location", location)}
            />

            <Field label="What is your home rhythm?" htmlFor="lifestyle-tags" hint="Choose at least one so we can make more thoughtful introductions.">
              <div id="lifestyle-tags" className="flex flex-wrap gap-2">{lifestyleOptions.map((option) => { const selected = draft.lifestyleTags.includes(option.value); return <button key={option.value} type="button" aria-pressed={selected} onClick={() => toggleTag(option.value)} className={`rounded-full border px-3 py-2 text-sm transition-colors ${selected ? "border-brand bg-secondary font-semibold text-brand" : "border-input hover:border-brand/50"}`}>{selected ? <Check className="mr-1 inline h-3.5 w-3.5" /> : null}{option.label}</button>; })}</div>
            </Field>

            <Button type="submit" className="w-full sm:w-auto" disabled={saving || draft.lifestyleTags.length === 0 || Boolean(birthDateError)}>{saving ? "Saving profile..." : "Save & continue"} <ArrowRight /></Button>
          </form>
        </CardContent>
      </Card>
      <SideNote title="Why we ask" icon={ShieldCheck}><p>Compatibility is more than a postcode. We use your habits, budget, and move-in window to make the shortlist feel useful.</p><div className="mt-5 space-y-3 text-sm"><NoteLine>Private details stay in your secure profile.</NoteLine><NoteLine>Exact addresses are never shown in discovery.</NoteLine><NoteLine>You control when you become visible to others.</NoteLine></div></SideNote>
    </div>
  );
}
