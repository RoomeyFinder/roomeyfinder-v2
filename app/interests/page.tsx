import { Suspense } from "react";
import { InterestsPage } from "@/components/interests-page";
import { FlowLoading } from "@/components/roommate-flow/shared";
import { getUserInterests } from "@/lib/interests";
import { requireAuthenticatedUser } from "@/lib/supabase/auth";

export default function InterestsRoute() {
  return (
    <Suspense fallback={<FlowLoading />}>
      <InterestsContent />
    </Suspense>
  );
}

async function InterestsContent() {
  const { supabase, userId } = await requireAuthenticatedUser();
  const interests = await getUserInterests(supabase);
  return <InterestsPage interests={interests} userId={userId} />;
}
