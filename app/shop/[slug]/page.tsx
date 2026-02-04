import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { ArrowLeft, Check, Star } from "lucide-react";
import Link from "next/link";

// CORRECCIÓN NEXT.JS 15/16:
// 1. params es ahora Promise<{ slug: string }>
// 2. El componente debe ser async
export default async function WineTemplate({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // CORRECCIÓN: Esperamos a que los params se resuelvan
  const { slug } = await params;

  // Ahora sí podemos usar el slug
  const wineName = slug.replace("-", " ").toUpperCase();

  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
        {/* Breadcrumb simple */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-brand mb-12 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Cellar
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Columna Izquierda: Imagen (Editorial Style) */}
          <div className="md:col-span-6 h-[80vh] relative bg-[#F9F9F9] flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-0 border border-gray-100 m-8 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2574&auto=format&fit=crop"
              alt="Wine Bottle"
              className="h-[90%] object-contain drop-shadow-2xl transition-transform duration-1000 group-hover:scale-105 group-hover:rotate-3"
            />
            <div className="absolute bottom-12 right-12 hidden md:block">
              <Star
                className="text-gold w-6 h-6 animate-pulse"
                fill="currentColor"
              />
            </div>
          </div>

          {/* Columna Derecha: Detalles */}
          <div className="md:col-span-6 md:pl-16">
            <Reveal>
              <span className="text-brand font-bold tracking-[0.3em] text-xs uppercase mb-4 block">
                White Wine · 2023 Vintage
              </span>
              <h1 className="text-6xl md:text-8xl font-serif text-dark mb-8 leading-[0.9]">
                {wineName || "KING'S FUMÉ"}
              </h1>
              <p className="text-2xl font-serif text-gray-500 italic mb-10 leading-relaxed">
                "Complex, elegant and beautifully balanced. An English classic
                aged in French oak."
              </p>

              <div className="border-t border-b border-gray-100 py-8 my-10 grid grid-cols-2 gap-8">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Alcohol
                  </span>
                  <span className="text-lg text-dark">11.5%</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Grape
                  </span>
                  <span className="text-lg text-dark">Ortega, Bacchus</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Pairing
                  </span>
                  <span className="text-lg text-dark">
                    Smoked Salmon, Creamy Pasta
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Rating
                  </span>
                  <span className="text-lg text-dark flex gap-1 items-center">
                    96 Points{" "}
                    <span className="text-gray-300 text-xs">(Decanter)</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-serif text-dark">£22.00</span>
                  <div className="flex items-center gap-2 text-green-700 text-xs font-bold uppercase tracking-widest">
                    <Check size={14} /> In Stock
                  </div>
                </div>
                <Button className="w-full">Add to Basket</Button>
                <p className="text-center text-xs text-gray-400 mt-2">
                  Free shipping on orders over £100
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Sección Adicional: Tasting Notes */}
      <section className="bg-cream py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-serif mb-6">Winemaker's Notes</h3>
          <p className="text-gray-600 leading-relaxed font-light text-lg">
            Our King's Fumé is named after the Rebel of Stanlake Park. It is
            made from a careful selection of hand-picked grapes. Fermentation
            takes place in old French oak barrels, adding texture and complexity
            without overpowering the delicate fruit aromas. Notes of stone
            fruit, vanilla and a hint of smokiness.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
