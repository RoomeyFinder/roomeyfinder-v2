"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const RoommateMatchIllustration = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1, defaults: { ease: "power2.out" } });

      gsap.set(".match-avatar-l", { x: -60, opacity: 0, scale: 0.8 });
      gsap.set(".match-avatar-r", { x: 60, opacity: 0, scale: 0.8 });
      gsap.set(".match-badge", { scale: 0, opacity: 0 });
      gsap.set(".match-line", { strokeDashoffset: 100 });
      gsap.set(".match-node", { scale: 0, opacity: 0 });
      gsap.set(".match-bubble", { y: 15, opacity: 0 });

      tl.to(".match-avatar-l", { x: 0, opacity: 1, scale: 1, duration: 0.8 })
        .to(".match-avatar-r", { x: 0, opacity: 1, scale: 1, duration: 0.8 }, "-=0.6")
        .to(".match-line", { strokeDashoffset: 0, duration: 1.2, ease: "none" }, "-=0.4")
        .to(".match-badge", { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }, "-=0.5")
        .to(".match-node", { scale: 1, opacity: 1, stagger: 0.15, duration: 0.5, ease: "back.out(1.5)" }, "-=0.3")
        .to(".match-bubble", { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .to(".match-bubble", { y: -4, repeat: 1, yoyo: true, duration: 1.5, ease: "sine.inOut" })
        .to(".match-node", { y: -6, repeat: 1, yoyo: true, duration: 1.8, stagger: 0.1, ease: "sine.inOut" }, "-=1.5");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <svg width="480" height="360" viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="240" cy="180" r="130" fill="#3A86FF0d" stroke="#3A86FF1a" strokeWidth="1" />
        <circle cx="240" cy="180" r="90" fill="#3A86FF08" />
        <path className="match-line" d="M140 180 Q240 230 340 180" stroke="#3A86FF" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="8 8" />

        {/* Left Avatar */}
        <g className="match-avatar-l">
          <circle cx="130" cy="180" r="45" fill="#3A86FF26" stroke="#3A86FF" strokeWidth="3" />
          <path d="M100 215 C100 200 110 190 120 190 H140 C150 190 160 200 160 215 Z" fill="#3A86FF" />
          <circle cx="130" cy="165" r="14" fill="#3A86FF" opacity="0.3" />
          <circle cx="124" cy="165" r="3.5" fill="#3A86FF" />
          <circle cx="136" cy="165" r="3.5" fill="#3A86FF" />
          <path d="M126 174 Q130 178 134 174" stroke="#3A86FF" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Right Avatar */}
        <g className="match-avatar-r">
          <circle cx="350" cy="180" r="45" fill="#009A4926" stroke="#009A49" strokeWidth="3" />
          <path d="M320 215 C320 200 330 190 340 190 H360 C370 190 380 200 380 215 Z" fill="#009A49" />
          <circle cx="350" cy="163" r="15" fill="#009A49" opacity="0.3" />
          <rect x="340" y="152" width="20" height="6" rx="3" fill="#009A49" />
          <circle cx="344" cy="164" r="3.5" fill="#009A49" />
          <circle cx="356" cy="164" r="3.5" fill="#009A49" />
          <path d="M346 172 Q350 176 354 172" stroke="#009A49" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Compatibility Spheres */}
        <g className="match-node" id="music">
          <circle cx="180" cy="110" r="22" fill="#49C3A726" stroke="#49C3A7" strokeWidth="2" />
          <text x="180" y="115" fontSize="16" textAnchor="middle">🎵</text>
        </g>
        <g className="match-node" id="gaming">
          <circle cx="300" cy="110" r="22" fill="#49C3A726" stroke="#49C3A7" strokeWidth="2" />
          <text x="300" y="115" fontSize="16" textAnchor="middle">🎮</text>
        </g>
        <g className="match-node" id="cleaning">
          <circle cx="240" cy="270" r="22" fill="#49C3A726" stroke="#49C3A7" strokeWidth="2" />
          <text x="240" y="275" fontSize="16" textAnchor="middle">✨</text>
        </g>

        {/* Chat message bubbles */}
        <g className="match-bubble" id="chat-l">
          <rect x="70" y="90" width="75" height="30" rx="15" fill="#FFFFFF" stroke="#3A86FF40" strokeWidth="1.5" />
          <text x="107.5" y="109" fill="#3A86FF" fontSize="10" fontWeight="bold" textAnchor="middle">Hey there! 👋</text>
          <path d="M100 120 L105 128 L112 120 Z" fill="#FFFFFF" />
        </g>
        <g className="match-bubble" id="chat-r">
          <rect x="330" y="90" width="85" height="30" rx="15" fill="#FFFFFF" stroke="#009A4940" strokeWidth="1.5" />
          <text x="372.5" y="109" fill="#009A49" fontSize="10" fontWeight="bold" textAnchor="middle">Hey! Love coffee☕</text>
          <path d="M370 120 L375 128 L382 120 Z" fill="#FFFFFF" />
        </g>

        {/* Main compatibility status badge */}
        <g className="match-badge">
          <rect x="185" y="160" width="110" height="40" rx="20" fill="#009A49" />
          <text x="240" y="185" fill="#FFFFFF" fontWeight="900" fontSize="14" textAnchor="middle">98% MATCH</text>
        </g>
      </svg>
    </div>
  );
};
