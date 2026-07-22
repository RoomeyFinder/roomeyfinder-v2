import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

function env(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getAdminKey() {
  const legacyKey =
    Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacyKey) return legacyKey;

  const configuredKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (configuredKeys) {
    const keys = JSON.parse(configuredKeys) as Record<string, string>;
    const defaultKey = keys.default ?? Object.values(keys)[0];
    if (defaultKey) return defaultKey;
  }

  throw new Error("Supabase did not provide an admin secret key");
}

async function getStoragePaths(admin: SupabaseClient, userId: string) {
  const { data: profilePhotos, error: profileError } = await admin
    .from("profile_photos")
    .select("storage_path")
    .eq("user_id", userId);
  if (profileError) throw profileError;

  const { data: homes, error: homesError } = await admin
    .from("homes")
    .select("id")
    .eq("owner_id", userId);
  if (homesError) throw homesError;

  const homeIds = (homes ?? []).map((home) => home.id as string);
  let homePhotos: Array<{ storage_path: string }> = [];

  if (homeIds.length > 0) {
    const { data, error: homePhotosError } = await admin
      .from("home_photos")
      .select("storage_path")
      .in("home_id", homeIds);
    if (homePhotosError) throw homePhotosError;
    homePhotos = (data ?? []) as Array<{ storage_path: string }>;
  }

  return {
    profile: (profilePhotos ?? []).map((photo) => photo.storage_path as string),
    home: homePhotos.map((photo) => photo.storage_path),
  };
}

async function removeStoragePaths(admin: SupabaseClient, bucket: string, paths: string[]) {
  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await admin.storage.from(bucket).remove(paths.slice(index, index + 100));
    if (error) throw error;
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const authorization = request.headers.get("Authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return Response.json({ error: "Authentication required" }, { status: 401 });

  try {
    const body = (await request.json().catch(() => null)) as { confirmation?: string } | null;
    if (body?.confirmation !== "DELETE") {
      return Response.json({ error: "Confirmation required" }, { status: 400 });
    }

    const admin = createClient(env("SUPABASE_URL"), getAdminKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return Response.json({ error: "Invalid authentication" }, { status: 401 });
    }

    const storagePaths = await getStoragePaths(admin, userData.user.id);
    // Remove Storage objects first. Auth deletion cascades through the metadata
    // tables, so deleting Auth first could leave orphaned files if Storage
    // cleanup fails and the request cannot be retried safely.
    await removeStoragePaths(admin, "profile-photos", storagePaths.profile);
    await removeStoragePaths(admin, "home-photos", storagePaths.home);

    const { error: revokeError } = await admin.auth.admin.signOut(token, "global");
    if (revokeError) throw revokeError;

    const { error: deleteError } = await admin.auth.admin.deleteUser(userData.user.id, false);
    if (deleteError) throw deleteError;

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Unable to delete account:", error);
    return Response.json({ error: "Unable to delete account" }, { status: 500 });
  }
});
