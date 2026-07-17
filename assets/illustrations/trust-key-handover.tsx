"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const TrustKeyHandover = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1, defaults: { ease: "power2.out" } });

      gsap.set(".key-shield", { scale: 0.5, opacity: 0, transformOrigin: "center center" });
      gsap.set(".key-house", { y: 30, opacity: 0 });
      gsap.set(".key-hand", { x: -100, opacity: 0 });
      gsap.set(".key-ring", { scale: 0, transformOrigin: "center center" });
      gsap.set(".key-star", { scale: 0, opacity: 0, transformOrigin: "center center" });
      gsap.set(".key-badge", { scale: 0, opacity: 0, transformOrigin: "center center" });

      tl.to(".key-shield", { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.4)" })
        .to(".key-house", { y: 0, opacity: 1, duration: 0.8 }, "-=0.4")
        .to(".key-hand", { x: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "-=0.5")
        .to(".key-ring", { scale: 1, duration: 0.6, ease: "back.out(1.5)" }, "-=0.3")
        .to(".key-badge", { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }, "-=0.2")
        .to(".key-star", { scale: 1, opacity: 1, stagger: 0.12, duration: 0.4, ease: "back.out(2)" }, "-=0.1")
        .to(".key-hand", { y: -5, repeat: 1, yoyo: true, duration: 2, ease: "sine.inOut" }, "key-idle")
        .to(".key-ring", { rotation: 4, repeat: 1, yoyo: true, duration: 2, transformOrigin: "320px 240px", ease: "sine.inOut" }, "key-idle")
        .to(".key-star", { scale: 1.25, repeat: 1, yoyo: true, stagger: 0.2, duration: 1.2, ease: "sine.inOut" }, "key-idle");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <svg width="480" height="360" viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield background */}
        <path className="key-shield" d="M240 60 C180 60 140 85 140 140 C140 210 200 270 240 290 C280 270 340 210 340 140 C340 85 300 60 240 60 Z" fill="#009A490a" stroke="#009A491e" strokeWidth="3" />

        {/* House Silhouette */}
        <g className="key-house">
          <polygon points="240,110 310,170 170,170" fill="#3A86FF20" stroke="#3A86FF" strokeWidth="2.5" />
          <rect x="190" y="170" width="100" height="70" rx="6" fill="#3A86FF0d" stroke="#3A86FF" strokeWidth="2.5" />
          <rect x="228" y="200" width="24" height="40" rx="3" fill="#3A86FF" />
          <circle cx="246" cy="220" r="2" fill="#FFFFFF" />
        </g>

        {/* Verification check badges */}
        <g className="key-badge">
          <rect x="290" y="100" width="105" height="34" rx="17" fill="#009A49" />
          <path d="M308 117 L313 122 L321 112" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="356" y="122" fill="#FFFFFF" fontWeight="bold" fontSize="12" textAnchor="middle">VERIFIED</text>
        </g>

        {/* Little Success Sparkles */}
        <g className="key-star" id="star1">
          <path d="M120 110 L123 116 L130 117 L125 122 L126 129 L120 126 L114 129 L115 122 L110 117 L117 116 Z" fill="#FBBF24" />
        </g>
        <g className="key-star" id="star2">
          <path d="M370 220 L372 224 L377 225 L373 229 L374 234 L370 232 L366 234 L367 229 L363 225 L368 224 Z" fill="#FBBF24" />
        </g>

        {/* Hand handover key */}
        <g className="key-hand">
          <path d="M40 280 L140 280 L140 240 C140 240 100 240 40 250 Z" fill="#3A86FF" />
          <rect x="140" y="235" width="65" height="40" rx="12" fill="#FDBA74" />
          <circle cx="200" cy="248" r="8" fill="#FDBA74" />

          <g className="key-ring">
            <circle cx="215" cy="255" r="22" fill="#3A86FF" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M215 261 L211 257 C206 252 211 247 215 251 C219 247 224 252 220 257 Z" fill="#FFFFFF" />

            <circle cx="240" cy="255" r="12" stroke="#94A3B8" strokeWidth="3.5" fill="none" />
            <rect x="250" y="251" width="55" height="8" fill="#94A3B8" />
            <rect x="285" y="259" width="6" height="8" fill="#94A3B8" />
            <rect x="296" y="259" width="6" height="5" fill="#94A3B8" />
            <circle cx="245" cy="255" r="8" fill="#94A3B8" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        </g>
      </svg>
    </div>
  );
};
