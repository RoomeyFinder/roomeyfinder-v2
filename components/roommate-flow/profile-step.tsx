"use client";

import { ArrowRight, Camera, Check, ShieldCheck, UserRound } from "lucide-react";
import Image from "next/image";

import { LocationPicker } from "@/components/location-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, NoteLine, SideNote, StepIntro } from "@/components/roommate-flow/shared";
import { lifestyleOptions, selectClass } from "@/components/roommate-flow/constants";
import { useProfileStep } from "@/hooks/useProfileStep";
import { getDateOfBirthError } from "@/lib/profile-validation";
import type { ProfileDraft } from "@/lib/roommate-flow";
import type { ProfilePhotoDraft } from "@/lib/roommate-flow";
import { useEffect, useState } from "react";

type ProfileStepProps = {
  initialDraft: ProfileDraft;
  initialPhoto: ProfilePhotoDraft | null;
  onContinue: (draft: ProfileDraft) => Promise<boolean>;
  saving: boolean;
};

export function ProfileStep({ initialDraft, initialPhoto, onContinue, saving }: ProfileStepProps) {
  const { draft, update, toggleTag, selectProfilePhoto, submit } = useProfileStep(
    initialDraft,
    onContinue,
  );
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
          <StepIntro
            eyebrow="Step 1 of 3"
            title="Start with the real you"
            description="A few details help us introduce you to the right people. Your age and exact location are never shown publicly."
            icon={UserRound}
          />
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <fieldset disabled={saving} className="contents space-y-8">
              <ProfilePhotoPicker
                existingPhoto={initialPhoto}
                selectedPhoto={draft.profilePhoto}
                onSelect={selectProfilePhoto}
              />
              <div className="grid gap-6 sm:grid-cols-2">
              <Field label="First name" htmlFor="first-name">
                <Input
                  id="first-name"
                  required
                  value={draft.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                  placeholder="Ada"
                />
              </Field>
              <Field label="Last name" htmlFor="last-name" optional>
                <Input
                  id="last-name"
                  value={draft.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                  placeholder="Lovelace"
                />
              </Field>
              <Field
                label="Username"
                htmlFor="username"
                hint="This is what other members will see."
              >
                <Input
                  id="username"
                  required
                  value={draft.username}
                  onChange={(event) => update("username", event.target.value)}
                  placeholder="ada.l"
                />
              </Field>
              <Field
                label="Date of birth"
                htmlFor="birth-date"
                error={birthDateError}
                hint="You must be 18 or older."
              >
                <Input
                  id="birth-date"
                  required
                  type="date"
                  value={draft.birthDate}
                  onChange={(event) => {
                    const value = event.target.value;
                    update("birthDate", value);
                    setBirthDateError(value ? getDateOfBirthError(value) : "");
                  }}
                />
              </Field>
              </div>

              <Field
                label="Phone number"
                htmlFor="contact-phone"
                hint="Shared only after you accept an interest."
              >
                <Input
                  id="contact-phone"
                  required
                  type="tel"
                  autoComplete="tel"
                  value={draft.contactPhone}
                  onChange={(event) => update("contactPhone", event.target.value)}
                  placeholder="08012345678"
                />
              </Field>

            <Field label="How should we refer to you?" htmlFor="gender">
              <select
                id="gender"
                className={selectClass}
                value={draft.gender}
                onChange={(event) => update("gender", event.target.value as ProfileDraft["gender"])}
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="female">Woman</option>
                <option value="male">Man</option>
                <option value="non_binary">Non-binary</option>
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

            <Field
              label="What is your home rhythm?"
              htmlFor="lifestyle-tags"
              hint="Choose at least one so we can make more thoughtful introductions."
            >
              <div id="lifestyle-tags" className="flex flex-wrap gap-2">
                {lifestyleOptions.map((option) => {
                  const selected = draft.lifestyleTags.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleTag(option.value)}
                      className={`rounded-full border px-3 py-2 text-sm transition-colors ${selected ? "border-brand bg-secondary font-semibold text-brand" : "border-input hover:border-brand/50"}`}
                    >
                      {selected ? <Check className="mr-1 inline h-3.5 w-3.5" /> : null}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </Field>

              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={draft.lifestyleTags.length === 0 || Boolean(birthDateError)}
              >
                {saving ? "Saving profile..." : "Save & continue"} <ArrowRight />
              </Button>
            </fieldset>
          </form>
        </CardContent>
      </Card>
      <SideNote title="Why we ask" icon={ShieldCheck}>
        <p>
          Compatibility is more than a postcode. We use your habits, budget, and move-in window to
          make the shortlist feel useful.
        </p>
        <div className="mt-5 space-y-3 text-sm">
          <NoteLine>Private details stay in your secure profile.</NoteLine>
          <NoteLine>Exact addresses are never shown in discovery.</NoteLine>
          <NoteLine>You control when you become visible to others.</NoteLine>
        </div>
      </SideNote>
    </div>
  );
}

function ProfilePhotoPicker({
  existingPhoto,
  selectedPhoto,
  onSelect,
}: {
  existingPhoto: ProfilePhotoDraft | null;
  selectedPhoto: File | null;
  onSelect: (photo: File | null) => void;
}) {
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(existingPhoto?.previewUrl ?? null);

  useEffect(() => {
    if (!selectedPhoto) {
      setPreviewUrl(existingPhoto?.previewUrl ?? null);
      return;
    }

    const url = URL.createObjectURL(selectedPhoto);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [existingPhoto?.previewUrl, selectedPhoto]);

  function handleSelect(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile images must be 5MB or smaller.");
      return;
    }
    onSelect(file);
  }

  return (
    <div className="flex flex-col items-center border-b pb-6 text-center">
      <div className="relative h-20 w-20">
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-secondary bg-secondary text-brand shadow-sm">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Profile preview"
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <UserRound className="m-auto h-12 w-12" />
          )}
        </div>
        <label
          htmlFor="profile-photo"
          aria-label={existingPhoto || selectedPhoto ? "Change profile photo" : "Add profile photo"}
          className="border-1 text-brand-foreground absolute -bottom-0 -right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-background bg-brand/70 shadow-md transition-colors hover:bg-brand/90"
        >
          <Camera className="h-3 w-3" />
          <input
            id="profile-photo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => handleSelect(event.target.files?.[0])}
          />
        </label>
      </div>
      <p className="mt-4 text-sm font-semibold">
        Profile photo <span className="font-normal text-muted-foreground">(optional)</span>
      </p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
        <span className="block">A clear photo helps people recognize you.</span>
        <span className="block">JPG, PNG, or WebP · up to 5MB.</span>
      </p>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
