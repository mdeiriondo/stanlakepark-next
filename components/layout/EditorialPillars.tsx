"use client";

import React from "react";
import { Coffee, Wifi, ArrowRight } from "lucide-react";

export default function EditorialPillars() {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative">
          {/* Wine Bar - Layout asimétrico */}
          <div className="md:col-span-7 relative group">
            <div className="relative overflow-hidden mb-6">
              <img
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2574&auto=format&fit=crop"
                className="w-full h-[600px] object-cover transition-transform duration-1000 group-hover:scale-105"
                alt="The Wine Bar"
              />
            </div>
            <div className="md:absolute bottom-12 -right-12 bg-cream p-10 max-w-sm shadow-xl z-10">
              <div className="flex items-center gap-3 mb-4">
                <Coffee size={16} className="text-brand" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark">
                  Eat & Drink
                </span>
              </div>
              <h3 className="text-4xl font-serif mb-4 text-dark">
                The Wine Bar
              </h3>
              <p className="text-gray-600 mb-8 font-light leading-relaxed">
                Local cheese boards, charcuterie and our wines by the glass in
                our beautifully renovated 17th-century barn.
              </p>
              <a
                href="#"
                className="inline-block text-xs font-bold uppercase tracking-widest border-b border-brand pb-1 hover:text-brand transition-colors"
              >
                View Menu
              </a>
            </div>
          </div>

          {/* Stay Block - Desplazado */}
          <div className="md:col-span-5 md:mt-32 relative group">
            <div className="relative overflow-hidden mb-6">
              <img
                src="https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2670&auto=format&fit=crop"
                className="w-full h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
                alt="Luxury Cottages"
              />
            </div>
            <div className="md:absolute -left-12 top-12 bg-dark text-white p-10 max-w-xs shadow-2xl z-20">
              <div className="flex items-center gap-3 mb-4">
                <Wifi size={16} className="text-brand" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Stay
                </span>
              </div>
              <h3 className="text-3xl font-serif mb-6">
                Luxury Vineyard Cottages
              </h3>
              <button className="w-full px-6 py-4 border border-white/30 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                Book a Night <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
