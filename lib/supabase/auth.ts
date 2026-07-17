import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** Require a verified Supabase session for protected server routes. */
export async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string") {
    redirect("/");
  }

  return { supabase, userId };
}
