import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/layout/Hero";
import ExperienceHub from "@/components/layout/ExperienceHub";
import TheCellar from "@/components/layout/TheCellar";
import EditorialPillars from "@/components/layout/EditorialPillars";
import Footer from "@/components/layout/Footer";
import { getExperiences, type Experience } from "@/lib/wordpress";

const MOCK_EXPERIENCES: Experience[] = [
  {
    databaseId: 1,
    slug: "wine-tour-tasting",
    title: "Wine Tour & Tasting",
    content: "",
    experienceDetails: {
      experienceType: "wine_tour_tasting",
      duration: "1.5 hours",
      badge: "Most Popular",
      shortDescription: "Explore our historic vineyard and taste award-winning wines.",
      whatsIncluded: [{ item: "5 wine tastings" }, { item: "Guided tour" }]
    },
    pricing: { basePrice: 20, pricingType: "fixed" },
    scheduling: { scheduleType: "recurring", displaySchedule: "Fri - Sun" },
    ticketTailorEventId: "2061731" // ID de ejemplo para pruebas
  }
];

export default async function Home() {
  const experiences = await getExperiences();
  const initialData = experiences.length > 0 ? experiences : MOCK_EXPERIENCES;

  return (
    <main className="relative min-h-screen w-full bg-white">
      {/* 1. Navegación Global (Winery Mode) */}
      <Navbar mode="winery" />

      {/* 2. Hero Section con Ken Burns */}
      <Hero />

      {/* 3. El Hub de Experiencias (Tours, Seasonal, Lifestyle) */}
      <ExperienceHub initialData={initialData} />

      {/* 4. La Cava (Vinos Premium) */}
      <TheCellar />

      {/* 5. Secciones Editoriales (Wine Bar & Stay) */}
      <EditorialPillars />

      {/* 6. Pie de Página */}
      <Footer />
    </main>
  );
}
