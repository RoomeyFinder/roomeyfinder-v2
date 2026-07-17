import { Home, Settings2, UserRound } from "lucide-react";

export const lifestyleOptions = [
  { label: "Clean & tidy", value: "clean" },
  { label: "Quiet at home", value: "quiet" },
  { label: "Social & friendly", value: "social" },
  { label: "Early riser", value: "early" },
  { label: "Works from home", value: "work from home" },
  { label: "Pet friendly", value: "pet friendly" },
] as const;

export const setupSteps = [
  { id: "profile", label: "Your profile", icon: UserRound },
  { id: "preferences", label: "Your preferences", icon: Settings2 },
  { id: "home", label: "Your home plan", icon: Home },
] as const;

export const MAX_HOME_PHOTOS = 5;

export const selectClass =
  "flex h-11 w-full rounded-brand-md border border-input bg-background px-4 py-2 text-sm shadow-sm outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-ring";

export const textareaClass =
  "flex min-h-24 w-full resize-y rounded-brand-md border border-input bg-transparent px-4 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-1 focus:ring-ring";
