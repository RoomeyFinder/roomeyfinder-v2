import { MessageCircle } from "lucide-react";

import type { DiscoveryState } from "@/components/roommate-flow/types";

export function IncomingInterests({ interests }: { interests: DiscoveryState["interests"] }) {
  return <div className="mb-6 rounded-brand-md border border-brand/20 bg-secondary/40 p-4"><div className="flex items-start gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white"><MessageCircle className="h-4 w-4" /></div><div><p className="font-semibold">Someone is interested in connecting</p><p className="mt-1 text-sm text-muted-foreground">Review their interest below. Accepting reveals contact details to both of you.</p><div className="mt-3 flex flex-wrap gap-2">{interests.map((interest) => <span key={interest.id} className="text-xs text-muted-foreground">Interest received · {new Date(interest.created_at ?? Date.now()).toLocaleDateString()}</span>)}</div></div></div></div>;
}
