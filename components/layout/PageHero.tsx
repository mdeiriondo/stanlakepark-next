"use client";

import React from "react";
import Reveal from "@/components/ui/Reveal";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image: string;
}

export default function PageHero({ title, subtitle, image }: PageHeroProps) {
  return (
    <div className="relative h-[60vh] w-full overflow-hidden bg-dark flex items-center justify-center">
      {/* Imagen de Fondo con Parallax suave */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover opacity-60 animate-ken-burns"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 text-center px-6">
        <Reveal>
          {subtitle && (
            <span className="block text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-6">
              {subtitle}
            </span>
          )}
          <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight leading-none drop-shadow-2xl">
            {title}
          </h1>
        </Reveal>
      </div>
    </div>
  );
}
