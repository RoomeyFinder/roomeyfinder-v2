import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Home, Pencil, Settings2, UserRound } from "lucide-react";

import { InterestButton } from "@/components/interest-button";
import { createClient } from "@/lib/supabase/server";

const tabs = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "preferences", label: "Preferences", icon: Settings2 },
  { id: "home", label: "Home", icon: Home },
] as const;

type Tab = (typeof tabs)[number]["id"];

function isTab(value: string | undefined): value is Tab {
  return tabs.some((tab) => tab.id === value);
}

function formatValue(value: string | number | null | undefined, fallback = "Not added yet") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{formatValue(value)}</dd>
    </div>
  );
}

async function ProfileContent({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ username }, { tab: requestedTab }] = await Promise.all([params, searchParams]);
  const activeTab = isTab(requestedTab) ? requestedTab : "profile";
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const viewerId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, first_name, gender, occupation, bio, is_verified")
    .ilike("username", username)
    .maybeSingle();
  if (!profile) notFound();

  const isOwner = viewerId === profile.id;
  const [
    { data: photo },
    { data: privateProfile },
    { data: preferences },
    { data: home },
    { data: existingInterestRows },
  ] = await Promise.all([
    supabase
      .from("profile_photos")
      .select("storage_path")
      .eq("user_id", profile.id)
      .eq("is_primary", true)
      .maybeSingle(),
    isOwner
      ? supabase
        .from("profile_private")
        .select("last_name, date_of_birth")
        .eq("profile_id", profile.id)
        .maybeSingle()
      : Promise.resolve({ data: null }),
    isOwner
      ? supabase
        .from("preferences")
        .select(
          "max_distance_miles, budget_min, budget_max, move_in_from, move_in_to, preferred_gender, min_age, max_age, smoking_preference, pets_preference, match_with_home_seekers",
        )
        .eq("user_id", profile.id)
        .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("homes")
      .select(
        "title, description, city, state, country, rent, deposit, bedrooms, bathrooms, available_from, status",
      )
      .eq("owner_id", profile.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    !isOwner && viewerId
      ? supabase
        .from("interests")
        .select("id, status, from_profile_id")
        .or(
          `and(from_profile_id.eq.${viewerId},to_profile_id.eq.${profile.id}),and(from_profile_id.eq.${profile.id},to_profile_id.eq.${viewerId})`,
        )
        .order("created_at", { ascending: false })
        .limit(1)
      : Promise.resolve({ data: null }),
  ]);
  const existingInterest = existingInterestRows?.[0] ?? null;
  const isConnected = existingInterest?.status === "accepted";
  const { data: connectedContacts } = isConnected && viewerId
    ? await supabase.from("profile_contacts").select("profile_id, contact_email, contact_phone").in("profile_id", [viewerId, profile.id])
    : { data: null };
  const photoUrl = photo?.storage_path
    ? (await supabase.storage.from("profile-photos").createSignedUrl(photo.storage_path, 60 * 60))
      .data?.signedUrl
    : null;
  const editHref = `/setup?step=${activeTab}`;

  return (
    <main className="mx-auto w-full max-w-3xl py-2">
      <section className="overflow-hidden rounded-brand-md border bg-card shadow-ring">
        <div className="flex flex-col gap-5 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt=""
                width={88}
                height={88}
                className="h-22 w-22 rounded-full object-cover"
              />
            ) : (
              <div className="h-[88px] w-[88px] rounded-full bg-secondary" />
            )}
            <div>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              <h1 className="text-2xl font-bold">
                {formatValue(profile.first_name, profile.username ?? undefined)}
              </h1>
              {profile.occupation ? (
                <p className="text-muted-foreground">{profile.occupation}</p>
              ) : null}
            </div>
          </div>
          {isOwner ? (
            <Link
              href={editHref}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-brand-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <Pencil className="h-4 w-4" /> Edit {activeTab}
            </Link>
          ) : viewerId ? (
            <InterestButton
              viewerId={viewerId}
              profileId={profile.id}
              interestId={existingInterest?.id ?? null}
              initialStatus={existingInterest?.status ?? null}
              isIncoming={existingInterest?.from_profile_id === profile.id}
            />
          ) : null}
        </div>

        {isConnected ? <ConnectedDetails contacts={connectedContacts ?? []} viewerId={viewerId} profileId={profile.id} /> : null}

        <nav className="grid grid-cols-3 border-b" aria-label="Profile sections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={`/${profile.username}?tab=${id}`}
              className={`flex items-center justify-center gap-2 border-b-2 px-3 py-4 text-sm font-medium ${activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-6">
          {activeTab === "profile" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">
                  About {isOwner ? "you" : profile.first_name || "this person"}
                </h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {formatValue(profile.bio, "No bio added yet.")}
                </p>
              </div>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field label="Occupation" value={profile.occupation} />
                <Field label="Gender" value={profile.gender} />
                {isOwner ? (
                  <>
                    <Field label="Last name" value={privateProfile?.last_name} />
                    <Field label="Date of birth" value={privateProfile?.date_of_birth} />
                  </>
                ) : null}
              </dl>
            </div>
          ) : null}
          {activeTab === "preferences" ? (
            <div>
              <h2 className="text-lg font-semibold">
                {isOwner ? "Your preferences" : "Preferences"}
              </h2>
              {isOwner && preferences ? (
                <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Budget"
                    value={
                      preferences.budget_min != null || preferences.budget_max != null
                        ? `${formatValue(preferences.budget_min, "Any")} – ${formatValue(preferences.budget_max, "Any")}`
                        : null
                    }
                  />
                  <Field
                    label="Move-in window"
                    value={
                      preferences.move_in_from && preferences.move_in_to
                        ? `${preferences.move_in_from} to ${preferences.move_in_to}`
                        : null
                    }
                  />
                  <Field label="Preferred gender" value={preferences.preferred_gender} />
                  <Field
                    label="Age range"
                    value={
                      preferences.min_age != null || preferences.max_age != null
                        ? `${formatValue(preferences.min_age, "Any")} – ${formatValue(preferences.max_age, "Any")}`
                        : null
                    }
                  />
                  <Field label="Smoking" value={preferences.smoking_preference} />
                  <Field label="Pets" value={preferences.pets_preference} />
                </dl>
              ) : (
                <p className="mt-2 text-muted-foreground">
                  Preferences are private to the account owner.
                </p>
              )}
            </div>
          ) : null}
          {activeTab === "home" ? (
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {home?.title || (isOwner ? "Your home plan" : "Home")}
                </h2>
                {home?.status ? (
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                    {home.status}
                  </span>
                ) : null}
              </div>
              {home ? (
                <>
                  <p className="mt-2 text-muted-foreground">{formatValue(home.description)}</p>
                  <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Location"
                      value={[home.city, home.state, home.country].filter(Boolean).join(", ")}
                    />
                    <Field label="Rent" value={home.rent != null ? `${home.rent}` : null} />
                    <Field label="Bedrooms" value={home.bedrooms} />
                    <Field label="Bathrooms" value={home.bathrooms} />
                    <Field label="Available from" value={home.available_from} />
                  </dl>
                </>
              ) : (
                <p className="mt-2 text-muted-foreground">
                  {isOwner ? "You have not added a home yet." : "No active home listed."}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function ConnectedDetails({
  contacts,
  viewerId,
  profileId,
}: {
  contacts: Array<{ profile_id: string; contact_email: string | null; contact_phone: string | null }>;
  viewerId: string | null;
  profileId: string;
}) {
  const viewerContact = contacts.find((contact) => contact.profile_id === viewerId);
  const otherContact = contacts.find((contact) => contact.profile_id === profileId);

  return (
    <div className="border-b bg-emerald-50/70 px-6 py-4 dark:bg-emerald-950/20">
      <p className="font-semibold text-emerald-800 dark:text-emerald-200">Connected profile</p>
      <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">You both accepted this connection. Contact details are now visible to both of you.</p>
      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <ContactItem label="Your contact" contact={viewerContact} />
        <ContactItem label="Their contact" contact={otherContact} />
      </div>
    </div>
  );
}

function ContactItem({
  label,
  contact,
}: {
  label: string;
  contact: { contact_email: string | null; contact_phone: string | null } | undefined;
}) {
  const value = contact?.contact_email ?? contact?.contact_phone;
  return <div><p className="font-medium text-foreground">{label}</p><p className="break-all text-muted-foreground">{value ?? "No contact details added yet."}</p></div>;
}

export default function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <Suspense fallback={<main className="mx-auto w-full max-w-3xl py-2" />}>
      <ProfileContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
