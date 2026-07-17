"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CursorBackdrop() {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scope.current;
    if (!root || !window.matchMedia("(pointer: fine)").matches) return;

    const ctx = gsap.context(() => {
      const glow = root.querySelector<HTMLElement>("[data-cursor-glow]");
      const halo = root.querySelector<HTMLElement>("[data-cursor-halo]");
      if (!glow || !halo) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      const move = (event: PointerEvent) => {
        gsap.to(glow, {
          x: event.clientX,
          y: event.clientY,
          duration: 0.7,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(halo, {
          x: event.clientX,
          y: event.clientY,
          duration: 1.15,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      window.addEventListener("pointermove", move, { passive: true });
      return () => window.removeEventListener("pointermove", move);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={scope} aria-hidden="true" className="cursor-backdrop">
      <div data-cursor-halo className="cursor-backdrop__halo" />
      <div data-cursor-glow className="cursor-backdrop__glow" />
    </div>
  );
}
