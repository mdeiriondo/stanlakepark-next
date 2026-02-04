"use client";

import React from "react";
import { useTransition } from "@/context/TransitionContext";

export default function TransitionOverlay() {
  const { isTransitioning } = useTransition();

  return (
    <div
      className={`fixed inset-0 z-[999999] pointer-events-none flex items-center justify-center transition-opacity duration-[800ms] ${
        isTransitioning ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Fondo Negro que cae/sube */}
      <div
        className={`absolute inset-0 bg-[#0a0a0a] transition-transform duration-[800ms] ease-in-out ${
          isTransitioning ? "scale-y-100" : "scale-y-0"
        } origin-top`}
      />

      {/* Texto Palpitante */}
      <div
        className={`relative z-10 text-white font-serif text-4xl md:text-6xl tracking-[0.3em] transition-opacity duration-500 ${
          isTransitioning ? "opacity-100 animate-pulse" : "opacity-0"
        }`}
      >
        STANLAKE PARK
      </div>
    </div>
  );
}
