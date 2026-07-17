import { Check, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function FlowLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl animate-pulse space-y-8">
      <div className="h-8 w-2/3 rounded-full bg-muted" />
      <div className="h-20 rounded-brand-md bg-muted" />
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="h-96 rounded-brand-md bg-muted" />
        <div className="h-96 rounded-brand-md bg-muted" />
      </div>
    </div>
  );
}

export function FlowProgress({ current, gates, completedThrough, onStepChange }: { current: string; gates: readonly { id: string; label: string; icon: LucideIcon }[]; completedThrough: string; onStepChange: (id: string) => void }) {
  const currentIndex = gates.findIndex((gate) => gate.id === current);
  const completedThroughIndex = completedThrough === "discover"
    ? gates.length
    : gates.findIndex((gate) => gate.id === completedThrough);

  return (
    <div className="rounded-brand-md border bg-card p-3 shadow-sm md:p-4">
      <div className="grid grid-cols-3 gap-2">
        {gates.map((gate, index) => {
          const complete = index < completedThroughIndex;
          const active = index === currentIndex;
          const canNavigate = index <= completedThroughIndex;
          const Icon = gate.icon;
          return (
            <div key={gate.id} className="relative flex items-center justify-center md:justify-start">
              <button
                type="button"
                disabled={!canNavigate}
                onClick={() => onStepChange(gate.id)}
                aria-current={active ? "step" : undefined}
                className="relative z-10 flex items-center gap-2 rounded-brand-sm bg-card text-left disabled:cursor-default"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs ${complete || active ? "border-brand bg-brand text-white" : "border-border bg-muted text-muted-foreground"}`}>
                  {complete && !active ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span className={`hidden pr-1.5 text-sm font-medium sm:block ${active ? "text-foreground" : canNavigate ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground"}`}>
                  {gate.label}
                </span>
              </button>
              {index < gates.length - 1 ? <div className="absolute right-[-1rem] top-4 z-0 hidden h-px w-[calc(100%-4rem)] bg-border md:block" /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StepIntro({ eyebrow, title, description, icon: Icon }: { eyebrow: string; title: string; description: string; icon: LucideIcon }) {
  return (
    <div className="mb-7 flex gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-brand-md bg-secondary text-brand"><Icon className="h-6 w-6" /></div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function SideNote({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <Card className="h-fit bg-secondary/30">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-brand"><Icon className="h-5 w-5" /></div><h3 className="font-semibold">{title}</h3></div>
        <div className="mt-5 text-sm leading-6 text-muted-foreground">{children}</div>
      </CardContent>
    </Card>
  );
}

export function NoteLine({ children }: { children: ReactNode }) {
  return <p className="flex items-start gap-2"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" /><span>{children}</span></p>;
}

export function Field({ label, htmlFor, hint, error, optional, children }: { label: string; htmlFor: string; hint?: string; error?: string; optional?: boolean; children: ReactNode }) {
  return <div className="grid gap-2"><Label htmlFor={htmlFor}>{label}{optional ? <span className="ml-1 font-normal text-muted-foreground">(optional)</span> : null}</Label>{children}{error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}</div>;
}

export function ChoiceCard({ selected, icon: Icon, title, description, badge, action, onClick }: { selected: boolean; icon: LucideIcon; title: string; description: string; badge: string; action?: { label: string; onClick: () => void }; onClick: () => void }) {
  function handleAction(event: ReactMouseEvent<HTMLSpanElement>) {
    event.stopPropagation();
    action?.onClick();
  }

  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={`rounded-brand-md border p-6 text-left transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md ${selected ? "border-brand bg-secondary/50 shadow-md" : "bg-card"}`}>
      <div className="flex items-start justify-between gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-brand-md bg-secondary text-brand"><Icon className="h-5 w-5" /></div><div className="flex items-center gap-2">{action ? <span role="button" tabIndex={0} onClick={handleAction} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); action.onClick(); } }} className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-brand shadow-sm">{action.label}</span> : null}{selected ? <CheckCircle2 className="h-5 w-5 text-brand" /> : null}</div></div>
      <Badge variant="outline" className="mt-6">{badge}</Badge>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </button>
  );
}
