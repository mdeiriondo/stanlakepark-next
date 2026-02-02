"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Menu, Heart, Search } from "lucide-react";
import Link from "next/link";

export default function Navbar({
  mode = "winery",
}: {
  mode?: "winery" | "wedding";
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Clases dinámicas según el modo y el scroll
  const navClasses = scrolled
    ? "bg-dark/95 backdrop-blur-md py-4 shadow-xl"
    : "bg-transparent py-10";

  const textClasses = mode === "wedding" ? "text-dark" : "text-white";
  const logoMainClasses =
    mode === "wedding" ? "text-dark" : "text-white mix-blend-difference";

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-700 ${navClasses}`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Enlaces Izquierda */}
        <div
          className={`hidden lg:flex gap-12 text-[11px] font-bold uppercase tracking-[0.3em] ${scrolled ? "text-white/80" : "text-white/70"}`}
        >
          <Link href="/shop" className="hover:text-white transition-colors">
            Shop
          </Link>
          <Link href="/tours" className="hover:text-white transition-colors">
            Tours
          </Link>
          <Link href="/visit" className="hover:text-white transition-colors">
            Visit
          </Link>
        </div>

        {/* Logo Central */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
        >
          <div
            className={`font-serif font-black text-3xl md:text-4xl tracking-tighter leading-none transition-colors duration-500 ${scrolled ? "text-white" : logoMainClasses}`}
          >
            STANLAKE
          </div>
          <div
            className={`font-sans text-[10px] uppercase tracking-[0.45em] font-bold mt-1 transition-colors duration-500 ${scrolled ? "text-white/60" : "text-white/60 mix-blend-difference"}`}
          >
            Park • 1166
          </div>
        </Link>

        {/* Iconos Derecha */}
        <div
          className={`flex items-center gap-10 ${scrolled ? "text-white" : "text-white"}`}
        >
          <Link
            href="/weddings"
            className="hidden xl:flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all duration-500"
          >
            Weddings <Heart size={12} />
          </Link>

          <div className="flex gap-8">
            <Search
              size={20}
              className="cursor-pointer hover:text-gold transition-colors"
            />
            <div className="relative group">
              <ShoppingBag
                size={20}
                className="cursor-pointer hover:text-gold transition-colors"
              />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full group-hover:scale-125 transition-transform"></span>
            </div>
          </div>

          <Menu className="md:hidden cursor-pointer hover:text-gold" />
        </div>
      </div>
    </nav>
  );
}
