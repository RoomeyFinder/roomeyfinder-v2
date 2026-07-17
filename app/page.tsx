import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CursorBackdrop } from "@/components/cursor-backdrop";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden">
      <CursorBackdrop />
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <SiteHeader />
        <div className="flex w-full max-w-5xl flex-1 flex-col gap-20 p-5">
          <Hero />
          <HowItWorks />
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
