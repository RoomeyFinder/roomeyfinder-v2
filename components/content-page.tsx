import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function ContentPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader variant="setup" />
      <article className="mx-auto w-full max-w-3xl flex-1 px-5 py-14">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="mt-6 space-y-5 text-muted-foreground">{children}</div>
      </article>
      <SiteFooter />
    </main>
  );
}
