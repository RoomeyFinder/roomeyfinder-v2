"use client";

import { useState } from "react";
import { ArrowRight, ChevronLeft, Home as HomeIcon, ImagePlus, LockKeyhole, ShieldCheck, Trash2, Users } from "lucide-react";
import Image from "next/image";

import { LocationPicker } from "@/components/location-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChoiceCard, Field, NoteLine, SideNote, StepIntro } from "@/components/roommate-flow/shared";
import { MAX_HOME_PHOTOS, textareaClass } from "@/components/roommate-flow/constants";
import { useHomeForm, useHomeStep } from "@/hooks/useHomeStep";
import type { HomeAddressDraft, HomeChoice, HomeDraft, HomePhotoDraft } from "@/lib/roommate-flow";
import type { Home } from "@/types/schemas";

type HomeStepProps = {
  initialChoice: HomeChoice | null;
  initialTeamUp: boolean;
  existingHome: Home | null;
  homeAddress: HomeAddressDraft | null;
  existingPhotos: HomePhotoDraft[];
  saving: boolean;
  onContinue: (choice: Exclude<HomeChoice, "homeowner">) => Promise<boolean>;
  onSaveHome: (draft: HomeDraft) => Promise<boolean>;
  onDeleteHomePhoto: (homeId: string, photo: HomePhotoDraft) => Promise<boolean>;
  onViewMatches: () => void;
};

export function HomeStep({ initialChoice, initialTeamUp, existingHome, homeAddress, existingPhotos, saving, onContinue, onSaveHome, onDeleteHomePhoto, onViewMatches }: HomeStepProps) {
  const [editing, setEditing] = useState(false);
  const { selected, select, teamUp, toggleTeamUp, continueAsSeeker } = useHomeStep(initialChoice, initialTeamUp, onContinue);
  const hasExistingHome = Boolean(existingHome);
  const hasActiveHome = existingHome?.status === "active";
  const homeownerDraft = existingHome ? {
    id: existingHome.id,
    title: existingHome.title ?? "",
    description: existingHome.description ?? "",
    city: existingHome.city ?? "",
    state: existingHome.state ?? "",
    country: existingHome.country ?? "Nigeria",
    street: homeAddress?.street ?? "",
    rent: existingHome.rent?.toString() ?? "",
    deposit: existingHome.deposit?.toString() ?? "",
    bedrooms: existingHome.bedrooms?.toString() ?? "1",
    bathrooms: existingHome.bathrooms?.toString() ?? "1",
    availableFrom: existingHome.available_from ?? "",
    location: homeAddress?.location ?? null,
    photos: [],
  } satisfies HomeDraft : undefined;

  if (editing) {
    return <HomeForm initialDraft={homeownerDraft} existingPhotos={existingPhotos} saving={saving} onBack={() => setEditing(false)} onContinue={onSaveHome} onDeletePhoto={onDeleteHomePhoto} />;
  }

  const effectiveTeamUp = selected === "homeowner" || hasActiveHome ? false : teamUp;
  const teamUpDisabled = selected === "homeowner" || hasActiveHome;

  return <div className="mx-auto max-w-4xl">
    <StepIntro eyebrow="Step 3 of 3" title="What brings you here?" description="Your answer controls who appears in discovery. You can change your plan later by updating your profile." icon={HomeIcon} />
    <div className="grid gap-4 md:grid-cols-2">
      <ChoiceCard
        selected={selected === "homeowner"}
        icon={HomeIcon}
        title="I have a home or room"
        description="Add the details of the space you're offering and meet people looking for a home."
        onClick={() => { select("homeowner"); if (!hasExistingHome) setEditing(true); }}
        action={hasExistingHome ? { label: "Edit home", onClick: () => { select("homeowner"); setEditing(true); } } : undefined}
        badge="Homeowner"
      />
      <ChoiceCard selected={selected === "seeker"} icon={Users} title="I'm looking for a home" description="Find a room that fits your needs, with the option to team up and find one together." onClick={() => select("seeker")} badge="Home seeker" />
    </div>
    <Card className="mt-6">
      <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-brand"><Users className="h-5 w-5" /></div>
          <div><p className="font-semibold">Open to finding a place together?</p><p className="mt-1 text-sm text-muted-foreground">{teamUpDisabled ? "This is unavailable while you have an active home. Choose home seeker to turn it on." : "Turn this on to also see other home seekers who want to team up."}</p></div>
        </div>
        <button type="button" role="switch" aria-checked={effectiveTeamUp} aria-disabled={teamUpDisabled} disabled={teamUpDisabled} aria-label="Open to finding a place together" onClick={toggleTeamUp} className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${effectiveTeamUp ? "justify-end bg-brand" : "justify-start bg-muted-foreground/30"}`}><span className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform" /></button>
      </CardContent>
    </Card>
    <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><LockKeyhole className="h-4 w-4" /> Homeowners always match with seekers only.</div>
      {selected === "homeowner" && hasActiveHome ? <Button disabled={saving} onClick={onViewMatches}>See my matches <ArrowRight /></Button> : <Button disabled={selected !== "seeker" || saving} onClick={() => void continueAsSeeker()}>{saving ? "Saving plan..." : "See my matches"} <ArrowRight /></Button>}
    </div>
  </div>;
}

function HomeForm({ initialDraft, existingPhotos, saving, onBack, onContinue, onDeletePhoto }: { initialDraft?: HomeDraft; existingPhotos: HomePhotoDraft[]; saving: boolean; onBack: () => void; onContinue: (draft: HomeDraft) => Promise<boolean>; onDeletePhoto: (homeId: string, photo: HomePhotoDraft) => Promise<boolean> }) {
  const { draft, photos, update, selectPhotos, submit } = useHomeForm(onContinue, initialDraft, existingPhotos.length);
  const remainingPhotoSlots = Math.max(0, MAX_HOME_PHOTOS - existingPhotos.length - photos.length);
  const canAddPhotos = existingPhotos.length < MAX_HOME_PHOTOS || photos.length > 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit();
  }

  return <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
    <Card><CardHeader><button type="button" onClick={onBack} className="mb-4 flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /> Back to choices</button><StepIntro eyebrow="Homeowner" title={initialDraft ? "Edit your home details" : "Add your home details"} description="Complete the essentials and your home will be published so compatible seekers can discover you." icon={HomeIcon} /></CardHeader>
      <CardContent><form className="space-y-6" onSubmit={handleSubmit}>
        <Field label="Listing title" htmlFor="home-title"><Input id="home-title" required value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="Bright room in a 3-bed flat" /></Field>
        <Field label="Tell people about the space" htmlFor="home-description"><textarea id="home-description" required rows={4} className={textareaClass} value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="What makes this home comfortable to share?" /></Field>
        <LocationPicker id="home-location" label="Where is the home?" hint="This is the location seekers will use when comparing distance. Your exact coordinates stay private." required value={draft.location} onChange={(location) => update("location", location)} />
        <div className="grid gap-4 sm:grid-cols-2"><Field label="City" htmlFor="home-city"><Input id="home-city" required value={draft.city} onChange={(event) => update("city", event.target.value)} placeholder="Lagos" /></Field><Field label="State" htmlFor="home-state"><Input id="home-state" required value={draft.state} onChange={(event) => update("state", event.target.value)} placeholder="Lagos" /></Field></div>
        <Field label="Street / area" htmlFor="home-street" hint="Your exact address stays private until you publish and choose to share it."><Input id="home-street" required value={draft.street} onChange={(event) => update("street", event.target.value)} placeholder="15 Example Street" /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Monthly rent (₦)" htmlFor="home-rent"><Input id="home-rent" required type="number" min="1" value={draft.rent} onChange={(event) => update("rent", event.target.value)} placeholder="250000" /></Field><Field label="Deposit (₦)" htmlFor="home-deposit" optional><Input id="home-deposit" type="number" min="0" value={draft.deposit} onChange={(event) => update("deposit", event.target.value)} placeholder="500000" /></Field><Field label="Bedrooms" htmlFor="home-bedrooms"><Input id="home-bedrooms" required type="number" min="1" value={draft.bedrooms} onChange={(event) => update("bedrooms", event.target.value)} /></Field><Field label="Bathrooms" htmlFor="home-bathrooms"><Input id="home-bathrooms" required type="number" min="1" value={draft.bathrooms} onChange={(event) => update("bathrooms", event.target.value)} /></Field></div>
        <Field label="Available from" htmlFor="available-from"><Input id="available-from" required type="date" value={draft.availableFrom} onChange={(event) => update("availableFrom", event.target.value)} /></Field>
        <Field label="Home photos" htmlFor="home-photos" hint={`Add up to ${MAX_HOME_PHOTOS} photos in total. Your first photo becomes the cover.`}>{existingPhotos.length > 0 ? <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{existingPhotos.map((photo) => <div key={photo.id} className="group relative overflow-hidden rounded-brand-md border bg-secondary/30"><div className="relative aspect-[4/3] bg-muted">{photo.previewUrl ? <Image src={photo.previewUrl} alt={photo.isPrimary ? "Primary home photo" : "Home photo"} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" /> : <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">Preview unavailable</div>}</div>{photo.isPrimary ? <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-[10px] font-semibold text-brand">Cover</span> : null}<button type="button" disabled={saving} aria-label={`Delete ${photo.isPrimary ? "cover " : ""}home photo`} onClick={() => void onDeletePhoto(initialDraft?.id ?? "", photo)} className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-destructive shadow-sm transition-opacity hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div> : null}<label htmlFor="home-photos" className={`flex cursor-pointer flex-col items-center justify-center rounded-brand-md border border-dashed border-brand/40 bg-secondary/30 px-5 py-8 text-center hover:bg-secondary/60 ${canAddPhotos ? "" : "cursor-not-allowed opacity-60"}`}><ImagePlus className="mb-2 h-5 w-5 text-brand" /><span className="text-sm font-semibold">{canAddPhotos ? "Choose photos" : "Photo limit reached"}</span><span className="mt-1 text-xs text-muted-foreground">{canAddPhotos ? `${remainingPhotoSlots} slot${remainingPhotoSlots === 1 ? "" : "s"} remaining` : `Maximum ${MAX_HOME_PHOTOS} photos`}</span><input id="home-photos" type="file" accept="image/png,image/jpeg" multiple disabled={!canAddPhotos} className="sr-only" onChange={(event) => selectPhotos(event.target.files)} /></label>{photos.length > 0 ? <p className="mt-2 text-xs text-muted-foreground">{photos.length} new photo{photos.length === 1 ? "" : "s"} selected: {photos.map((photo) => photo.name).join(", ")}</p> : null}</Field>
        <Button type="submit" className="w-full sm:w-auto" disabled={saving}>{saving ? "Saving home..." : "Save home & continue"} <ArrowRight /></Button>
      </form></CardContent>
    </Card>
    <SideNote title="Homeowner" icon={ShieldCheck}><p>Your listing puts you in the driver&apos;s seat. We&apos;ll only show you to people whose preferences fit your home.</p><div className="mt-5 space-y-3 text-sm"><NoteLine>Only home seekers appear in your matches.</NoteLine><NoteLine>Your matching toggle is locked off while you own an active home.</NoteLine><NoteLine>Your home becomes active after the required details and a primary photo are saved.</NoteLine></div></SideNote>
  </div>;
}
