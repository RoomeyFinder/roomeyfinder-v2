"use client";

import { useCallback, useState } from "react";

import type { ProfileDraft } from "@/lib/roommate-flow";

export function useProfileStep(initialDraft: ProfileDraft, onContinue: (draft: ProfileDraft) => Promise<boolean>) {
  const [draft, setDraft] = useState(initialDraft);

  const update = useCallback(<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setDraft((current) => ({
      ...current,
      lifestyleTags: current.lifestyleTags.includes(tag)
        ? current.lifestyleTags.filter((item) => item !== tag)
        : [...current.lifestyleTags, tag],
    }));
  }, []);

  const selectProfilePhoto = useCallback((photo: File | null) => {
    setDraft((current) => ({ ...current, profilePhoto: photo }));
  }, []);

  const submit = useCallback(async () => onContinue(draft), [draft, onContinue]);

  return { draft, update, toggleTag, selectProfilePhoto, submit };
}
