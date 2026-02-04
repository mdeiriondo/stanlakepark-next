"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface WineCardProps {
  id: string;
  name: string;
  type: string;
  price: string;
  image: string;
  badge?: string;
}

export default function WineCard({
  id,
  name,
  type,
  price,
  image,
  badge,
}: WineCardProps) {
  return (
    <Link href={`/shop/${id}`} className="group block h-full">
      <div className="relative h-[450px] mb-6 overflow-hidden bg-[#F9F9F9] border border-transparent hover:border-gray-200 transition-all duration-500">
        {/* Badge Opcional (ej: Award Winner) */}
        {badge && (
          <div className="absolute top-4 left-4 z-10 bg-brand text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
            {badge}
          </div>
        )}

        {/* Imagen con Zoom Suave */}
        <div className="w-full h-full p-8 flex items-center justify-center">
          <img
            src={image}
            alt={name}
            className="h-full w-auto object-contain drop-shadow-md transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3 will-change-transform"
          />
        </div>

        {/* Overlay de Acción (Aparece desde abajo) */}
        <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/5 transition-colors duration-500 flex items-end">
          <div className="w-full bg-white/95 backdrop-blur-sm py-4 px-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] border-t border-gray-100 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-dark">
              View Vintage
            </span>
            <ArrowRight size={14} className="text-brand" />
          </div>
        </div>
      </div>

      {/* Info del Vino */}
      <div className="text-center group-hover:translate-y-[-5px] transition-transform duration-500">
        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">
          {type}
        </span>
        <h3 className="text-2xl font-serif text-dark mb-2 group-hover:text-brand transition-colors duration-300">
          {name}
        </h3>
        <span className="text-sm font-medium text-gray-600 font-sans">
          {price}
        </span>
      </div>
    </Link>
  );
}
