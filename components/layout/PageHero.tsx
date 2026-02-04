"use client";

import React from "react";
import Reveal from "@/components/ui/Reveal";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  video?: string;
}

export default function PageHero({ title, subtitle, image, video }: PageHeroProps) {
  return (
    <div className="relative h-[60vh] w-full overflow-hidden bg-dark flex items-center justify-center">
      {/* Video o Imagen de Fondo */}
      <div className="absolute inset-0 w-full h-full">
        {video ? (
          <>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-60"
            >
              <source src={video} type="video/mp4" />
            </video>
            {/* Imagen de respaldo si el video no carga */}
            {image && (
              <img
                src={image}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 animate-ken-burns"
              />
            )}
          </>
        ) : image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover opacity-60 animate-ken-burns"
          />
        ) : null}
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
