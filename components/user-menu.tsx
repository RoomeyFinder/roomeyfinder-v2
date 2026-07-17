"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Moon, Sun, SunMoon, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserMenuProps = {
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
};

export function UserMenu({ displayName, username, avatarUrl }: UserMenuProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark" || (theme === "system" && resolvedTheme === "dark");
  const themeLabel = theme === "system" ? "System" : isDark ? "Dark" : "Light";

  async function logout() {
    await createClient().auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 px-1.5" aria-label="Open account menu">
          <span
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            {avatarUrl ? (
              <span
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${avatarUrl}")` }}
              />
            ) : (
              <User size={17} />
            )}
          </span>
          <span className="sr-only">{displayName || "Account"}</span>
          <ChevronDown size={15} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{displayName || "Your account"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={username ? `/${username}` : "/setup?step=profile"}>Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/interests">Interests</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        {mounted && (
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">
              <Sun size={15} /> Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <Moon size={15} /> Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <SunMoon size={15} /> System ({themeLabel})
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => void logout()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut size={15} /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
