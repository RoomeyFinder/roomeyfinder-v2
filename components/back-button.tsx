"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button type="button" variant="ghost" size="sm" className="mb-3 px-0" onClick={() => router.back()}>
      <ArrowLeft /> Back
    </Button>
  );
}
