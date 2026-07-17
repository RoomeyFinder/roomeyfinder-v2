import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function MatchesLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen flex flex-col items-center"><div className="flex-1 w-full flex flex-col items-center"><SiteHeader variant="protected" /><div className="flex-1 w-full p-5 py-10 md:py-14">{children}</div><SiteFooter /></div></main>;
}
