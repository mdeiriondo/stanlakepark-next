import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import TourCard from "@/components/ui/TourCard";
import Reveal from "@/components/ui/Reveal";
import { getExperienceInfo } from "@/lib/wordpress";

/** Tipos de experiencia que se muestran como "Tours" en /tours */
const TOUR_TYPES = [
  "wine_tour_tasting",
  "wine_cheese_tour",
  "special_tastings",
] as const;

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop";

/** Datos estáticos cuando no hay tours en WordPress (mismo diseño que antes) */
const FALLBACK_TOURS = [
  {
    id: "wine-tour-tasting",
    title: "Wine Tour & Tasting",
    price: "£25.00",
    duration: "2 Hours",
    groupSize: "20",
    badge: "Most Popular",
    image: PLACEHOLDER_IMAGE,
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
      "https://images.unsplash.com/photo-1631379578550-7038263db699?q=80&w=2674&auto=format&fit=crop",
  },
];

export default async function ToursPage() {
  const experiences = await getExperienceInfo();
  const wpTours = experiences.filter((exp) =>
    TOUR_TYPES.includes(exp.experienceDetails.experienceType as (typeof TOUR_TYPES)[number])
  );

  const useWordPress = wpTours.length > 0;
  const toursToShow = useWordPress
    ? wpTours.map((tour) => ({
        id: tour.slug,
        title: tour.title,
        price:
          tour.pricing.basePrice > 0
            ? `£${tour.pricing.basePrice.toFixed(2)}`
            : "Consult",
        duration: tour.experienceDetails.duration || "—",
        groupSize: undefined as string | undefined,
        badge: tour.experienceDetails.badge ?? undefined,
        image: tour.featuredImage?.node?.sourceUrl || PLACEHOLDER_IMAGE,
      }))
    : FALLBACK_TOURS;

  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      <PageHero
        title="Vineyard Tours"
        subtitle="Discover the Magic Behind the Bottle"
        video="https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4"
        image="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop"
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

      {/* Lista de Tours (WordPress si hay datos, si no datos estáticos) */}
      <section className="pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {toursToShow.map((tour, i) => (
            <Reveal key={tour.id} delay={i * 100}>
              <TourCard
                id={tour.id}
                title={tour.title}
                price={tour.price}
                duration={tour.duration}
                image={tour.image}
                badge={tour.badge}
                groupSize={tour.groupSize}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
