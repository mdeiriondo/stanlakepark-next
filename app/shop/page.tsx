import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Datos simulados (luego vendrán de tu CMS/WooCommerce)
const WINES = [
  {
    id: "kings-fume",
    name: "King's Fumé",
    type: "White · Oak Aged",
    price: "£22.00",
    image:
      "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2574&auto=format&fit=crop",
  },
  {
    id: "pinot-noir",
    name: "Pinot Noir",
    type: "Red · Reserve",
    price: "£26.00",
    image:
      "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=2601&auto=format&fit=crop",
  },
  {
    id: "heritage-brut",
    name: "Heritage Brut",
    type: "Sparkling",
    price: "£35.00",
    image:
      "https://images.unsplash.com/photo-1536346323287-0b6aa9e7d715?q=80&w=800&h=1200&auto=format&fit=crop",
  },
  {
    id: "bacchus",
    name: "Bacchus",
    type: "White · Crisp",
    price: "£18.00",
    image:
      "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?q=80&w=2574&auto=format&fit=crop",
  },
];

export default function ShopPage() {
  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      <PageHero
        title="The Cellar"
        subtitle="Shop Our Award-Winning Wines"
        image="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop"
      />

      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
          {WINES.map((wine, i) => (
            <Reveal key={wine.id} delay={i * 100}>
              <Link href={`/shop/${wine.id}`} className="group block">
                <div className="relative h-[500px] mb-8 overflow-hidden bg-cream/30">
                  <img
                    src={wine.image}
                    alt={wine.name}
                    className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Botón flotante al hover */}
                  <div className="absolute bottom-0 left-0 w-full bg-brand text-white py-4 text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      View Details
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-brand text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">
                    {wine.type}
                  </span>
                  <h3 className="text-3xl font-serif text-dark mb-2 group-hover:text-brand transition-colors">
                    {wine.name}
                  </h3>
                  <span className="text-lg font-light text-gray-500">
                    {wine.price}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
