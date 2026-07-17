import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

function getAppOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (!host) {
    return request.nextUrl.origin;
  }

  return `${forwardedProto ?? request.nextUrl.protocol.replace(":", "")}://${host}`;
}

export async function POST(request: NextRequest) {
  let email: unknown;

  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  // Do not send a one-time token directly to the verification endpoint. Email
  // clients and security scanners may prefetch links, which would consume it
  // before the user gets a chance to click it.
  const callbackUrl = new URL("/auth/verify", getAppOrigin(request));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    // Keep the response generic so Auth configuration details are not exposed
    // to visitors, but preserve enough context in the server log to diagnose
    // provider, redirect, and rate-limit failures.
    console.error("Unable to send Supabase magic link:", {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
    });
    return NextResponse.json(
      { error: "Unable to send the magic link. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Magic link sent" });
}
