import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAudienceLabel, type HomeChoice } from "@/lib/roommate-flow";
import { RoommateMatchIllustration } from "@/assets/illustrations/the-perfect-match";

export function EmptyMatches({ choice }: { choice: HomeChoice }) {
  return (
    <Card className="mx-auto max-w-2xl text-center">
      <CardContent className="p-10">
        <div
          className="mx-auto mb-2 max-w-md overflow-hidden rounded-2xl bg-secondary/30"
          aria-hidden="true"
        >
          <RoommateMatchIllustration />
        </div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-brand">
          <Search className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-xl font-semibold">Your shortlist is taking shape</h3>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          We don&apos;t have a strong match to show yet for {getAudienceLabel(choice).toLowerCase()}
          . Try widening your budget or search radius, then check back.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/setup?step=preferences">
            Update preferences <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
