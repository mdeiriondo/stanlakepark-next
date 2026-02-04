import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import TourCard from "@/components/ui/TourCard";
import Reveal from "@/components/ui/Reveal";

// Datos estáticos de tours
const TOURS = [
  {
    id: "wine-tour-tasting",
    title: "Wine Tour & Tasting",
    price: "£25.00",
    duration: "2 Hours",
    groupSize: "20",
    badge: "Most Popular",
    image:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: "cheese-wine-tour",
    title: "Cheese & Wine Tour",
    price: "£35.00",
    duration: "2.5 Hours",
    groupSize: "16",
    badge: "Foodie Choice",
    image:
      "https://images.unsplash.com/photo-1631379578550-7038263db699?q=80&w=2674&auto=format&fit=crop",
  },
  {
    id: "private-tour",
    title: "Private Group Tour",
    price: "From £300",
    duration: "Custom",
    badge: "Exclusive",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2574&auto=format&fit=crop",
  },
  {
    id: "grand-tour",
    title: "The Grand Tour",
    price: "£65.00",
    duration: "4 Hours",
    groupSize: "10",
    image:
      "https://images.unsplash.com/photo-1533090481720-856c6e3c19c5?q=80&w=2668&auto=format&fit=crop",
  },
];

export default function ToursPage() {
  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      <PageHero
        title="Vineyard Tours"
        subtitle="Discover the Magic Behind the Bottle"
        image="https://images.unsplash.com/photo-1533090481720-856c6e3c19c5?q=80&w=2668&auto=format&fit=crop"
      />

      {/* Intro */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="font-serif text-3xl md:text-4xl leading-relaxed text-dark mb-8">
              "Walking the vines with a glass in hand is the only way to truly
              understand English wine."
            </p>
            <p className="text-gray-500 text-lg leading-relaxed font-light">
              Join our expert guides for a journey through our 17th-century
              estate. Visit the historic cellar, learn about our winemaking
              process, and finish with a guided tasting of our award-winning
              wines.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Lista de Tours */}
      <section className="pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TOURS.map((tour, i) => (
            <Reveal key={tour.id} delay={i * 100}>
              <TourCard {...tour} />
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
