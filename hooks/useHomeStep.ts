"use client";

import { useCallback, useState } from "react";

import { MAX_HOME_PHOTOS } from "@/components/roommate-flow/constants";
import type { HomeChoice, HomeDraft } from "@/lib/roommate-flow";

export function useHomeStep(initialChoice: HomeChoice | null, initialTeamUp: boolean, onContinue: (choice: Exclude<HomeChoice, "homeowner">) => Promise<boolean>) {
  const [selected, setSelected] = useState<HomeChoice | null>(initialChoice);
  const [teamUp, setTeamUp] = useState(initialTeamUp);
  const continueAsSeeker = useCallback(() => onContinue(teamUp ? "team_up" : "seeker"), [onContinue, teamUp]);

  return { selected, select: setSelected, teamUp, toggleTeamUp: () => setTeamUp((current) => !current), continueAsSeeker };
}

export function useHomeForm(onContinue: (draft: HomeDraft) => Promise<boolean>, initialDraft?: HomeDraft, existingPhotoCount = 0) {
  const [draft, setDraft] = useState<HomeDraft>(() => initialDraft ?? { title: "", description: "", city: "", state: "", country: "Nigeria", street: "", rent: "", deposit: "", bedrooms: "1", bathrooms: "1", availableFrom: "", location: null, photos: [] });
  const update = useCallback(<K extends keyof HomeDraft>(key: K, value: HomeDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);
  const selectPhotos = useCallback((files: FileList | null) => {
    const remainingSlots = Math.max(0, MAX_HOME_PHOTOS - existingPhotoCount);
    setDraft((current) => ({ ...current, photos: Array.from(files ?? []).slice(0, remainingSlots) }));
  }, [existingPhotoCount]);
  const submit = useCallback(async () => onContinue(draft), [draft, onContinue]);

  return { draft, photos: draft.photos, update, selectPhotos, submit };
}
