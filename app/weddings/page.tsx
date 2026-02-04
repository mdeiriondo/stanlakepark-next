import React from "react";
import WeddingNav from "@/components/layout/WeddingNav";
import WeddingHero from "@/components/layout/WeddingHero";
import VenueShowcase from "@/components/layout/VenueShowcase";
import Footer from "@/components/layout/Footer";

export default function WeddingsPage() {
  return (
    <main className="bg-white min-h-screen selection:bg-gray-200 selection:text-black">
      {/* Navegación específica para Bodas (Estilo Light) */}
      <WeddingNav />

      {/* Hero: Love & Legacy */}
      <WeddingHero />

      {/* Grid de Venues (Coach House, Garden, etc) */}
      <VenueShowcase />

      {/* Reutilizamos el Footer global */}
      <Footer />
    </main>
  );
}
