import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

type LifecycleStage = "three_months" | "one_month" | "seven_days" | "twenty_four_hours";

type LifecycleRecord = {
  user_id: string;
  cycle_started_at: string;
  last_warning_stage: LifecycleStage | null;
  pending_deletion: boolean;
  deactivated_by_inactivity: boolean;
  final_notice_sent_at: string | null;
};

const STAGE_LABELS: Record<LifecycleStage, string> = {
  three_months: "3 months",
  one_month: "1 month",
  seven_days: "7 days",
  twenty_four_hours: "24 hours",
};

const STAGE_RANK: Record<LifecycleStage, number> = {
  three_months: 1,
  one_month: 2,
  seven_days: 3,
  twenty_four_hours: 4,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function env(name: string, required = true) {
  const value = Deno.env.get(name)?.trim();

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value ?? "";
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

function isEnabled(name: string) {
  return Deno.env.get(name)?.toLowerCase() === "true";
}

function addCalendarMonths(value: Date, months: number) {
  const year = value.getUTCFullYear();
  const month = value.getUTCMonth() + months;
  const day = value.getUTCDate();
  const hour = value.getUTCHours();
  const minute = value.getUTCMinutes();
  const second = value.getUTCSeconds();
  const millisecond = value.getUTCMilliseconds();
  const target = new Date(Date.UTC(year, month, 1, hour, minute, second, millisecond));
  const lastDayOfTargetMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();

  target.setUTCDate(Math.min(day, lastDayOfTargetMonth));
  return target;
}

function getDeadline(cycleStartedAt: Date) {
  return addCalendarMonths(cycleStartedAt, 6);
}

function getDueStage(now: Date, cycleStartedAt: Date) {
  const deadline = getDeadline(cycleStartedAt);
  const thresholds: Array<{ stage: LifecycleStage; at: Date }> = [
    { stage: "three_months", at: addCalendarMonths(cycleStartedAt, 3) },
    { stage: "one_month", at: addCalendarMonths(cycleStartedAt, 5) },
    { stage: "seven_days", at: new Date(deadline.getTime() - 7 * MS_PER_DAY) },
    { stage: "twenty_four_hours", at: new Date(deadline.getTime() - MS_PER_DAY) },
  ];

  return {
    deadline,
    stage: thresholds.filter(({ at }) => now >= at).at(-1)?.stage ?? null,
  };
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

function getDisplayName(user: User) {
  const metadataName = user.user_metadata?.first_name;
  return typeof metadataName === "string" && metadataName.trim() ? metadataName.trim() : "there";
}

async function sendEmail(
  user: User,
  subject: string,
  title: string,
  message: string,
  appUrl: string,
) {
  const resendApiKey = env("RESEND_API_KEY");
  const fromEmail = env("INACTIVITY_FROM_EMAIL");
  const displayName = escapeHtml(getDisplayName(user));
  const safeMessage = escapeHtml(message);
  const signInUrl = `${appUrl.replace(/\/$/, "")}/auth/login`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [user.email],
      subject,
      text: `Hi ${getDisplayName(user)},\n\n${message}\n\nSign in at ${signInUrl}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px">
        <h2>${title}</h2>
        <p>Hi ${displayName},</p>
        <p>${safeMessage}</p>
        <p><a href="${signInUrl}">Sign in to RoomeyFinder</a> to keep your account and profile active.</p>
      </div>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email provider returned ${response.status}: ${await response.text()}`);
  }
}

async function getLifecycle(admin: SupabaseClient, userId: string, cycleStartedAt: Date) {
  const { data, error } = await admin
    .from("account_inactivity")
    .select(
      "user_id, cycle_started_at, last_warning_stage, pending_deletion, deactivated_by_inactivity, final_notice_sent_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    const { data: inserted, error: insertError } = await admin
      .from("account_inactivity")
      .insert({
        user_id: userId,
        cycle_started_at: cycleStartedAt.toISOString(),
      })
      .select(
        "user_id, cycle_started_at, last_warning_stage, pending_deletion, deactivated_by_inactivity, final_notice_sent_at",
      )
      .single();

    if (insertError) {
      throw insertError;
    }

    return inserted as LifecycleRecord;
  }

  return data as LifecycleRecord;
}

async function updateLifecycle(
  admin: SupabaseClient,
  userId: string,
  values: Partial<LifecycleRecord>,
) {
  const { error } = await admin.from("account_inactivity").update(values).eq("user_id", userId);

  if (error) {
    throw error;
  }
}

async function restoreProfileIfNeeded(admin: SupabaseClient, userId: string) {
  const { error } = await admin
    .from("profiles")
    .update({ profile_status: "active" })
    .eq("id", userId)
    .eq("profile_status", "archived");

  if (error) {
    throw error;
  }
}

async function archiveProfile(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin
    .from("profiles")
    .update({ profile_status: "archived" })
    .eq("id", userId)
    .eq("profile_status", "active")
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function collectStoragePaths(admin: SupabaseClient, userId: string) {
  const { data: profilePhotos, error: profilePhotosError } = await admin
    .from("profile_photos")
    .select("storage_path")
    .eq("user_id", userId);

  if (profilePhotosError) {
    throw profilePhotosError;
  }

  const { data: homes, error: homesError } = await admin
    .from("homes")
    .select("id")
    .eq("owner_id", userId);

  if (homesError) {
    throw homesError;
  }

  const homeIds = (homes ?? []).map((home) => home.id as string);
  let homePhotos: Array<{ storage_path: string }> = [];

  if (homeIds.length > 0) {
    const { data, error } = await admin
      .from("home_photos")
      .select("storage_path")
      .in("home_id", homeIds);

    if (error) {
      throw error;
    }

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

    if (error) {
      console.error("Unable to remove account storage objects:", { bucket, error });
    }
  }
}

async function deleteAccount(admin: SupabaseClient, user: User) {
  const storagePaths = await collectStoragePaths(admin, user.id);

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id, false);
  if (deleteError) {
    throw deleteError;
  }

  await removeStoragePaths(admin, "profile-photos", storagePaths.profile);
  await removeStoragePaths(admin, "home-photos", storagePaths.home);
}

async function processUser(
  admin: SupabaseClient,
  user: User,
  now: Date,
  appUrl: string,
  dryRun: boolean,
  allowDeletion: boolean,
) {
  if (!user.email) {
    return { action: "skipped-no-email" };
  }

  const activityValue = user.last_sign_in_at ?? user.created_at;
  const activityDate = new Date(activityValue);
  if (Number.isNaN(activityDate.getTime())) {
    return { action: "skipped-invalid-date" };
  }

  let lifecycle = await getLifecycle(admin, user.id, activityDate);
  const recordedCycle = new Date(lifecycle.cycle_started_at);

  // A successful sign-in outside the app callback still resets the cycle.
  // A small tolerance avoids treating callback timestamps as a new cycle.
  if (
    Number.isNaN(recordedCycle.getTime()) ||
    Math.abs(recordedCycle.getTime() - activityDate.getTime()) > 5 * 60 * 1000
  ) {
    if (!dryRun && lifecycle.deactivated_by_inactivity) {
      await restoreProfileIfNeeded(admin, user.id);
    }

    if (dryRun) {
      return { action: "would-reset" };
    }

    await updateLifecycle(admin, user.id, {
      cycle_started_at: activityDate.toISOString(),
      last_warning_stage: null,
      pending_deletion: false,
      deactivated_by_inactivity: false,
      final_notice_sent_at: null,
    });

    lifecycle = {
      ...lifecycle,
      cycle_started_at: activityDate.toISOString(),
      last_warning_stage: null,
      pending_deletion: false,
      deactivated_by_inactivity: false,
      final_notice_sent_at: null,
    };
  }

  const { deadline, stage } = getDueStage(now, activityDate);

  if (now >= deadline) {
    if (!lifecycle.final_notice_sent_at) {
      if (!dryRun) {
        await sendEmail(
          user,
          "Your RoomeyFinder account has reached its deletion date",
          "Your account is being deleted",
          "Your RoomeyFinder account and associated data have reached the six-month inactivity limit and will now be deleted.",
          appUrl,
        );
        await updateLifecycle(admin, user.id, {
          pending_deletion: true,
          final_notice_sent_at: now.toISOString(),
        });
      }
    }

    if (dryRun || !allowDeletion) {
      return { action: dryRun ? "would-delete" : "deletion-disabled" };
    }

    // Re-read Auth immediately before deletion to avoid deleting someone who
    // signed in while this batch was running.
    const { data: latestUser, error: latestUserError } = await admin.auth.admin.getUserById(
      user.id,
    );
    if (latestUserError) {
      throw latestUserError;
    }

    const latestActivity = new Date(latestUser.user.last_sign_in_at ?? latestUser.user.created_at);
    if (latestActivity.getTime() !== activityDate.getTime()) {
      return { action: "sign-in-detected-before-delete" };
    }

    await deleteAccount(admin, latestUser.user);
    return { action: "deleted" };
  }

  if (
    !stage ||
    STAGE_RANK[stage] <=
      (lifecycle.last_warning_stage ? STAGE_RANK[lifecycle.last_warning_stage] : 0)
  ) {
    return { action: "unchanged" };
  }

  if (dryRun) {
    return { action: `would-notify-${stage}` };
  }

  const deactivatedByInactivity =
    stage === "three_months"
      ? await archiveProfile(admin, user.id)
      : lifecycle.deactivated_by_inactivity;

  await sendEmail(
    user,
    `${STAGE_LABELS[stage]} left to keep your RoomeyFinder account`,
    `Your account will be deleted in ${STAGE_LABELS[stage]}`,
    `You have not signed in for a while. Please sign in within ${STAGE_LABELS[stage]} to keep your account, profile, and matching data.`,
    appUrl,
  );
  await updateLifecycle(admin, user.id, {
    last_warning_stage: stage,
    pending_deletion: true,
    deactivated_by_inactivity: deactivatedByInactivity,
  });

  return { action: `notified-${stage}` };
}

async function run() {
  const supabaseUrl = env("SUPABASE_URL");
  const admin = createClient(supabaseUrl, getAdminKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const now = new Date();
  const appUrl = env("APP_URL");
  const dryRun = isEnabled("ACCOUNT_INACTIVITY_DRY_RUN");
  const allowDeletion = isEnabled("ACCOUNT_INACTIVITY_ALLOW_DELETION");
  const summary: Record<string, number> = {};

  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      throw error;
    }

    for (const user of data.users) {
      try {
        const result = await processUser(admin, user, now, appUrl, dryRun, allowDeletion);
        summary[result.action] = (summary[result.action] ?? 0) + 1;
      } catch (error) {
        console.error("Unable to process account inactivity:", {
          userId: user.id,
          error,
        });
        summary.errors = (summary.errors ?? 0) + 1;
      }
    }

    if (data.users.length < 1000) {
      break;
    }
  }

  return summary;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const configuredSecret = env("ACCOUNT_INACTIVITY_CRON_SECRET");
  if (request.headers.get("x-account-inactivity-secret") !== configuredSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    return Response.json({ ok: true, summary: await run() });
  } catch (error) {
    console.error("Account inactivity job failed:", error);
    return Response.json({ ok: false, error: "Account inactivity job failed" }, { status: 500 });
  }
});
