import { redirect } from "next/navigation";
import { Suspense } from "react";

import { MatchesPage } from "@/components/matches-page";
import { FlowLoading } from "@/components/roommate-flow/shared";
import { createClient } from "@/lib/supabase/server";

export default function MatchesRoute() {
  return (
    <Suspense fallback={<FlowLoading />}>
      <MatchesContent />
    </Suspense>
  );
}

async function MatchesContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string") redirect("/auth/login");

  return <MatchesPage userId={userId} />;
}
