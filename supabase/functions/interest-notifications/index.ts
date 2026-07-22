import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js";

type InterestRecord = {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  status: "pending" | "accepted" | "declined";
};

type DatabaseWebhookPayload = {
  type: "INSERT" | "UPDATE";
  table: "interests";
  schema: "public";
  record: InterestRecord;
  old_record: InterestRecord | null;
};

type Notification = {
  eventType: "new_request" | "accepted_request";
  interestId: string;
  recipientProfileId: string;
  actorProfileId: string;
};

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

function getNotification(payload: DatabaseWebhookPayload): Notification | null {
  if (payload.type === "INSERT" && payload.record.status === "pending") {
    return {
      eventType: "new_request",
      interestId: payload.record.id,
      recipientProfileId: payload.record.to_profile_id,
      actorProfileId: payload.record.from_profile_id,
    };
  }

  if (
    payload.type === "UPDATE" &&
    payload.old_record?.status === "pending" &&
    payload.record.status === "accepted"
  ) {
    return {
      eventType: "accepted_request",
      interestId: payload.record.id,
      recipientProfileId: payload.record.from_profile_id,
      actorProfileId: payload.record.to_profile_id,
    };
  }

  return null;
}

async function claimEvent(admin: SupabaseClient, notification: Notification) {
  const { data: inserted, error: insertError } = await admin
    .from("interest_notification_events")
    .insert({
      interest_id: notification.interestId,
      event_type: notification.eventType,
      recipient_profile_id: notification.recipientProfileId,
    })
    .select("id, status")
    .maybeSingle();

  let event = inserted;
  if (insertError) {
    if (insertError.code !== "23505") throw insertError;

    const { data: existing, error: existingError } = await admin
      .from("interest_notification_events")
      .select("id, status")
      .eq("interest_id", notification.interestId)
      .eq("event_type", notification.eventType)
      .single();
    if (existingError) throw existingError;
    if (existing.status === "sent" || existing.status === "processing") return null;
    event = existing;
  }

  if (!event) throw new Error("Unable to create notification event");

  const { data: claimed, error: claimError } = await admin
    .from("interest_notification_events")
    .update({
      status: "processing",
      attempts: (event.status === "failed" ? 1 : 0) + 1,
      last_error: null,
    })
    .eq("id", event.id)
    .in("status", ["pending", "failed"])
    .select("id")
    .maybeSingle();

  if (claimError) throw claimError;
  return claimed?.id ?? null;
}

async function sendNotification(
  admin: SupabaseClient,
  notification: Notification,
  eventId: string,
) {
  const [{ data: recipient, error: recipientError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      admin.auth.admin.getUserById(notification.recipientProfileId),
      admin
        .from("profiles")
        .select("id, username")
        .in("id", [notification.recipientProfileId, notification.actorProfileId]),
    ]);

  if (recipientError) throw recipientError;
  if (profilesError) throw profilesError;
  const recipientUser = recipient.user;
  if (!recipientUser?.email) {
    await admin
      .from("interest_notification_events")
      .update({ status: "sent", sent_at: new Date().toISOString(), last_error: "No email address" })
      .eq("id", eventId);
    return { skipped: true };
  }

  const actorUsername =
    profiles?.find((profile) => profile.id === notification.actorProfileId)?.username ??
    "A RoomeyFinder user";
  const appUrl = env("APP_URL").replace(/\/$/, "");
  const interestsUrl = `${appUrl}/interests`;
  const isAccepted = notification.eventType === "accepted_request";
  const subject = isAccepted
    ? "Your RoomeyFinder interest was accepted"
    : "You have a new interest on RoomeyFinder";
  const message = isAccepted
    ? `@${actorUsername} accepted your interest. Open RoomeyFinder to view your connection.`
    : `@${actorUsername} is interested in connecting with you. Open RoomeyFinder to review their request.`;
  const safeMessage = escapeHtml(message);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env("INACTIVITY_FROM_EMAIL"),
      to: [recipientUser.email],
      subject,
      text: `${message}\n\n${interestsUrl}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px">
        <h2>${escapeHtml(subject)}</h2>
        <p>${safeMessage}</p>
        <p><a href="${escapeHtml(interestsUrl)}">Review it on RoomeyFinder</a></p>
      </div>`,
    }),
  });

  const result = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok) {
    throw new Error(result.message ?? `Resend returned ${response.status}`);
  }

  await admin
    .from("interest_notification_events")
    .update({
      status: "sent",
      provider_id: result.id ?? null,
      sent_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("id", eventId);
  return { skipped: false };
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  if (
    request.headers.get("x-interest-notification-secret") !==
    env("INTEREST_NOTIFICATION_WEBHOOK_SECRET")
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = (await request.json()) as DatabaseWebhookPayload;
    if (payload.schema !== "public" || payload.table !== "interests" || !payload.record) {
      return Response.json({ ok: true, skipped: "unsupported_payload" });
    }

    const notification = getNotification(payload);
    if (!notification) return Response.json({ ok: true, skipped: "not_notifiable" });

    const supabaseUrl = env("SUPABASE_URL");
    const admin = createClient(supabaseUrl, getAdminKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const eventId = await claimEvent(admin, notification);
    if (!eventId) return Response.json({ ok: true, skipped: "already_processing_or_sent" });

    try {
      return Response.json({
        ok: true,
        result: await sendNotification(admin, notification, eventId),
      });
    } catch (error) {
      await admin
        .from("interest_notification_events")
        .update({
          status: "failed",
          last_error: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", eventId);
      throw error;
    }
  } catch (error) {
    console.error("Interest notification failed:", error);
    return Response.json({ ok: false, error: "Interest notification failed" }, { status: 500 });
  }
});
