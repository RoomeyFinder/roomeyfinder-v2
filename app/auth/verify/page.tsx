import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";

type VerifyPageProps = {
  searchParams: Promise<{
    code?: string;
    next?: string;
    token_hash?: string;
    type?: string;
  }>;
};

export default function VerifyMagicLinkPage({ searchParams }: VerifyPageProps) {
  return (
    <div className="flex min-h-[70dvh] w-[90dvw] mx-auto max-w-5xl justify-center items-center">
      <Suspense fallback={<VerificationCard loading />}>
        <VerifyMagicLinkContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function VerifyMagicLinkContent({ searchParams }: VerifyPageProps) {
  const { code, next, token_hash: tokenHash, type } = await searchParams;
  const callbackParams = new URLSearchParams();

  if (code) callbackParams.set("code", code);
  if (tokenHash) callbackParams.set("token_hash", tokenHash);
  if (type) callbackParams.set("type", type);
  if (next?.startsWith("/") && !next.startsWith("//")) {
    callbackParams.set("next", next);
  }

  const hasVerificationParams = Boolean(code || (tokenHash && type));
  const callbackUrl = `/auth/callback?${callbackParams.toString()}`;

  return <VerificationCard callbackUrl={callbackUrl} valid={Boolean(hasVerificationParams)} />;
}

function VerificationCard({
  callbackUrl,
  loading = false,
  valid = false,
}: {
  callbackUrl?: string;
  loading?: boolean;
  valid?: boolean;
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Confirm sign in</CardTitle>
        <CardDescription>
          {loading
            ? "Preparing your sign-in link..."
            : valid
              ? "Press continue to finish signing in securely."
              : "This sign-in link is missing its verification details."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Button className="w-full" disabled>
            Loading...
          </Button>
        ) : valid && callbackUrl ? (
          <Button asChild className="w-full">
            <a href={callbackUrl}>Continue sign in</a>
          </Button>
        ) : (
          <Button asChild className="w-full" variant="outline">
            <Link href="/auth/login">Request a new link</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
