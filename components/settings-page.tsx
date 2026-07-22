"use client";

import {
  CalendarDays,
  Eye,
  EyeOff,
  Home,
  Mail,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { Gender, HomeStatus } from "@/types/schemas";

type SettingsProfile = {
  username: string | null;
  first_name: string | null;
  is_visible: boolean | null;
  is_verified: boolean | null;
  profile_status: string | null;
  created_at: string | null;
};

type SettingsPreferences = {
  budget_min: number | null;
  budget_max: number | null;
  move_in_from: string | null;
  move_in_to: string | null;
  preferred_gender: Gender | null;
  min_age: number | null;
  max_age: number | null;
  smoking_preference: string | null;
  pets_preference: string | null;
  match_with_home_seekers: boolean;
};

type SettingsHome = {
  id: string;
  status: HomeStatus | null;
};

const genderLabels: Record<Gender, string> = {
  male: "Men",
  female: "Women",
  non_binary: "Non-binary",
  prefer_not_to_say: "Prefer not to say",
};

function formatDate(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(new Date(value));
}

function formatBudget(min: number | null, max: number | null) {
  if (min === null && max === null) return "Not set";
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });
  const lower = min === null ? "Any" : formatter.format(min);
  const upper = max === null ? "Any" : formatter.format(max);
  return `${lower} – ${upper}`;
}

function formatAgeRange(min: number | null, max: number | null) {
  if (min === null && max === null) return "Any age";
  return `${min ?? "Any"}–${max ?? "Any"}`;
}

export function SettingsPage({
  userId,
  email,
  emailConfirmed,
  joinedAt,
  profile,
  preferences,
  homes,
}: {
  userId: string;
  email: string | null;
  emailConfirmed: boolean;
  joinedAt: string;
  profile: SettingsProfile;
  preferences: SettingsPreferences | null;
  homes: SettingsHome[];
}) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(profile.is_visible ?? true);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [error, setError] = useState("");
  const activeHomeCount = homes.filter((home) => home.status === "active").length;

  async function updateVisibility(nextValue: boolean) {
    setSavingVisibility(true);
    setError("");

    const { error: updateError } = await createClient()
      .from("profiles")
      .update({ is_visible: nextValue })
      .eq("id", userId)
      .select("id")
      .single();

    if (updateError) {
      setError("Unable to update your profile visibility. Please try again.");
    } else {
      setIsVisible(nextValue);
      router.refresh();
    }
    setSavingVisibility(false);
  }

  async function deleteAccount() {
    setDeleting(true);
    setError("");
    const supabase = createClient();
    const { error: deleteError } = await supabase.functions.invoke("delete-account", {
      body: { confirmation: "DELETE" },
    });

    if (deleteError) {
      setError("Unable to delete your account. Please try again or contact support.");
      setDeleting(false);
      closeDeleteDialog();
      return;
    }

    await supabase.auth.signOut({ scope: "local" });
    window.location.assign("/");
  }

  function closeDeleteDialog() {
    setShowDeleteDialog(false);
    setDeleteConfirmation("");
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Your account</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Manage your visibility, review your account details, and control what happens to your
          RoomeyFinder data.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-brand-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isVisible ? <Eye /> : <EyeOff />} Profile visibility
            </CardTitle>
            <CardDescription>
              Control whether your active profile can appear in discovery and matching.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 rounded-brand-md bg-secondary/50 p-4">
              <div>
                <p className="font-semibold">
                  {isVisible ? "Visible to matches" : "Hidden from matches"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isVisible
                    ? "People who fit your matching criteria can discover you."
                    : "You will not appear in new discovery results until you turn this back on."}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isVisible}
                aria-label="Make my profile visible"
                disabled={savingVisibility || deleting}
                onClick={() => void updateVisibility(!isVisible)}
                className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isVisible ? "justify-end bg-brand" : "justify-start bg-muted-foreground/30"}`}
              >
                <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Your profile must also be active and complete to appear in discovery.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound /> Account information
            </CardTitle>
            <CardDescription>Details connected to your RoomeyFinder account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <InfoRow icon={Mail} label="Email" value={email ?? "Not available"}>
              {emailConfirmed ? <Badge variant="secondary">Verified</Badge> : null}
            </InfoRow>
            <InfoRow icon={UserRound} label="Name" value={profile.first_name ?? "Not set"} />
            <InfoRow
              icon={UserRound}
              label="Username"
              value={profile.username ? `@${profile.username}` : "Not set"}
            />
            <InfoRow icon={CalendarDays} label="Member since" value={formatDate(joinedAt)} />
            <InfoRow
              icon={ShieldCheck}
              label="Account status"
              value={profile.profile_status ?? "Not set"}
            >
              {profile.is_verified ? <Badge variant="secondary">Verified profile</Badge> : null}
            </InfoRow>
            <InfoRow
              icon={profile.is_visible ? Eye : EyeOff}
              label="Discovery visibility"
              value={profile.is_visible ? "Visible" : "Hidden"}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal /> Your matching details
            </CardTitle>
            <CardDescription>
              These preferences help determine who appears in your matches.
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href="/setup?step=preferences">Manage preferences</Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Preferred gender">
            {preferences?.preferred_gender
              ? genderLabels[preferences.preferred_gender]
              : "Any gender"}
          </Detail>
          <Detail label="Preferred age">
            {formatAgeRange(preferences?.min_age ?? null, preferences?.max_age ?? null)}
          </Detail>
          <Detail label="Budget">
            {formatBudget(preferences?.budget_min ?? null, preferences?.budget_max ?? null)}
          </Detail>
          <Detail label="Move-in window">
            {preferences?.move_in_from && preferences.move_in_to
              ? `${formatDate(preferences.move_in_from)} – ${formatDate(preferences.move_in_to)}`
              : "Not set"}
          </Detail>
          <Detail label="Smoking">{preferences?.smoking_preference ?? "Not set"}</Detail>
          <Detail label="Pets">{preferences?.pets_preference ?? "Not set"}</Detail>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home /> Your homes
            </CardTitle>
            <CardDescription>A quick summary of your home listings.</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href="/setup?step=home">Manage homes</Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <Badge variant="outline">
            {homes.length} total home{homes.length === 1 ? "" : "s"}
          </Badge>
          <Badge variant="outline">
            {activeHomeCount} active home{activeHomeCount === 1 ? "" : "s"}
          </Badge>
        </CardContent>
      </Card>

      <Card className="mt-6 border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription>
            Permanently delete your account, profile, homes, photos, matches, and related data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            disabled={deleting || savingVisibility}
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 /> Delete my account
          </Button>
        </CardContent>
      </Card>

      {showDeleteDialog ? (
        <DeleteAccountDialog
          deleting={deleting}
          confirmation={deleteConfirmation}
          onCancel={closeDeleteDialog}
          onConfirmationChange={setDeleteConfirmation}
          onConfirm={() => void deleteAccount()}
        />
      ) : null}
    </div>
  );
}

function DeleteAccountDialog({
  deleting,
  confirmation,
  onCancel,
  onConfirmationChange,
  onConfirm,
}: {
  deleting: boolean;
  confirmation: string;
  onCancel: () => void;
  onConfirmationChange: (value: string) => void;
  onConfirm: () => void;
}) {
  const canConfirm = confirmation.trim() === "DELETE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/10 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-description"
    >
      <Card className="w-full max-w-lg border-destructive/30">
        <CardHeader>
          <CardTitle id="delete-account-title" className="text-destructive">
            Delete your account?
          </CardTitle>
          <CardDescription id="delete-account-description" className="leading-6">
            This permanently removes your profile, homes, photos, interests, matches, and related
            account data. Interests involving you will no longer appear to other members. This
            action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-brand-md bg-destructive/5 p-4 text-sm text-destructive">
            Your account data and uploaded photos will be permanently deleted, and you will be
            signed out immediately.
          </p>
          <div className="space-y-2">
            <label htmlFor="delete-account-confirmation" className="text-sm font-semibold">
              Type DELETE to confirm
            </label>
            <Input
              id="delete-account-confirmation"
              value={confirmation}
              onChange={(event) => onConfirmationChange(event.target.value)}
              autoComplete="off"
              autoFocus
              disabled={deleting}
              placeholder="DELETE"
              spellCheck={false}
              aria-describedby="delete-account-description"
            />
          </div>
        </CardContent>
        <div className="flex flex-col-reverse gap-3 p-6 pt-0 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={deleting} onClick={onCancel}>
            Keep my account
          </Button>
          <Button variant="destructive" disabled={deleting || !canConfirm} onClick={onConfirm}>
            <Trash2 /> {deleting ? "Deleting account..." : "Delete permanently"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="flex flex-wrap items-center justify-end gap-2 text-right font-medium text-foreground">
        {value}
        {children}
      </span>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-brand-md bg-secondary/40 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold capitalize">{children}</p>
    </div>
  );
}
