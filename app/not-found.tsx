import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="w-full border-b border-foreground/10">
        <nav className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-6 p-3 px-5">
          <Link href="/" aria-label="RoomeyFinder home">
            <BrandLogo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back home
          </Link>
        </nav>
      </header>

      <section className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <div
            aria-hidden="true"
            className="relative mb-8 flex size-44 items-center justify-center rounded-full bg-brand/10"
          >
            <div className="absolute inset-5 rounded-full border-2 border-dashed border-brand/40" />
            <div className="relative flex size-24 items-center justify-center rounded-3xl bg-brand text-primary-foreground shadow-lg shadow-brand/20">
              <Home className="size-11" strokeWidth={1.8} />
              <span className="absolute -right-3 -top-3 flex size-9 items-center justify-center rounded-full bg-background text-lg font-bold text-brand shadow-md">
                ?
              </span>
            </div>
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">404</p>
          <h1 className="max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
            Oops...
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
            We couldn&apos;t find the page you were looking for. Let&apos;s get you back to discovering
            a place that feels like home.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/matches">
                <Search aria-hidden="true" />
                Find a roomey
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Go to homepage</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
