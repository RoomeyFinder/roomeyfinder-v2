import { BrandLogo } from "./brand-logo";
import { SmartMapDiscovery } from "@/assets/illustrations/smart-search-and-filter";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <BrandLogo className="scale-125" />
      <div className="space-y-5">
        <h1 className="mx-auto max-w-3xl text-3xl font-medium leading-tight md:text-5xl">
          Find Your Perfect Match: Roommates and Spaces Tailored to You
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground md:text-xl">
          Whether you&apos;re a student searching for a cozy apartment, a professional seeking a
          shared living space, or a homeowner looking for a compatible roommate, we&apos;ve got you
          covered.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/auth/login">Get started</Link>
      </Button>
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-brand/10 bg-secondary/20 px-3 sm:px-8">
        <SmartMapDiscovery />
      </div>
      <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-brand/25 to-transparent" />
    </div>
  );
}
