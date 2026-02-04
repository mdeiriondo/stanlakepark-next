"use client";

import React from "react";
import Reveal from "@/components/ui/Reveal";
import TransitionLink from "@/components/ui/TransitionLink";

const VENUES = [
  {
    slug: "the-coach-house", // Slug para la URL
    title: "The Coach House",
    cap: "Ceremony & Reception",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
    desc: "A beautifully restored 17th-century barn with original beams and high ceilings.",
  },
  {
    slug: "walled-garden",
    title: "The Walled Garden",
    cap: "Outdoor Ceremonies",
    img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2670&auto=format&fit=crop",
    desc: "A secret garden sanctuary hidden within our historic grounds, perfect for summer vows.",
  },
  {
    slug: "vineyard-barn", // Asegúrate de tener datos para este slug si vas a crear la página
    title: "Vineyard Barn",
    cap: "Celebration Venue",
    img: "https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=2000&auto=format&fit=crop",
    desc: "Breathtaking views over the vines for your evening party as the sun sets.",
  },
];

export default function VenueShowcase() {
  return (
    <section className="py-40 bg-[#FAFAFA] text-dark">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="text-center mb-32">
          <Reveal>
            <span className="text-gold font-bold tracking-[0.4em] text-xs uppercase mb-6 block">
              The Estate Spaces
            </span>
            <h2 className="text-6xl md:text-[8rem] font-serif tracking-tighter leading-none">
              Ethereal Settings
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {VENUES.map((venue, i) => (
            <Reveal key={i} delay={i * 200}>
              {/* LINK CONECTADO DINÁMICAMENTE */}
              <TransitionLink
                href={`/weddings/venues/${venue.slug}`}
                className="group block h-full"
              >
                <div className="bg-white pb-12 shadow-sm hover:shadow-2xl transition-all duration-700 h-full">
                  <div className="h-[500px] lg:h-[600px] overflow-hidden mb-10 relative">
                    <img
                      src={venue.img}
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                      alt={venue.title}
                    />
                    <div className="absolute bottom-0 left-0 bg-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-dark">
                      {venue.cap}
                    </div>
                  </div>
                  <div className="px-10 text-center md:text-left">
                    <h3 className="text-3xl font-serif mb-4 group-hover:text-gold transition-colors duration-500">
                      {venue.title}
                    </h3>
                    <p className="text-gray-400 font-light leading-relaxed mb-8 text-lg">
                      {venue.desc}
                    </p>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-[0.3em] border-b border-gray-200 pb-1 group-hover:border-black transition-colors">
                      Explore Space
                    </span>
                  </div>
                </div>
              </TransitionLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
