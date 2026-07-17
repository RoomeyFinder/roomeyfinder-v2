"use client";

import { useCallback, useState } from "react";

import type { HomeChoice, HomeDraft } from "@/lib/roommate-flow";

export function useHomeStep(initialTeamUp: boolean, onContinue: (choice: Exclude<HomeChoice, "homeowner">) => Promise<boolean>) {
  const [selected, setSelected] = useState<HomeChoice | null>(null);
  const [teamUp, setTeamUp] = useState(initialTeamUp);
  const continueAsSeeker = useCallback(() => onContinue(teamUp ? "team_up" : "seeker"), [onContinue, teamUp]);

  return { selected, select: setSelected, teamUp, toggleTeamUp: () => setTeamUp((current) => !current), continueAsSeeker };
}

export function useHomeForm(onContinue: (draft: HomeDraft) => Promise<boolean>) {
  const [draft, setDraft] = useState<HomeDraft>({ title: "", description: "", city: "", state: "", country: "Nigeria", street: "", rent: "", deposit: "", bedrooms: "1", bathrooms: "1", availableFrom: "" });
  const [photos, setPhotos] = useState<string[]>([]);
  const update = useCallback(<K extends keyof HomeDraft>(key: K, value: HomeDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);
  const selectPhotos = useCallback((files: FileList | null) => setPhotos(Array.from(files ?? []).map((file) => file.name)), []);
  const submit = useCallback(async () => onContinue(draft), [draft, onContinue]);

  return { draft, photos, update, selectPhotos, submit };
}
