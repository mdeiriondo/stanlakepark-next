"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { Experience } from "@/lib/wordpress";

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const { slug, title, experienceDetails, pricing, featuredImage } = experience;
  const imageUrl =
    featuredImage?.node?.sourceUrl ||
    "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop";

  return (
    <Link href={`/experiences/${slug}`} className="group block h-full">
      <div className="relative h-[320px] mb-4 overflow-hidden bg-gray-100">
        {experienceDetails.badge && (
          <div className="absolute top-0 right-0 z-20 bg-white/90 backdrop-blur text-brand px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-l border-b border-gray-100">
            {experienceDetails.badge}
          </div>
        )}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-gradient-to-t from-black/80 to-transparent pt-16">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest mb-2 opacity-90">
            {experienceDetails.duration && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {experienceDetails.duration}
              </span>
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest border-b border-transparent group-hover:border-white pb-1 transition-all inline-flex items-center gap-2">
            Ver experiencia
            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </span>
        </div>
      </div>
      <h3 className="text-xl font-serif text-dark group-hover:text-brand transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">
        {pricing.basePrice > 0 ? `£${pricing.basePrice}` : "Consultar"} / persona
      </p>
    </Link>
  );
}
