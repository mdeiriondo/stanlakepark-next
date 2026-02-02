"use client";

import React from "react";
import { Play, ChevronDown, ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export default function Hero() {
  return (
    <header className="relative h-screen w-full overflow-hidden bg-dark">
      {/* GRID SPLIT SCREEN */}
      <div className="absolute inset-0 grid grid-cols-12 h-full">
        {/* Lado Izquierdo: Imagen Cinemática */}
        <div className="col-span-12 md:col-span-8 relative overflow-hidden bg-gray-900">
          <img
            src="https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2668&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover opacity-75 animate-ken-burns origin-center"
            alt="Stanlake Park Vineyard"
          />
          <div className="absolute inset-0 bg-black/30 z-10"></div>
        </div>

        {/* Lado Derecho: Bloque de Marca 1166 */}
        <div className="hidden md:flex md:col-span-4 bg-brand relative items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          {/* Texto Gigante Vertical */}
          <div className="z-10 text-white/10 font-serif text-[18rem] select-none rotate-90 tracking-tighter cursor-default leading-none">
            1166
          </div>
        </div>
      </div>

      {/* CONTENIDO EDITORIAL */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-24 pointer-events-none">
        <Reveal>
          <div className="max-w-5xl pointer-events-auto">
            <div className="flex items-center gap-5 mb-10">
              <span className="h-[1px] w-14 bg-white/50"></span>
              <span className="text-white text-[11px] font-bold uppercase tracking-[0.5em]">
                Twyford, Berkshire
              </span>
            </div>

            <h1 className="text-7xl md:text-[10rem] font-serif text-white leading-[0.8] tracking-tighter mb-12 drop-shadow-2xl">
              English Wine <br />
              <span className="italic font-light text-white/80">
                Reimagined.
              </span>
            </h1>

            <p className="text-white/90 text-lg md:text-2xl max-w-xl leading-relaxed mb-16 font-light border-l border-white/30 pl-10">
              Established 1166. A rebellious tradition in one of England&apos;s
              oldest estates. Excellence in every bottle.
            </p>

            <div className="flex flex-col md:flex-row gap-10">
              {/* Botón Transparente (White Outline) */}
              <button className="px-10 py-5 bg-transparent border border-white text-white text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-white hover:text-brand transition-all duration-300 flex items-center gap-3 group cursor-pointer">
                Book Experience
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-2 transition-transform duration-300"
                />
              </button>

              {/* Botón Play Redondo */}
              <button className="flex items-center gap-5 text-white group cursor-pointer px-4">
                <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-xl">
                  <Play size={16} fill="currentColor" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-transparent group-hover:border-white pb-1 transition-all">
                  Watch Our Story
                </span>
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 md:left-[33.33%] transform -translate-x-1/2 z-30 animate-bounce text-white/40">
        <ChevronDown size={36} strokeWidth={1} />
      </div>
    </header>
  );
}
