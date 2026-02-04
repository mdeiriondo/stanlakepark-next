"use client";

import React from "react";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import TransitionLink from "@/components/ui/TransitionLink";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=2000&auto=format&fit=crop",
  barn: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
};

export default function WeddingHero() {
  return (
    <header className="relative pt-48 pb-32 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen flex flex-col justify-center bg-white text-dark">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
        {/* Texto Izquierda */}
        <div className="lg:col-span-5 relative z-10 order-2 lg:order-1 pl-4 lg:pl-24">
          <Reveal>
            <div className="w-20 h-[1px] bg-gold mb-12"></div>
            <span className="font-serif italic text-4xl text-gray-300 mb-10 block leading-none">
              Your Fairytale in Berkshire
            </span>
            <h1 className="text-7xl md:text-[9rem] font-serif text-dark uppercase tracking-tighter leading-[0.8] mb-14">
              Love <br /> & Legacy.
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-16 max-w-md leading-relaxed font-light border-l-[4px] border-gray-100 pl-12 italic">
              "Exclusive use of our 17th-century barns, walled gardens, and
              centuries-old estate."
            </p>
            <div className="flex flex-col sm:flex-row gap-10">
              {/* LINK CONECTADO */}
              <TransitionLink href="/weddings/enquire">
                <Button variant="wedding">Enquire Now</Button>
              </TransitionLink>

              {/* Placeholder para Virtual Tour */}
              <Button
                variant="weddingOutline"
                onClick={() => alert("Virtual Tour Modal coming soon!")}
              >
                Virtual Tour
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Imagen Derecha con Arco */}
        <div className="lg:col-span-7 h-[60vh] lg:h-[85vh] relative order-1 lg:order-2">
          <div className="absolute top-0 right-0 w-[95%] h-full rounded-t-[400px] overflow-hidden shadow-2xl">
            <img
              src={IMAGES.hero}
              className="w-full h-full object-cover animate-ken-burns"
              alt="Wedding at Stanlake Park"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
          </div>

          {/* Imagen Flotante Pequeña */}
          <div className="absolute bottom-20 left-0 w-[45%] h-[40%] bg-white p-4 shadow-2xl transform -rotate-2 hidden lg:block transition-transform hover:rotate-0 duration-700 ease-out">
            <div className="w-full h-full overflow-hidden">
              <img
                src={IMAGES.barn}
                className="w-full h-full object-cover"
                alt="The Coach House Barn"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
