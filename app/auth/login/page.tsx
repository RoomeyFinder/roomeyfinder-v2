import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginForm />}>
      <LoginContent />
    </Suspense>
  );
}

async function LoginContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) redirect("/matches");

  return <LoginForm />;
}
