"use client";

import React, { useState } from "react";
import { ChevronDown, Gift } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const EXPERIENCES = {
  tours: [
    {
      id: 1,
      title: "Wine Tour & Tasting",
      price: "£20",
      img: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop",
      badge: "Most Popular",
      desc: "Our signature experience. Walk the vines, visit the 17th-century cellar, and taste 6 award-winning wines.",
      details: "90 Min • Fri-Sun",
    },
    {
      id: 2,
      title: "Wine & Cheese Tour",
      price: "£30",
      img: "https://images.unsplash.com/photo-1631379578550-7038263db699?q=80&w=2674&auto=format&fit=crop",
      badge: "Sunday Special",
      desc: "Premium tour including a guided pairing with British artisanal cheeses.",
      details: "90 Min • Sundays 11AM",
    },
    {
      id: 6,
      title: "Special Tastings",
      price: "£35",
      img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2574&auto=format&fit=crop",
      badge: "Limited",
      desc: "Ad-hoc themed tastings: Wines of Italy, Sparkling World, and more.",
      details: "Variable Schedule",
    },
  ],
  seasonal: [
    {
      id: 3,
      title: "Wine & Cream Tea",
      price: "£35",
      img: "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?q=80&w=2670&auto=format&fit=crop",
      badge: "Summer Only",
      desc: "Quintessentially English. Vineyard tour followed by scones, jam and clotted cream.",
      details: "May-Sept • Wed",
    },
    {
      id: 4,
      title: "Wine & Cheese Tasting",
      price: "£25",
      img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2574&auto=format&fit=crop",
      badge: "Relaxed",
      desc: "Casual evening tasting in the Wine Bar. No tour involved.",
      details: "Fridays 6PM",
    },
  ],
  lifestyle: [
    {
      id: 5,
      title: "Work from Vineyard",
      price: "£15",
      img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2670&auto=format&fit=crop",
      badge: "Day Pass",
      desc: "High-speed WiFi, unlimited coffee, and vineyard views.",
      details: "Tue-Fri • 9AM-2PM",
    },
    {
      id: 8,
      title: "WSET Courses",
      price: "External",
      img: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=2601&auto=format&fit=crop",
      badge: "Education",
      desc: "Professional wine qualifications hosted at the estate.",
      details: "Level 1-3",
    },
  ],
};

export default function ExperienceHub() {
  const [activeTab, setActiveTab] = useState<
    "tours" | "seasonal" | "lifestyle"
  >("tours");
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <section className="py-32 bg-[#F2F0E9] relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
          <Reveal>
            <span className="text-[#760235] font-bold tracking-[0.2em] text-[10px] uppercase mb-4 block">
              Visit Us
            </span>
            <h2 className="text-5xl md:text-7xl font-serif text-[#0a0a0a] leading-none">
              Curated <br /> Experiences
            </h2>
          </Reveal>

          <div className="mt-8 md:mt-0 flex gap-4 overflow-x-auto pb-2 md:pb-0">
            {["Tours", "Seasonal", "Lifestyle"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase() as any)}
                className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.toLowerCase() ? "bg-[#760235] text-white shadow-lg" : "bg-white text-gray-400 hover:text-black"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {EXPERIENCES[activeTab].map((exp, i) => (
            <Reveal delay={i * 100} key={exp.id}>
              <div
                onClick={() => setOpenId(openId === exp.id ? null : exp.id)}
                className={`bg-white group cursor-pointer transition-all duration-500 overflow-hidden relative ${openId === exp.id ? "shadow-2xl scale-[1.01] my-4 rounded-sm" : "hover:bg-white/80 border-b border-[#760235]/10"}`}
              >
                <div className="p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <span className="font-serif text-4xl md:text-5xl text-[#0a0a0a] group-hover:text-[#760235] transition-colors">
                      {exp.title}
                    </span>
                    {exp.badge && (
                      <span className="px-3 py-1 bg-[#F2F0E9] text-[#760235] text-[9px] font-bold uppercase tracking-widest rounded-full">
                        {exp.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-8 md:gap-16">
                    <div className="text-right hidden md:block">
                      <span className="block text-2xl font-serif">
                        {exp.price}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-gray-400">
                        Per Person
                      </span>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-transform duration-500 ${openId === exp.id ? "rotate-180 bg-[#760235] text-white border-[#760235]" : "group-hover:border-[#760235]"}`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div
                  className={`transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${openId === exp.id ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-t border-gray-100">
                    <div className="md:col-span-5 h-[300px] md:h-auto relative">
                      <img
                        src={exp.img}
                        className="w-full h-full object-cover"
                        alt={exp.title}
                      />
                    </div>
                    <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between bg-white">
                      <div>
                        <p className="font-serif text-xl md:text-2xl text-gray-600 leading-relaxed mb-8">
                          {exp.desc}
                        </p>
                        <div className="grid grid-cols-2 gap-8 mb-8">
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                              Details
                            </span>
                            <span className="text-sm font-medium">
                              {exp.details}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                              Includes
                            </span>
                            <span className="text-sm font-medium">
                              Guide, Tasting,{" "}
                              {exp.title.includes("Cheese")
                                ? "Cheese Board"
                                : "Glass"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#760235] flex items-center gap-2">
                          <Gift size={14} /> Buy as Gift
                        </span>
                        <button className="px-8 py-4 bg-[#760235] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#5a0128] transition-all">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
