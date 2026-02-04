import React from "react";
import WeddingNav from "@/components/layout/WeddingNav";
import Footer from "@/components/layout/Footer";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { Check } from "lucide-react";

// Datos simulados según el slug
const VENUE_DATA: Record<string, any> = {
  "the-coach-house": {
    title: "The Coach House",
    subtitle: "Ceremony & Reception",
    desc: "A beautifully restored 17th-century barn featuring original beams, neutral decor, and views of the courtyard. The perfect blank canvas for your dream wedding.",
    capacity: "Up to 150 Guests",
    features: [
      "Private Courtyard",
      "Fully Licensed Bar",
      "Civil Ceremony License",
      "Disabled Access",
    ],
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
  },
  "walled-garden": {
    title: "The Walled Garden",
    subtitle: "Outdoor Splendour",
    desc: "Hidden behind historic brick walls, our secret garden offers a romantic, intimate setting for outdoor vows surrounded by blooming English roses.",
    capacity: "Up to 100 Guests",
    features: [
      "Outdoor Ceremony",
      "Marquee Available",
      "English Rose Garden",
      "Exclusive Use",
    ],
    image:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2670&auto=format&fit=crop",
  },
};

export default async function VenuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = VENUE_DATA[slug] || VENUE_DATA["the-coach-house"];

  return (
    <main className="bg-white min-h-screen text-dark">
      <WeddingNav />

      {/* Hero Específico */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img
          src={data.image}
          alt={data.title}
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white p-6">
          <Reveal>
            <span className="block text-xs font-bold uppercase tracking-[0.4em] mb-6">
              {data.subtitle}
            </span>
            <h1 className="text-6xl md:text-9xl font-serif">{data.title}</h1>
          </Reveal>
        </div>
      </div>

      <section className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <Reveal>
            <h2 className="text-4xl font-serif mb-8">
              An Unforgettable Setting
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-10">
              {data.desc}
            </p>

            <div className="bg-[#FAFAFA] p-8 border-l-2 border-gold mb-10">
              <span className="block text-xs font-bold uppercase tracking-widest text-gold mb-2">
                Capacity
              </span>
              <span className="text-2xl font-serif">{data.capacity}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {data.features.map((feat: string) => (
                <div
                  key={feat}
                  className="flex items-center gap-3 text-gray-600"
                >
                  <Check size={16} className="text-gold" /> {feat}
                </div>
              ))}
            </div>

            <Button variant="wedding">Download Floorplan</Button>
          </Reveal>
        </div>
        <div className="h-[600px] bg-gray-100 relative">
          <div className="absolute inset-0 m-4 border border-gray-200 pointer-events-none z-10" />
          <img
            src={data.image}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            alt="Detail"
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
