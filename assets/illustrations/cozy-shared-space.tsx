"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CozySharedLivingRoom = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

      gsap.set(".living-bg-sun", { y: 20, opacity: 0 });
      gsap.set(".living-plant-leaf-1", { transformOrigin: "bottom center", rotation: -15 });
      gsap.set(".living-plant-leaf-2", { transformOrigin: "bottom center", rotation: 10 });
      gsap.set(".living-plant-leaf-3", { transformOrigin: "bottom center", rotation: -5 });
      gsap.set(".living-cloud-1", { x: -40, opacity: 0 });
      gsap.set(".living-cloud-2", { x: 40, opacity: 0 });
      gsap.set(".living-sofa", { y: 40, opacity: 0 });
      gsap.set(".living-table", { y: 20, opacity: 0 });
      gsap.set(".living-lamp-light", { opacity: 0 });
      gsap.set(".living-steam", { y: 5, opacity: 0 });

      tl.to(".living-bg-sun", { y: 0, opacity: 0.8, duration: 1.2 })
        .to(".living-cloud-1", { x: 0, opacity: 0.6, duration: 1.5 }, "-=1")
        .to(".living-cloud-2", { x: 0, opacity: 0.4, duration: 1.5 }, "-=1.2")
        .to(".living-sofa", { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.2)" })
        .to(".living-table", { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)" }, "-=0.4")
        .to(".living-lamp-light", { opacity: 0.35, duration: 0.8 })
        .to(".living-steam", { y: -10, opacity: 1, stagger: 0.2, duration: 0.9, ease: "power1.inOut" }, "-=0.5")
        .to(".living-steam", { opacity: 0, stagger: 0.2, duration: 0.9, ease: "power1.inOut" })
        .to(".living-plant-leaf-1", { rotation: 5, repeat: 1, yoyo: true, duration: 2.2, ease: "sine.inOut" }, "idle")
        .to(".living-plant-leaf-2", { rotation: -5, repeat: 1, yoyo: true, duration: 2.5, ease: "sine.inOut" }, "idle")
        .to(".living-plant-leaf-3", { rotation: 2, repeat: 1, yoyo: true, duration: 1.8, ease: "sine.inOut" }, "idle")
        .to(".living-cloud-1", { x: 10, repeat: 1, yoyo: true, duration: 2, ease: "sine.inOut" }, "idle")
        .to(".living-cloud-2", { x: -10, repeat: 1, yoyo: true, duration: 2, ease: "sine.inOut" }, "idle");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <svg width="480" height="360" viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sky / Outside View */}
        <rect x="80" y="60" width="320" height="150" rx="24" fill="#EFF6FF" />

        {/* Sun */}
        <g className="living-bg-sun">
          <circle cx="240" cy="110" r="35" fill="#FDBA74" opacity="0.6" />
          <circle cx="240" cy="110" r="25" fill="#FBBF24" />
        </g>

        {/* Clouds */}
        <path className="living-cloud-1" d="M120 100 C110 100 105 108 112 114 C108 118 116 126 124 122 C130 126 138 120 134 114 C138 108 130 100 120 100 Z" fill="#FFFFFF" opacity="0.9" />
        <path className="living-cloud-2" d="M340 90 C332 90 328 96 333 101 C330 104 336 111 343 108 C348 111 354 106 351 101 C354 96 348 90 340 90 Z" fill="#FFFFFF" opacity="0.8" />

        {/* Window Framing */}
        <rect x="80" y="60" width="320" height="150" rx="24" stroke="#E2E8F0" strokeWidth="10" fill="none" />
        <line x1="240" y1="60" x2="240" y2="210" stroke="#E2E8F0" strokeWidth="6" />

        <line x1="40" y1="280" x2="440" y2="280" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />

        {/* Sofa */}
        <g className="living-sofa">
          <rect x="130" y="210" width="220" height="60" rx="16" fill="#3A86FF" />
          <rect x="140" y="195" width="95" height="50" rx="12" fill="#3A86FF" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="245" y="195" width="95" height="50" rx="12" fill="#3A86FF" stroke="#FFFFFF" strokeWidth="2" />
          <rect x="115" y="215" width="25" height="45" rx="8" fill="#3A86FF" />
          <rect x="340" y="215" width="25" height="45" rx="8" fill="#3A86FF" />
          <rect x="145" y="270" width="10" height="12" rx="2" fill="#94A3B8" />
          <rect x="325" y="270" width="10" height="12" rx="2" fill="#94A3B8" />
        </g>

        {/* Coffee Table & Companionship Cups */}
        <g className="living-table">
          <ellipse cx="240" cy="280" rx="55" ry="12" fill="#E2E8F0" />
          <rect x="195" y="260" width="90" height="10" rx="5" fill="#94A3B8" />
          <line x1="210" y1="270" x2="210" y2="280" stroke="#94A3B8" strokeWidth="5" />
          <line x1="270" y1="270" x2="270" y2="280" stroke="#94A3B8" strokeWidth="5" />

          <rect x="220" y="248" width="12" height="12" rx="2" fill="#3A86FF" />
          <rect x="248" y="248" width="12" height="12" rx="2" fill="#009A49" />
          <path d="M217 251 C215 251 215 257 217 257" stroke="#3A86FF" strokeWidth="2" />
          <path d="M263 251 C265 251 265 257 263 257" stroke="#009A49" strokeWidth="2" />

          <path className="living-steam" d="M226 242 Q224 237 228 232 T226 225" stroke="#3A86FF" strokeWidth="1.5" strokeLinecap="round" />
          <path className="living-steam" d="M254 242 Q252 237 256 232 T254 225" stroke="#009A49" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Plants */}
        <g className="living-plant">
          <rect x="375" y="245" width="22" height="35" rx="4" fill="#F43F5E" />
          <ellipse cx="386" cy="245" rx="14" ry="5" fill="#E11D48" />
          <path className="living-plant-leaf-1" d="M386 245 C370 230 360 210 362 195 C375 210 384 230 386 245 Z" fill="#10B981" />
          <path className="living-plant-leaf-2" d="M386 245 C402 230 412 210 410 195 C397 210 388 230 386 245 Z" fill="#047857" />
          <path className="living-plant-leaf-3" d="M386 245 C386 220 380 200 386 185 C392 200 386 220 386 245 Z" fill="#34D399" />
        </g>

        {/* Cozy Lamp */}
        <g className="living-lamp">
          <line x1="75" y1="280" x2="75" y2="150" stroke="#64748B" strokeWidth="4" />
          <polygon points="60,150 90,150 95,120 55,120" fill="#3A86FF" />
          <polygon className="living-lamp-light" points="75,150 35,280 145,280" fill="#FDE047" opacity="0.3" style={{ mixBlendMode: 'screen' }} />
        </g>
      </svg>
    </div>
  );
};
