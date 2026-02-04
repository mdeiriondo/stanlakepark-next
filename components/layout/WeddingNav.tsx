"use client";

import React, { useState, useEffect } from "react";
import { Sun } from "lucide-react";
import Button from "@/components/ui/Button";
import TransitionLink from "@/components/ui/TransitionLink";

export default function WeddingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-700 border-b border-gray-100 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md py-4 shadow-sm"
          : "bg-white py-8"
      }`}
    >
      <div className="max-w-[1700px] mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* LINKS IZQUIERDA: Ahora apuntan a las páginas internas */}
        <div className="hidden xl:flex gap-12 text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500">
          <TransitionLink
            href="/weddings/venues/the-coach-house"
            className="hover:text-black transition-colors"
          >
            The Coach House
          </TransitionLink>
          <TransitionLink
            href="/weddings/venues/walled-garden"
            className="hover:text-black transition-colors"
          >
            Walled Garden
          </TransitionLink>
          <TransitionLink
            href="/weddings/catering"
            className="hover:text-black transition-colors"
          >
            Catering
          </TransitionLink>
        </div>

        {/* LOGO CENTRAL */}
        <TransitionLink
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
        >
          <div className="font-serif font-black text-3xl md:text-4xl tracking-tighter leading-none text-dark transition-colors duration-500">
            STANLAKE
          </div>
          <div className="font-sans text-[10px] uppercase tracking-[0.45em] font-bold mt-1 text-gray-400 transition-colors duration-500">
            Weddings
          </div>
        </TransitionLink>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-8">
          <TransitionLink
            href="/"
            className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 text-gray-400 hover:text-brand transition-colors"
          >
            <Sun size={14} /> Back to Winery
          </TransitionLink>

          <TransitionLink href="/weddings/enquire" className="hidden md:block">
            <Button variant="wedding" className="scale-90">
              Enquire
            </Button>
          </TransitionLink>
        </div>
      </div>
    </nav>
  );
}
