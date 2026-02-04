"use client";

import React from "react";
import { useTransition } from "@/context/TransitionContext";

export default function TransitionOverlay() {
  const { isTransitioning } = useTransition();

  return (
    <div
      className={`fixed inset-0 z-[100000] flex items-center justify-center pointer-events-none`}
    >
      {/* LA CORTINA NEGRA
         - Usamos scale-y para el efecto de barrido vertical.
         - origin-top: empieza desde arriba.
         - transition-transform: suavidad del movimiento.
      */}
      <div
        className={`absolute inset-0 bg-[#0a0a0a] transition-transform duration-[800ms] ease-in-out ${
          isTransitioning ? "scale-y-100" : "scale-y-0"
        } origin-top`}
      />

      {/* EL TEXTO (STANLAKE PARK)
         - Solo aparece cuando la transición está activa.
         - delay: espera un poco a que baje la cortina para aparecer.
      */}
      <div
        className={`relative z-10 text-white font-serif text-3xl md:text-5xl tracking-[0.4em] transition-all duration-500 delay-100 ${
          isTransitioning
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        STANLAKE PARK
      </div>
    </div>
  );
}
