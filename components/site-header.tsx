import Link from "next/link";
import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { BrandLogo } from "@/components/brand-logo";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars, isProduction } from "@/lib/utils";

type SiteHeaderProps = {
  variant?: "home" | "protected";
};

export function SiteHeader({ variant = "home" }: SiteHeaderProps) {
  return (
    <Suspense fallback={<SiteHeaderFallback variant={variant} />}>
      <SiteHeaderContent variant={variant} />
    </Suspense>
  );
}

function SiteHeaderFallback({ variant }: SiteHeaderProps) {
  const isProtected = variant === "protected";
  const showEnvWarning = !hasEnvVars && (isProtected || !isProduction);
  const showAuthButton = !isProtected || Boolean(hasEnvVars);

  return (
    <SiteHeaderLayout
      isProtected={isProtected}
      discoverHref="/auth/login"
      showEnvWarning={showEnvWarning}
      showAuthButton={showAuthButton}
      isAuthenticated={false}
    />
  );
}

async function SiteHeaderContent({ variant = "home" }: SiteHeaderProps) {
  const isProtected = variant === "protected";
  let isAuthenticated = false;

  if (hasEnvVars) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    isAuthenticated = !error && Boolean(data?.claims);
  }

  const showEnvWarning =
    !hasEnvVars && (isProtected || !isProduction);
  const showAuthButton = !isProtected || Boolean(hasEnvVars);

  return (
    <SiteHeaderLayout
      isProtected={isProtected}
      discoverHref={isAuthenticated ? "/matches" : "/auth/login"}
      showEnvWarning={showEnvWarning}
      showAuthButton={showAuthButton}
      isAuthenticated={isAuthenticated}
    />
  );
}

function SiteHeaderLayout({
  isProtected,
  discoverHref,
  showEnvWarning,
  showAuthButton,
  isAuthenticated,
}: {
  isProtected: boolean;
  discoverHref: string;
  showEnvWarning: boolean;
  showAuthButton: boolean;
  isAuthenticated: boolean;
}) {
  return (
    <header className="w-full border-b border-b-foreground/10">
      <nav className="flex w-full justify-center">
        <div
          className={`flex min-h-16 w-full items-center justify-between gap-6 p-3 px-5 text-sm ${
            isProtected ? "max-w-6xl" : "max-w-5xl"
          }`}
        >
          <div className="flex items-center gap-8 font-semibold">
            <Link
              href="/"
              aria-label="RoomeyFinder home"
              className="flex items-center justify-center"
            >
              <BrandLogo />
            </Link>
            <div className="hidden items-center gap-5 text-muted-foreground sm:flex">
              <Link
                className="text-foreground"
                href={discoverHref}
              >
                Discover
              </Link>
              <Link href="/#how-it-works">How it works</Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            {showEnvWarning && <EnvVarWarning />}
            {showAuthButton && <AuthButton isAuthenticated={isAuthenticated} />}
          </div>
        </div>
      </nav>
    </header>
  );
}
