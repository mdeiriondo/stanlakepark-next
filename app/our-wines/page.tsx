import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import WineCard from "@/components/ui/WineCard";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import Link from "next/link";

// Datos simulados enriquecidos
const WINES = {
  sparkling: [
    {
      id: "heritage-brut",
      name: "Heritage Brut",
      type: "Sparkling · Traditional",
      price: "£35.00",
      image:
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop",
      badge: "Gold Medal",
    },
    {
      id: "rose-superior",
      name: "Rosé Superior",
      type: "Sparkling · Pinot Noir",
      price: "£38.00",
      image:
        "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=2601&auto=format&fit=crop",
    },
  ],
  still: [
    {
      id: "kings-fume",
      name: "King's Fumé",
      type: "White · Oak Aged",
      price: "£22.00",
      image:
        "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2574&auto=format&fit=crop",
      badge: "Best Seller",
    },
    {
      id: "pinot-noir",
      name: "Pinot Noir",
      type: "Red · Reserve",
      price: "£26.00",
      image:
        "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop",
    },
    {
      id: "bacchus",
      name: "Bacchus",
      type: "White · Crisp",
      price: "£18.00",
      image:
        "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?q=80&w=2574&auto=format&fit=crop",
    },
  ],
};

export default function OurWinesPage() {
  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      <PageHero
        title="Our Wines"
        subtitle="From Grape to Glass"
        image="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop"
      />

      {/* 1. SECCIÓN EDITORIAL: FILOSOFÍA (Restaurada) */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <span className="text-brand font-bold tracking-[0.3em] text-xs uppercase mb-8 block">
              The Stanlake Philosophy
            </span>
            <p className="font-serif text-3xl md:text-5xl leading-tight text-dark mb-10">
              "We believe that great wine is made in the vineyard. Our
              non-interventionist approach allows the terroir of Berkshire to
              shine through."
            </p>
            <div className="w-20 h-[1px] bg-brand/20 mx-auto mb-10" />
            <p className="text-gray-500 text-lg leading-relaxed font-light max-w-2xl mx-auto">
              Since 1979, we have been pioneers of English winemaking. Our
              estate spans 150 acres, cultivating varietals perfectly suited to
              our cool climate, including Pinot Noir, Chardonnay, and Bacchus.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. ESPUMANTES (Destacados) */}
      <section className="py-24 px-6 md:px-12 bg-[#F9F9F9]">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <Reveal>
              <div className="text-center md:text-left">
                <h2 className="text-5xl font-serif text-dark mb-4">
                  English Sparkling
                </h2>
                <p className="text-gray-500 max-w-md mx-auto md:mx-0">
                  Traditional method wines, aged on lees for exceptional
                  complexity and texture.
                </p>
              </div>
            </Reveal>
            <div className="text-center md:text-right">
              <Link href="/shop">
                <Button variant="outline">View All Sparkling</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {WINES.sparkling.map((wine, i) => (
              <Reveal key={wine.id} delay={i * 100}>
                <div className="h-[500px] w-full">
                  <WineCard {...wine} />
                </div>
              </Reveal>
            ))}
            {/* Card Decorativa de Relleno */}
            <div className="hidden lg:flex col-span-2 bg-dark items-center justify-center relative overflow-hidden group cursor-pointer h-[500px]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="relative z-10 text-center p-10">
                <span className="text-gold text-[10px] font-bold uppercase tracking-widest mb-4 block">
                  Mixed Cases
                </span>
                <h3 className="text-white font-serif text-4xl mb-6">
                  Can't Decide?
                </h3>
                <p className="text-gray-400 font-light mb-8 max-w-sm mx-auto">
                  Try our curated selection cases featuring the best of our
                  cellar.
                </p>
                <Link
                  href="/shop"
                  className="text-white border-b border-white/30 pb-1 text-xs font-bold uppercase tracking-widest hover:text-gold hover:border-gold transition-colors"
                >
                  Shop Mixed Cases
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VINOS TRANQUILOS */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-16 text-center md:text-left">
            <Reveal>
              <h2 className="text-5xl font-serif text-dark mb-4">
                Still Wines
              </h2>
              <p className="text-gray-500 max-w-md mx-auto md:mx-0">
                Crisp whites and delicate reds that express our unique
                microclimate.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {WINES.still.map((wine, i) => (
              <Reveal key={wine.id} delay={i * 100}>
                <div className="h-[500px] w-full">
                  <WineCard {...wine} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA FINAL */}
      <section className="py-32 bg-brand text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="relative z-10">
          <Reveal>
            <h2 className="text-6xl md:text-8xl font-serif mb-10">
              Visit the Shop
            </h2>
            <Link href="/shop">
              <Button variant="whiteOutline">Browse Full Collection</Button>
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
