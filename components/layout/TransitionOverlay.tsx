"use client";

import React from "react";
import { useTransition } from "@/context/TransitionContext";
import Image from "next/image";

const LOGO_SRC = "/assets/images/stanlakepark-white-transparent.png";

export default function TransitionOverlay() {
  const { isTransitioning } = useTransition();

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center pointer-events-none"
      style={{ isolation: "isolate" }}
    >
      {/* Cortina negra: detrás (z-0), scale-y para barrido desde arriba */}
      <div
        className={`absolute inset-0 z-0 bg-[#0a0a0a] transition-transform duration-[800ms] ease-in-out origin-top ${
          isTransitioning ? "scale-y-100" : "scale-y-0"
        }`}
      />

      {/* Logo: siempre por encima de la cortina (z-10), opacidad 1 cuando visible */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{
          opacity: isTransitioning ? 1 : 0,
          transform: isTransitioning ? "translateY(0)" : "translateY(0.5rem)",
          transition: "opacity 500ms ease 100ms, transform 500ms ease 100ms",
        }}
      >
        <Image
          src={LOGO_SRC}
          alt="Stanlake Park"
          className="w-48 md:w-80 h-auto object-contain max-w-[20rem]"
          width={320}
          height={120}
          style={{ opacity: 1, filter: "none" }}
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
