"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const SmartMapDiscovery = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

      gsap.set(".search-bg-grid", { opacity: 0 });
      gsap.set(".search-card", { y: 50, opacity: 0, scale: 0.9 });
      gsap.set(".search-pin", { scale: 0, opacity: 0, transformOrigin: "bottom center" });
      gsap.set(".search-radar-pulse", { scale: 0.3, opacity: 0.8, transformOrigin: "center center" });
      gsap.set(".search-filter-tag", { x: -20, opacity: 0 });
      gsap.set(".search-lens", { rotation: -30, scale: 0.8, opacity: 0, transformOrigin: "center center" });

      tl.to(".search-bg-grid", { opacity: 0.08, duration: 0.8 })
        .to(".search-card", { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.2)" }, "-=0.5")
        .to(".search-pin", { scale: 1, opacity: 1, stagger: 0.15, duration: 0.6, ease: "back.out(1.8)" }, "-=0.3")
        .to(".search-lens", { rotation: 0, scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.3)" }, "-=0.2")
        .to(".search-filter-tag", { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" }, "-=0.4")
        .to(".search-radar-pulse", { scale: 3, opacity: 0, repeat: 1, duration: 2.2, ease: "power1.out" }, "-=0.5")
        .to(".search-lens", { x: 8, y: -5, repeat: 1, yoyo: true, duration: 2.5, ease: "sine.inOut" }, "search-idle")
        .to(".search-pin", { y: -4, repeat: 1, yoyo: true, stagger: 0.15, duration: 1.5, ease: "sine.inOut" }, "search-idle");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <svg width="480" height="360" viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Abstract Map Grid */}
        <g className="search-bg-grid" opacity="0.1">
          <line x1="60" y1="0" x2="60" y2="360" stroke="#3A86FF" strokeWidth="1.5" />
          <line x1="120" y1="0" x2="120" y2="360" stroke="#3A86FF" strokeWidth="1.5" />
          <line x1="180" y1="0" x2="180" y2="360" stroke="#3A86FF" strokeWidth="1.5" />
          <line x1="240" y1="0" x2="240" y2="360" stroke="#3A86FF" strokeWidth="1.5" />
          <line x1="300" y1="0" x2="300" y2="360" stroke="#3A86FF" strokeWidth="1.5" />
          <line x1="360" y1="0" x2="360" y2="360" stroke="#3A86FF" strokeWidth="1.5" />
          <line x1="0" y1="80" x2="480" y2="80" stroke="#3A86FF" strokeWidth="1.5" />
          <line x1="0" y1="160" x2="480" y2="160" stroke="#3A86FF" strokeWidth="1.5" />
          <line x1="0" y1="240" x2="480" y2="240" stroke="#3A86FF" strokeWidth="1.5" />
        </g>

        {/* Pulse center */}
        <circle cx="240" cy="180" r="10" fill="#3A86FF" />
        <circle className="search-radar-pulse" cx="240" cy="180" r="60" stroke="#3A86FF" strokeWidth="2.5" fill="none" />

        {/* Dynamic Pins */}
        <g className="search-pin" id="pin-1">
          <circle cx="160" cy="140" r="14" fill="#009A4930" />
          <path d="M160 115 C150 115 142 123 142 133 C142 145 160 165 160 165 C160 165 178 145 178 133 C178 123 170 115 160 115 Z" fill="#009A49" />
          <circle cx="160" cy="132" r="5" fill="#FFFFFF" />
        </g>
        <g className="search-pin" id="pin-2">
          <circle cx="320" cy="220" r="14" fill="#009A4930" />
          <path d="M320 195 C310 195 302 203 302 213 C302 225 320 245 320 245 C320 245 338 225 338 213 C338 203 330 195 320 195 Z" fill="#009A49" />
          <circle cx="320" cy="212" r="5" fill="#FFFFFF" />
        </g>
        <g className="search-pin" id="pin-3">
          <circle cx="270" cy="110" r="14" fill="#3A86FF30" />
          <path d="M270 85 C260 85 252 93 252 103 C252 115 270 135 270 135 C270 135 288 115 288 103 C288 93 280 85 270 85 Z" fill="#3A86FF" />
          <circle cx="270" cy="102" r="5" fill="#FFFFFF" />
        </g>

        {/* Discovery Mobile Card mock */}
        <g className="search-card">
          <rect x="90" y="270" width="300" height="65" rx="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />
          <rect x="105" y="282.5" width="40" height="40" rx="10" fill="#3A86FF20" />
          <circle cx="125" cy="302.5" r="8" fill="#3A86FF" />
          <rect x="155" y="288" width="130" height="10" rx="5" fill="#E2E8F0" />
          <rect x="155" y="306" width="80" height="8" rx="4" fill="#3A86FF" opacity="0.5" />
          <circle cx="355" cy="302.5" r="12" fill="#009A49" />
          <path d="M351 302.5 L354 305.5 L360 299.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Magnifying Glass */}
        <g className="search-lens">
          <circle cx="220" cy="160" r="45" fill="#3A86FF08" stroke="#3A86FF" strokeWidth="5.5" />
          <path d="M190 140 A 45 45 0 0 1 245 130" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          <rect x="250" y="190" width="35" height="11" rx="5.5" transform="rotate(45 250 190)" fill="#3A86FF" />
        </g>

        {/* Search filter badges */}
        <g className="search-filter-tag" id="filter-1">
          <rect x="60" y="25" width="85" height="28" rx="14" fill="#3A86FF" />
          <text x="102.5" y="42" fill="#FFFFFF" fontWeight="bold" fontSize="10" textAnchor="middle">📍 Near Rumuola</text>
        </g>
        <g className="search-filter-tag" id="filter-2">
          <rect x="160" y="25" width="100" height="28" rx="14" fill="#FFFFFF" stroke="#3A86FF33" strokeWidth="1.5" />
          <text x="207.5" y="42" fill="#3A86FF" fontWeight="bold" fontSize="10" textAnchor="middle">💰 Max ₦80,000/mo</text>
        </g>
        <g className="search-filter-tag" id="filter-3">
          <rect x="270" y="25" width="105" height="28" rx="14" fill="#FFFFFF" stroke="#009A4933" strokeWidth="1.5" />
          <text x="322.5" y="42" fill="#009A49" fontWeight="bold" fontSize="10" textAnchor="middle">🐾 Pet Friendly</text>
        </g>
      </svg>
    </div>
  );
};
