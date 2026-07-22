"use client";

import { useState } from "react";
import { ArrowRight, Search, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, SideNote, StepIntro } from "@/components/roommate-flow/shared";
import { selectClass } from "@/components/roommate-flow/constants";
import { usePreferencesStep } from "@/hooks/usePreferencesStep";
import { getTodayDate, validatePreferenceDraft, type PreferenceDraft } from "@/lib/roommate-flow";

type PreferencesStepProps = {
  initialDraft: PreferenceDraft;
  onContinue: (draft: PreferenceDraft) => Promise<boolean>;
  saving: boolean;
};

export function PreferencesStep({ initialDraft, onContinue, saving }: PreferencesStepProps) {
  const { draft, update, submit } = usePreferencesStep(initialDraft, onContinue);
  const [validationError, setValidationError] = useState("");
  const today = getTodayDate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validatePreferenceDraft(draft);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    await submit();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <StepIntro
            eyebrow="Step 2 of 3"
            title="Set your non-negotiables"
            description="This is where we tune the search. You can always update these preferences later."
            icon={Settings}
          />
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <fieldset disabled={saving} className="contents space-y-8">
              {validationError ? (
                <p
                  role="alert"
                  className="rounded-brand-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  {validationError}
                </p>
              ) : null}
              <div>
                <p className="mb-3 text-sm font-medium">Annual housing budget (₦)</p>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Minimum" htmlFor="budget-min">
                    <Input
                      id="budget-min"
                      required
                      type="number"
                      min="0"
                      value={draft.budgetMin}
                      onChange={(event) => update("budgetMin", event.target.value)}
                      placeholder="150000"
                    />
                  </Field>
                  <Field label="Maximum" htmlFor="budget-max">
                    <Input
                      id="budget-max"
                      required
                      type="number"
                      min="0"
                      value={draft.budgetMax}
                      onChange={(event) => update("budgetMax", event.target.value)}
                      placeholder="300000"
                    />
                  </Field>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Move in from" htmlFor="move-in-from">
                  <Input
                    id="move-in-from"
                    required
                    type="date"
                    min={today}
                    max={draft.moveInTo || undefined}
                    value={draft.moveInFrom}
                    onChange={(event) => update("moveInFrom", event.target.value)}
                  />
                </Field>
                <Field label="Move in by" htmlFor="move-in-to">
                  <Input
                    id="move-in-to"
                    required
                    type="date"
                    min={draft.moveInFrom || today}
                    value={draft.moveInTo}
                    onChange={(event) => update("moveInTo", event.target.value)}
                  />
                </Field>
              </div>
              <Field
                label="Search radius"
                htmlFor="distance"
                hint="We'll prioritise people within this distance of your location."
              >
                <div className="flex items-center gap-3">
                  <Input
                    id="distance"
                    required
                    type="number"
                    min="1"
                    value={draft.maxDistanceMiles}
                    onChange={(event) => update("maxDistanceMiles", event.target.value)}
                  />
                  <span className="shrink-0 text-sm text-muted-foreground">miles</span>
                </div>
              </Field>
              <div className="grid gap-6 sm:grid-cols-3">
                <Field
                  label="Preferred gender"
                  htmlFor="preferred-gender"
                  hint="Leave this as any gender if you have no preference."
                >
                  <select
                    id="preferred-gender"
                    className={selectClass}
                    value={draft.preferredGender}
                    onChange={(event) =>
                      update(
                        "preferredGender",
                        event.target.value as PreferenceDraft["preferredGender"],
                      )
                    }
                  >
                    <option value="">Any gender</option>
                    <option value="male">Men</option>
                    <option value="female">Women</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </Field>
                <Field label="Preferred age from" htmlFor="min-age" className="flex flex-col">
                  <Input
                    id="min-age"
                    type="number"
                    min="18"
                    max="120"
                    value={draft.minAge}
                    onChange={(event) => update("minAge", event.target.value)}
                    placeholder="Any"
                  />
                </Field>
                <Field label="Preferred age to" htmlFor="max-age" className="flex flex-col">
                  <Input
                    id="max-age"
                    type="number"
                    min="18"
                    max="120"
                    value={draft.maxAge}
                    onChange={(event) => update("maxAge", event.target.value)}
                    placeholder="Any"
                  />
                </Field>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Smoking at home" htmlFor="smoking">
                  <select
                    id="smoking"
                    className={selectClass}
                    value={draft.smokingPreference}
                    onChange={(event) =>
                      update(
                        "smokingPreference",
                        event.target.value as PreferenceDraft["smokingPreference"],
                      )
                    }
                  >
                    <option value="no">Non-smoking home</option>
                    <option value="outside_only">Outside only</option>
                    <option value="yes">Smoking is okay</option>
                  </select>
                </Field>
                <Field label="Living with pets" htmlFor="pets">
                  <select
                    id="pets"
                    className={selectClass}
                    value={draft.petsPreference}
                    onChange={(event) =>
                      update(
                        "petsPreference",
                        event.target.value as PreferenceDraft["petsPreference"],
                      )
                    }
                  >
                    <option value="depends">Open to discussing</option>
                    <option value="no">No pets</option>
                    <option value="yes">Pet-friendly</option>
                  </select>
                </Field>
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                {saving ? "Saving preferences..." : "Save & choose your home plan"} <ArrowRight />
              </Button>
            </fieldset>
          </form>
        </CardContent>
      </Card>
      <SideNote title="Your shortlist, your rules" icon={Search}>
        <p>
          These details power the compatibility score, so you spend less time filtering and more
          time meeting people who make sense.
        </p>
        <div className="mt-6 rounded-brand-md bg-secondary/60 p-4">
          <p className="text-sm font-semibold text-brand">What we&apos;ll compare</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Budget overlap", "Move-in window", "Distance", "Home habits"].map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </SideNote>
    </div>
  );
}
