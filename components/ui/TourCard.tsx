"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Users } from "lucide-react";

interface TourCardProps {
  id: string;
  title: string;
  price: string;
  image: string;
  duration: string;
  groupSize?: string;
  badge?: string;
}

export default function TourCard({
  id,
  title,
  price,
  image,
  duration,
  groupSize,
  badge,
}: TourCardProps) {
  return (
    <Link href={`/tours/${id}`} className="group block h-full">
      <div className="relative h-[500px] mb-6 overflow-hidden bg-gray-100">
        {/* Badge */}
        {badge && (
          <div className="absolute top-0 right-0 z-20 bg-white/90 backdrop-blur text-brand px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-l border-b border-gray-100">
            {badge}
          </div>
        )}

        {/* Imagen */}
        <div className="w-full h-full relative">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
        </div>

        {/* Overlay Info (Siempre visible abajo) */}
        <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-gradient-to-t from-black/80 to-transparent pt-20">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest mb-2 opacity-90">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {duration}
            </span>
            {groupSize && (
              <span className="flex items-center gap-1">
                <Users size={12} /> Max {groupSize}
              </span>
            )}
          </div>
          <div className="w-full h-[1px] bg-white/30 mb-4 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          <div className="flex justify-between items-end translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <span className="text-xs font-bold uppercase tracking-widest border-b border-transparent group-hover:border-white pb-1 transition-all">
              Book Now
            </span>
            <ArrowRight
              size={16}
              className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Título y Precio Externo */}
      <div className="flex justify-between items-baseline px-2">
        <h3 className="text-2xl font-serif text-dark group-hover:text-brand transition-colors duration-300">
          {title}
        </h3>
        <span className="text-sm font-medium text-gray-600 font-sans">
          {price} 
          {/* <span className="text-[10px] text-gray-400">/ pp</span> */}
        </span>
      </div>
    </Link>
  );
}
