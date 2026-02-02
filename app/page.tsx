import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/layout/Hero";
import ExperienceHub from "@/components/layout/ExperienceHub";
import TheCellar from "@/components/layout/TheCellar";
import EditorialPillars from "@/components/layout/EditorialPillars";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-white">
      {/* 1. Navegación Global (Winery Mode) */}
      <Navbar mode="winery" />

      {/* 2. Hero Section con Ken Burns */}
      <Hero />

      {/* 3. El Hub de Experiencias (Tours, Seasonal, Lifestyle) */}
      <ExperienceHub />

      {/* 4. La Cava (Vinos Premium) */}
      <TheCellar />

      {/* 5. Secciones Editoriales (Wine Bar & Stay) */}
      <EditorialPillars />

      {/* 6. Pie de Página */}
      <Footer />
    </main>
  );
}
