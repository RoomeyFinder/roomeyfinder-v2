import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
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
