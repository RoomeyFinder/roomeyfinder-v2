import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function InterestsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center">
        <SiteHeader variant="setup" />
        <div className="w-full flex-1 p-5 py-10 md:py-14">{children}</div>
        <SiteFooter />
      </div>
    </main>
  );
}
