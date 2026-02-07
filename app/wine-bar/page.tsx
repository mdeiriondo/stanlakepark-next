import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { Coffee, Wine, Utensils, Clock } from "lucide-react";

export default function WineBarPage() {
  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      <PageHero
        title="The Wine Bar"
        subtitle="Eat, Drink & Relax"
        image="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2574&auto=format&fit=crop"
      />

      {/* Intro Editorial */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-serif text-dark mb-6">
              A Barn Reimagined
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Housed in our beautifully restored 17th-century barn, the Wine Bar
              is the heart of Stanlake Park. It's a place to unwind, taste our
              full range of wines, and enjoy locally sourced British produce.
            </p>
            <div className="flex gap-4 text-sm font-bold uppercase tracking-widest text-gold">
              <span className="flex items-center gap-2">
                <Clock size={16} /> Tue - Sun
              </span>
              <span className="flex items-center gap-2">
                <Wine size={16} /> No Booking Needed
              </span>
            </div>
          </Reveal>
          <div className="relative h-[400px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2670&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              alt="Interior"
            />
          </div>
        </div>
      </section>

      {/* Menú Highlights */}
      <section className="py-32 bg-[#F9F9F9]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-brand font-bold tracking-[0.3em] text-xs uppercase mb-4 block">
                Taste of Berkshire
              </span>
              <h2 className="text-5xl font-serif text-dark">On The Menu</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: Wine,
                  title: "Wines by the Glass",
                  desc: "Try any of our wines without committing to a bottle. Flights available.",
                },
                {
                  icon: Utensils,
                  title: "Cheese & Charcuterie",
                  desc: "Curated boards featuring local cheeses and artisan cured meats.",
                },
                {
                  icon: Coffee,
                  title: "Coffee & Cakes",
                  desc: "Locally roasted coffee and homemade cakes for a lighter treat.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-10 shadow-sm border-t-4 border-brand text-center group hover:-translate-y-2 transition-transform duration-500"
                >
                  <item.icon size={32} className="mx-auto text-brand mb-6" />
                  <h3 className="text-2xl font-serif mb-4">{item.title}</h3>
                  <p className="text-gray-500 font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Call to Action - Reservas para grupos grandes */}
      <section className="py-24 px-6 text-center">
        <Reveal>
          <h2 className="text-4xl font-serif mb-6">Planning a Gathering?</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-10 text-lg">
            While we operate on a walk-in basis for small groups, we recommend
            booking for parties of 8 or more to ensure the best experience.
          </p>
          <div className="flex justify-center">
            <Button>Book a Table</Button>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
