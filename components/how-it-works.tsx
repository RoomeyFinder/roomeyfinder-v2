"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BadgeCheck, Home, Mail, MessageCircle, SlidersHorizontal, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    icon: Mail,
    title: "Sign in simply",
    description: "Use your email and a magic link or six-digit code. No password needed.",
  },
  {
    number: "02",
    icon: UserRound,
    title: "Build your profile",
    description: "Tell us about yourself, your lifestyle, and how you like to share a home.",
  },
  {
    number: "03",
    icon: SlidersHorizontal,
    title: "Set your preferences",
    description: "Choose the budget, location, habits, and move-in details that matter to you.",
  },
  {
    number: "04",
    icon: Home,
    title: "Choose your path",
    description: "Offer a room, look for a home, or team up with other seekers to find one.",
  },
  {
    number: "05",
    icon: BadgeCheck,
    title: "Get thoughtful matches",
    description:
      "We rank compatible people and homes based on the role and preferences you choose.",
  },
  {
    number: "06",
    icon: MessageCircle,
    title: "Connect with confidence",
    description:
      "Show interest, and contact details are revealed only when the interest is accepted.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".how-step-card").forEach((card) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "bottom 15%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="scroll-mt-24 py-4 md:py-8"
    >
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">How it works</p>
        <h2
          id="how-it-works-title"
          className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl"
        >
          A better way to find the right fit.
        </h2>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Answer a few simple questions, and we&apos;ll match you with compatible roommates and
          spaces that fit your lifestyle.
        </p>
        <Button asChild size="lg" className="mt-5">
          <Link href="/auth/login">Get started</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <Card
              key={step.number}
              className="how-step-card h-full border-brand/10 shadow-none transition-colors hover:border-brand/30"
            >
              <CardHeader className="gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
                    {step.number}
                  </span>
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {step.description}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
