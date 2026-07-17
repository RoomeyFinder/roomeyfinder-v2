"use client";

import { useCallback, useState } from "react";

import type { PreferenceDraft } from "@/lib/roommate-flow";

export function usePreferencesStep(initialDraft: PreferenceDraft, onContinue: (draft: PreferenceDraft) => Promise<boolean>) {
  const [draft, setDraft] = useState(initialDraft);
  const update = useCallback(<K extends keyof PreferenceDraft>(key: K, value: PreferenceDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);
  const submit = useCallback(async () => onContinue(draft), [draft, onContinue]);

  return { draft, update, submit };
}
