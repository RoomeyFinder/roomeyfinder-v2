import { Suspense } from "react";

import { MatchesPage } from "@/components/matches-page";
import { FlowLoading } from "@/components/roommate-flow/shared";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

export default function MatchesRoute() {
  return (
    <Suspense fallback={<FlowLoading />}>
      <MatchesContent />
    </Suspense>
  );
}

async function MatchesContent() {
  const { userId } = await requireAuthenticatedUser();

  return < MatchesPage userId={userId} />;
}
