"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

const WINES = [
  {
    name: "King's Fumé",
    type: "White · Oak Aged",
    price: "£22.00",
    img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2574&auto=format&fit=crop",
  },
  {
    name: "Pinot Noir",
    type: "Red · Reserve",
    price: "£26.00",
    img: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=2601&auto=format&fit=crop",
  },
  {
    name: "Heritage Brut",
    type: "Sparkling",
    price: "£35.00",
    img: "https://images.unsplash.com/photo-1536346323287-0b6aa9e7d715?q=80&w=800&h=1200&auto=format&fit=crop",
  },
];

export default function TheCellar() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-dark py-32 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
        <div className="relative z-10">
          <h2 className="text-white font-serif text-6xl md:text-8xl mb-12 leading-none">
            From the <br />{" "}
            <span className="text-brand italic font-light">Cellar</span>
          </h2>
          <div className="flex flex-col">
            {WINES.map((wine, i) => (
              <div
                key={i}
                onMouseEnter={() => setActive(i)}
                className={`group py-8 border-b border-white/10 cursor-pointer transition-all duration-500 ${active === i ? "pl-8 opacity-100 border-white/40" : "opacity-40 hover:opacity-70 hover:pl-4"}`}
              >
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-brand text-[9px] font-bold uppercase tracking-[0.2em] mb-2 block">
                      {wine.type}
                    </span>
                    <h3 className="text-4xl font-serif text-white">
                      {wine.name}
                    </h3>
                  </div>
                  <ArrowRight
                    className={`text-white transition-opacity duration-300 ${active === i ? "opacity-100" : "opacity-0"}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <button className="px-8 py-4 border border-white text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Visit Shop
            </button>
          </div>
        </div>

        {/* Galería dinámica de botellas */}
        <div className="relative h-[600px] flex items-center justify-center">
          <div className="absolute w-[120%] h-[120%] bg-gradient-to-tr from-brand/20 to-transparent rounded-full blur-[100px]" />
          {WINES.map((wine, i) => (
            <img
              key={i}
              src={wine.img}
              className={`absolute h-full object-contain transition-all duration-700 ease-out transform ${active === i ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10"}`}
              alt={wine.name}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
