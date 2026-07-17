import type { Database } from "@/types/database";

export type InterestStatus = Database["public"]["Enums"]["interest_status"];

export type InterestWithProfile = Database["public"]["Tables"]["interests"]["Row"] & {
  from_profile: PublicProfile | null;
  to_profile: PublicProfile | null;
};

export type PublicProfile = {
  first_name: string | null;
  username: string | null;
  bio: string | null;
  occupation: string | null;
  gender: Database["public"]["Enums"]["gender_type"] | null;
  photo_url?: string | null;
};

export async function getUserInterests(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
) {
  const { data, error } = await supabase
    .from("interests")
    .select(
      "*, from_profile:profiles!interests_from_profile_id_fkey(first_name, username, bio, occupation, gender), to_profile:profiles!interests_to_profile_id_fkey(first_name, username, bio, occupation, gender)",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const items = (data ?? []) as InterestWithProfile[];
  const profileIds = [
    ...new Set(items.flatMap((item) => [item.from_profile_id, item.to_profile_id])),
  ];
  const { data: photos } = await supabase
    .from("profile_photos")
    .select("user_id, storage_path")
    .in("user_id", profileIds)
    .eq("is_primary", true);
  const photoUrls = new Map<string, string>();
  await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from("profile-photos")
        .createSignedUrl(photo.storage_path, 60 * 60);
      if (signed?.signedUrl) photoUrls.set(photo.user_id, signed.signedUrl);
    }),
  );
  return items.map((item) => ({
    ...item,
    from_profile: item.from_profile && {
      ...item.from_profile,
      photo_url: photoUrls.get(item.from_profile_id) ?? null,
    },
    to_profile: item.to_profile && {
      ...item.to_profile,
      photo_url: photoUrls.get(item.to_profile_id) ?? null,
    },
  }));
}
