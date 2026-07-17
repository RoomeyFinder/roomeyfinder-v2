import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <SiteHeader />
        <div className="flex w-full flex-1 flex-col gap-20 max-w-5xl p-5">
          <Hero />
          <HowItWorks />
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
