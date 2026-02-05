"use client";

import React from "react";
import Link from "next/link";
import TransitionLink from "@/components/ui/TransitionLink";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white py-32 border-t border-white/5 font-sans">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
          {/* Columna 1: Marca */}
          <div className="md:col-span-2">
            <div className="flex flex-col items-start group cursor-default">
              <div className="font-serif font-black text-3xl tracking-tighter leading-none text-white">
                STANLAKE
              </div>
              <div className="font-sans text-[10px] uppercase tracking-[0.45em] font-bold mt-1 text-white/60">
                Park • 1166
              </div>
            </div>
            <p className="mt-10 text-gray-500 max-w-sm font-light leading-relaxed text-lg italic opacity-80">
              "A historic wine estate in Twyford, Berkshire. Home to English wine
              excellence, unforgettable weddings, and rural escapes since 1166."
            </p>
            <div className="flex gap-6 mt-8 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Columna 2: Mapa del Sitio */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#C5A059] mb-10">
              The Estate
            </h4>
            <ul className="space-y-6 text-base text-gray-400 font-light">
              <li>
                <TransitionLink
                  href="/our-wines"
                  className="hover:text-white transition-colors duration-300"
                >
                  Our Wines
                </TransitionLink>
              </li>
              <li>
                <TransitionLink
                  href="/tours"
                  className="hover:text-white transition-colors duration-300"
                >
                  Tours & Tastings
                </TransitionLink>
              </li>
              <li>
                <TransitionLink
                  href="/wine-bar"
                  className="hover:text-white transition-colors duration-300"
                >
                  The Wine Bar
                </TransitionLink>
              </li>
              <li>
                <TransitionLink
                  href="/stay"
                  className="hover:text-white transition-colors duration-300"
                >
                  Stay with Us
                </TransitionLink>
              </li>
              <li>
                <TransitionLink
                  href="/weddings"
                  className="hover:text-white transition-colors duration-300"
                >
                  Weddings
                </TransitionLink>
              </li>
              <li>
                <TransitionLink
                  href="/visit"
                  className="hover:text-white transition-colors duration-300"
                >
                  Contact & Location
                </TransitionLink>
              </li>
            </ul>
          </div>

          {/* Columna 3: Newsletter */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#C5A059] mb-10">
              Journal
            </h4>
            <p className="text-sm text-gray-500 mb-6 font-light">
              Sign up to receive our seasonal cellar notes and estate updates.
            </p>
            <div className="flex border-b border-white/10 pb-3">
              <input
                type="email"
                placeholder="Email Address"
                className="bg-transparent w-full outline-none text-white placeholder-gray-700 text-sm font-light"
              />
              <button className="text-[10px] font-bold uppercase tracking-widest text-white hover:text-[#C5A059] transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between gap-8 text-[10px] text-gray-600 uppercase tracking-[0.4em]">
          <span>© 2026 Stanlake Park Wine Estate</span>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-gray-400">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-400">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
