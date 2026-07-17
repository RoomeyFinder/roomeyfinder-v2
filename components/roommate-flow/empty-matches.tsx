import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAudienceLabel, type HomeChoice } from "@/lib/roommate-flow";

export function EmptyMatches({ choice }: { choice: HomeChoice }) {
  return <Card className="mx-auto max-w-2xl text-center"><CardContent className="p-10"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-brand"><Search className="h-6 w-6" /></div><h3 className="mt-5 text-xl font-semibold">Your shortlist is taking shape</h3><p className="mx-auto mt-2 max-w-md text-muted-foreground">We don’t have a strong match to show yet for {getAudienceLabel(choice).toLowerCase()}. Try widening your budget or search radius, then check back.</p><Button variant="outline" className="mt-6">Update preferences <ArrowRight /></Button></CardContent></Card>;
}
