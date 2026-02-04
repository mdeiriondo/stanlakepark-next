import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function VisitPage() {
  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      <PageHero
        title="Visit Us"
        subtitle="Plan Your Trip"
        image="https://images.unsplash.com/photo-1504198266287-1659872e6590?q=80&w=2670&auto=format&fit=crop"
      />

      <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {/* Info Columna */}
          <div>
            <Reveal>
              <h2 className="text-4xl font-serif text-dark mb-10">
                Get in Touch
              </h2>

              <div className="space-y-10">
                <div className="flex gap-6">
                  <MapPin className="text-brand shrink-0" size={24} />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-dark mb-2">
                      Address
                    </h3>
                    <p className="text-gray-600 font-light">
                      Stanlake Park Wine Estate
                      <br />
                      Stanlake Park, Twyford
                      <br />
                      Berkshire, RG10 0BN
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <Clock className="text-brand shrink-0" size={24} />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-dark mb-2">
                      Opening Hours
                    </h3>
                    <div className="text-gray-600 font-light grid grid-cols-2 gap-x-8 gap-y-1">
                      <span>Wine Shop:</span> <span>Tue-Sun 10am - 5pm</span>
                      <span>Wine Bar:</span> <span>Tue-Sun 12pm - 8pm</span>
                      <span>Office:</span> <span>Mon-Fri 9am - 5pm</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6">
                  <Phone className="text-brand shrink-0" size={24} />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-dark mb-2">
                      Contact
                    </h3>
                    <p className="text-gray-600 font-light">0118 934 0176</p>
                    <p className="text-gray-600 font-light">
                      info@stanlakepark.com
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Mapa Placeholder */}
          <div className="h-[500px] bg-gray-100 relative grayscale hover:grayscale-0 transition-all duration-700">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop"
              alt="Map Location"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur px-6 py-3 shadow-xl">
                <span className="text-brand font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  <MapPin size={14} /> View on Google Maps
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
