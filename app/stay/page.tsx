import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { Wifi, Car, Coffee, MapPin } from "lucide-react";

const COTTAGES = [
  {
    name: "North Cottage",
    capacity: "Sleeps 4",
    desc: "A charming two-bedroom cottage overlooking the Pinot Noir vines. Features a private garden, fully equipped kitchen, and a cozy living room with a wood burner.",
    image:
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2670&auto=format&fit=crop",
  },
  {
    name: "The Manor Suite",
    capacity: "Sleeps 2",
    desc: "Our most luxurious option. A private suite within the main manor house, offering breathtaking views of the walled garden and exclusive access to the grounds after hours.",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop",
  },
];

export default function StayPage() {
  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      <PageHero
        title="Stay With Us"
        subtitle="Wake Up in the Vineyard"
        image="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2670&auto=format&fit=crop"
      />

      <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-dark">
              Escape to the Country
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Extend your visit with a stay in one of our historic properties.
              Enjoy the peace of the countryside, just a short train ride from
              London.
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col gap-32">
          {COTTAGES.map((cottage, i) => (
            <div
              key={i}
              className={`flex flex-col md:flex-row gap-12 items-center ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
            >
              <div className="w-full md:w-1/2 h-[500px] relative overflow-hidden group">
                <div className="absolute inset-0 border border-gray-100 m-4 z-10 pointer-events-none" />
                <img
                  src={cottage.image}
                  alt={cottage.name}
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                />
              </div>
              <div className="w-full md:w-1/2 md:px-12">
                <Reveal delay={200}>
                  <span className="text-gold font-bold uppercase tracking-widest text-xs mb-4 block">
                    {cottage.capacity}
                  </span>
                  <h3 className="text-4xl font-serif text-dark mb-6">
                    {cottage.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-8 font-light text-lg">
                    {cottage.desc}
                  </p>

                  <div className="flex gap-6 mb-10 text-gray-400">
                    <span title="Free WiFi">
                      <Wifi size={20} />
                    </span>
                    <span title="Free Parking">
                      <Car size={20} />
                    </span>
                    <span title="Breakfast Hamper">
                      <Coffee size={20} />
                    </span>
                  </div>
                  <Button variant="outline">Check Availability</Button>
                </Reveal>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}