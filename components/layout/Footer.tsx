import React from "react";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-24 px-6 border-t border-white/10">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="font-serif font-black text-3xl tracking-tighter mb-6">
            STANLAKE PARK
          </div>
          <p className="text-gray-500 max-w-sm font-light leading-relaxed mb-8">
            A historic estate in Twyford, Berkshire. Home to award-winning
            English wine, unforgettable weddings, and rural escapes since 1166.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand transition-all"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand transition-all"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand transition-all"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-8">
            Explore
          </h4>
          <ul className="space-y-4 text-sm text-gray-400 font-light">
            <li>
              <Link href="/shop" className="hover:text-white transition-colors">
                Our Wines
              </Link>
            </li>
            <li>
              <Link
                href="/tours"
                className="hover:text-white transition-colors"
              >
                Tours & Tastings
              </Link>
            </li>
            <li>
              <Link
                href="/wine-bar"
                className="hover:text-white transition-colors"
              >
                The Wine Bar
              </Link>
            </li>
            <li>
              <Link
                href="/weddings"
                className="hover:text-white transition-colors"
              >
                Weddings
              </Link>
            </li>
            <li>
              <Link href="/stay" className="hover:text-white transition-colors">
                Stay at Stanlake
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-8">
            Newsletter
          </h4>
          <p className="text-xs text-gray-500 mb-6 font-light">
            Join our community for exclusive wine releases and estate news.
          </p>
          <div className="flex border-b border-gray-800 pb-2">
            <input
              type="email"
              placeholder="Email Address"
              className="bg-transparent w-full outline-none text-white placeholder-gray-700 text-sm"
            />
            <button className="text-[10px] font-bold uppercase tracking-widest text-white hover:text-gold transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-gray-900 flex justify-between text-[10px] text-gray-600 uppercase tracking-widest">
        <span>© 2026 Stanlake Park Wine Estate</span>
        <span>Berkshire, UK</span>
      </div>
    </footer>
  );
}
