import React from "react";
import WeddingNav from "@/components/layout/WeddingNav";
import Footer from "@/components/layout/Footer";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

export default function CateringPage() {
  return (
    <main className="bg-white min-h-screen text-dark">
      <WeddingNav />

      <div className="pt-48 pb-24 px-6 text-center">
        <Reveal>
          <span className="text-gold font-bold uppercase tracking-[0.4em] text-xs mb-6 block">
            Exquisite Dining
          </span>
          <h1 className="text-6xl md:text-8xl font-serif mb-10">
            Our Catering
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
            We partner with Berkshire's finest chefs to deliver a culinary
            experience that matches the elegance of our wines.
          </p>
        </Reveal>
      </div>

      <section className="pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "The Wedding Breakfast",
              img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2574&auto=format&fit=crop",
            },
            {
              title: "Canapés & Bubbles",
              img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2670&auto=format&fit=crop",
            },
            {
              title: "Evening Food",
              img: "https://images.unsplash.com/photo-1631379578550-7038263db699?q=80&w=2674&auto=format&fit=crop",
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 150}>
              <div className="group cursor-pointer">
                <div className="h-[500px] overflow-hidden mb-6 relative">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
                <h3 className="text-2xl font-serif text-center group-hover:text-gold transition-colors">
                  {item.title}
                </h3>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="text-center mt-20">
          <Button variant="weddingOutline">View Sample Menus</Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
