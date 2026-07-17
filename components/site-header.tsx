import Link from "next/link";
import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { BrandLogo } from "@/components/brand-logo";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserMenu } from "@/components/user-menu";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars, isProduction } from "@/lib/utils";

type SiteHeaderProps = {
  variant?: "home" | "setup";
};

export function SiteHeader({ variant = "home" }: SiteHeaderProps) {
  return (
    <Suspense fallback={<SiteHeaderFallback variant={variant} />}>
      <SiteHeaderContent variant={variant} />
    </Suspense>
  );
}

function SiteHeaderFallback({ variant }: SiteHeaderProps) {
  const isSetup = variant === "setup";
  const showEnvWarning = !hasEnvVars && (isSetup || !isProduction);
  const showAuthButton = !isSetup || Boolean(hasEnvVars);

  return (
    <SiteHeaderLayout
      isSetup={isSetup}
      discoverHref="/auth/login"
      showEnvWarning={showEnvWarning}
      showAuthButton={showAuthButton}
      isAuthenticated={false}
      displayName={null}
      username={null}
      avatarUrl={null}
    />
  );
}

async function SiteHeaderContent({ variant = "home" }: SiteHeaderProps) {
  const isSetup = variant === "setup";
  let isAuthenticated = false;
  let displayName: string | null = null;
  let username: string | null = null;
  let avatarUrl: string | null = null;

  if (hasEnvVars) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    isAuthenticated = !error && Boolean(data?.claims);
    const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
    if (userId) {
      const [{ data: profile }, { data: photo }] = await Promise.all([
        supabase.from("profiles").select("first_name, username").eq("id", userId).maybeSingle(),
        supabase
          .from("profile_photos")
          .select("storage_path")
          .eq("user_id", userId)
          .eq("is_primary", true)
          .maybeSingle(),
      ]);
      displayName = profile?.first_name || null;
      username = profile?.username || null;
      if (photo?.storage_path) {
        avatarUrl =
          (
            await supabase.storage
              .from("profile-photos")
              .createSignedUrl(photo.storage_path, 60 * 60)
          ).data?.signedUrl ?? null;
      }
    }
  }

  const showEnvWarning = !hasEnvVars && (isSetup || !isProduction);
  const showAuthButton = !isSetup || Boolean(hasEnvVars);

  return (
    <SiteHeaderLayout
      isSetup={isSetup}
      discoverHref={isAuthenticated ? "/matches" : "/auth/login"}
      showEnvWarning={showEnvWarning}
      showAuthButton={showAuthButton}
      isAuthenticated={isAuthenticated}
      displayName={displayName}
      username={username}
      avatarUrl={avatarUrl}
    />
  );
}

function SiteHeaderLayout({
  isSetup,
  discoverHref,
  showEnvWarning,
  showAuthButton,
  isAuthenticated,
  displayName,
  username,
  avatarUrl,
}: {
  isSetup: boolean;
  discoverHref: string;
  showEnvWarning: boolean;
  showAuthButton: boolean;
  isAuthenticated: boolean;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
}) {
  return (
    <header className="w-full border-b border-b-foreground/10">
      <nav className="flex w-full justify-center">
        <div
          className={`flex min-h-16 w-full items-center justify-between gap-6 p-3 px-5 text-sm ${
            isSetup ? "max-w-6xl" : "max-w-5xl"
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
              <Link className="text-foreground" href={discoverHref}>
                Discover
              </Link>
              <Link href="/#how-it-works">How it works</Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showEnvWarning && <EnvVarWarning />}
            {showAuthButton && <AuthButton isAuthenticated={isAuthenticated} />}
            {isAuthenticated ? (
              <UserMenu displayName={displayName} username={username} avatarUrl={avatarUrl} />
            ) : (
              <ThemeSwitcher />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
