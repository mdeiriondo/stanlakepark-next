"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, Gift, Clock, Calendar, Check, ArrowRight } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import TicketTailorModal from '@/components/ui/TicketTailorModal';

// Interfaz alineada estrictamente con stanlake-acf-setup.json
interface Experience {
  databaseId: number;
  slug: string;
  title: string;
  content: string; // Editor principal de WP
  featuredImage?: {
    node: {
      sourceUrl: string;
    }
  };
  experienceDetails: {
    experienceType: 'wine_tour_tasting' | 'wine_cheese_tour' | 'wine_cream_tea' | 'wine_cheese_tasting' | 'work_vineyard' | 'special_tastings' | 'special_events' | 'wset_courses';
    duration: string;
    badge: string | null;
    shortDescription: string;
    whatsIncluded: { item: string }[];
  };
  pricing: {
    basePrice: number;
    pricingType: string;
  };
  scheduling: {
    scheduleType: string;
    // Para simplificar en el frontend, asumimos que el backend 
    // nos puede enviar un string amigable o procesamos los repeaters
    displaySchedule?: string; 
  };
  /** ID del evento en Ticket Tailor para reservas integradas */
  ticketTailorEventId: string | null;
}

interface ExperienceHubProps {
  initialData: Experience[];
}

export default function ExperienceHub({ initialData = [] }: ExperienceHubProps) {
  const [activeTab, setActiveTab] = useState<'tours' | 'seasonal' | 'lifestyle'>('tours');
  const [openId, setOpenId] = useState<number | null>(null);
  const [modalEventId, setModalEventId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mapeo de los tipos de ACF a las pestañas de la UI
  const tabMapping = {
    tours: ['wine_tour_tasting', 'wine_cheese_tour', 'special_tastings'],
    seasonal: ['wine_cream_tea', 'wine_cheese_tasting', 'special_events'],
    lifestyle: ['work_vineyard', 'wset_courses']
  };

  // Filtrado dinámico según la pestaña activa
  const filteredExperiences = useMemo(() => {
    return initialData.filter(exp => 
      tabMapping[activeTab].includes(exp.experienceDetails.experienceType)
    );
  }, [activeTab, initialData]);

  // Si no hay datos (fallback/loading), mostramos un estado vacío elegante
  if (!initialData.length) return null;

  return (
    <section className="py-32 bg-[#F2F0E9] relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* CABECERA Y TABS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
           <Reveal>
             <span className="text-brand font-bold tracking-[0.2em] text-[10px] uppercase mb-4 block">Visit Us</span>
             <h2 className="text-5xl md:text-7xl font-serif text-dark leading-none">Curated <br/> Experiences</h2>
           </Reveal>
           
           <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
              {(['Tours', 'Seasonal', 'Lifestyle'] as const).map(tab => (
                 <button 
                   key={tab}
                   onClick={() => {
                     setActiveTab(tab.toLowerCase() as any);
                     setOpenId(null); // Cerrar acordeones al cambiar de pestaña
                   }}
                   className={`px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 whitespace-nowrap shadow-sm ${activeTab === tab.toLowerCase() ? 'bg-brand text-white shadow-xl' : 'bg-white text-gray-400 hover:text-dark'}`}
                 >
                   {tab}
                 </button>
              ))}
           </div>
        </div>

        {/* LISTADO DE EXPERIENCIAS (ACORDEÓN) */}
        <div className="grid grid-cols-1 gap-4">
           {filteredExperiences.map((exp, i) => (
              <Reveal delay={i * 100} key={exp.databaseId}>
                 <div 
                   onClick={() => setOpenId(openId === exp.databaseId ? null : exp.databaseId)}
                   className={`bg-white group cursor-pointer transition-all duration-700 overflow-hidden relative ${openId === exp.databaseId ? 'shadow-2xl scale-[1.01] my-4 rounded-sm' : 'hover:bg-white/80 border-b border-brand/10'}`}
                 >
                    {/* Header del Item */}
                    <div className="p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                       <div className="flex items-center gap-6 md:gap-10">
                          <span className="font-mono text-[10px] text-brand/30">0{i + 1}</span>
                          <span className="font-serif text-3xl md:text-5xl text-dark group-hover:text-brand transition-colors duration-500">{exp.title}</span>
                          {exp.experienceDetails.badge && (
                            <span className="hidden lg:inline-block px-3 py-1 bg-[#F2F0E9] text-brand text-[9px] font-bold uppercase tracking-widest rounded-full">
                                {exp.experienceDetails.badge.replace('_', ' ')}
                            </span>
                          )}
                       </div>
                       
                       <div className="flex items-center gap-8 md:gap-16">
                          <div className="text-right hidden md:block">
                             <span className="block text-2xl font-serif">
                                {exp.pricing.basePrice > 0 ? `£${exp.pricing.basePrice}` : 'Varies'}
                             </span>
                             <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Per Person</span>
                          </div>
                          <div className={`w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center transition-all duration-700 ${openId === exp.databaseId ? 'rotate-180 bg-brand text-white border-brand shadow-lg' : 'group-hover:border-brand'}`}>
                             <ChevronDown size={18} strokeWidth={1.5} />
                          </div>
                       </div>
                    </div>

                    {/* Contenido Expandido */}
                    <div className={`transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${openId === exp.databaseId ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-t border-gray-100">
                          
                          {/* Imagen */}
                          <div className="md:col-span-5 h-[400px] md:h-auto relative overflow-hidden">
                             <img 
                                src={exp.featuredImage?.node.sourceUrl || "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop"} 
                                className="w-full h-full object-cover transition-transform duration-[3s] hover:scale-105" 
                                alt={exp.title} 
                             />
                             <div className="absolute inset-0 bg-dark/10"></div>
                          </div>

                          {/* Info Detallada */}
                          <div className="md:col-span-7 p-8 md:p-16 flex flex-col justify-between bg-white">
                             <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-6">About the Experience</h4>
                                <p className="font-serif text-xl md:text-2xl text-gray-600 leading-relaxed mb-10 italic">
                                   {exp.experienceDetails.shortDescription}
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-12">
                                   <div className="flex items-start gap-4">
                                      <div className="w-10 h-10 rounded-full bg-[#F2F0E9] flex items-center justify-center shrink-0">
                                         <Clock size={16} className="text-brand" />
                                      </div>
                                      <div>
                                         <span className="block text-[10px] font-bold uppercase tracking-widest text-dark mb-1">Duration</span>
                                         <span className="text-sm text-gray-500">{exp.experienceDetails.duration}</span>
                                      </div>
                                   </div>
                                   <div className="flex items-start gap-4">
                                      <div className="w-10 h-10 rounded-full bg-[#F2F0E9] flex items-center justify-center shrink-0">
                                         <Calendar size={16} className="text-brand" />
                                      </div>
                                      <div>
                                         <span className="block text-[10px] font-bold uppercase tracking-widest text-dark mb-1">Availability</span>
                                         <span className="text-sm text-gray-500">{exp.scheduling.displaySchedule || 'Check Calendar'}</span>
                                      </div>
                                   </div>
                                </div>

                                {/* Listado de "What's Included" (Repeater ACF) */}
                                {exp.experienceDetails.whatsIncluded?.length > 0 && (
                                   <div className="mb-12">
                                      <span className="block text-[10px] font-bold uppercase tracking-widest text-dark mb-6">What's Included</span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                         {exp.experienceDetails.whatsIncluded.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-sm text-gray-500">
                                               <div className="w-4 h-4 rounded-full bg-brand/10 flex items-center justify-center">
                                                  <Check size={10} className="text-brand" />
                                               </div>
                                               {item.item}
                                            </div>
                                         ))}
                                      </div>
                                   </div>
                                )}
                             </div>

                             {/* Footer de la Card con CTAs */}
                             <div className="flex flex-col sm:flex-row justify-between items-center pt-10 border-t border-gray-100 gap-8">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand flex items-center gap-3 cursor-pointer hover:underline group/gift">
                                   <Gift size={16} className="group-hover/gift:rotate-12 transition-transform"/> Buy as Gift
                                </span>
                                {exp.ticketTailorEventId ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Evitar que se cierre el acordeón
                                      setModalEventId(exp.ticketTailorEventId);
                                      setIsModalOpen(true);
                                    }}
                                    className="relative px-10 py-5 text-[11px] font-bold uppercase tracking-[0.25em] transition-all duration-500 overflow-hidden group border select-none flex items-center justify-center gap-3 w-full sm:w-auto border-[#760235] bg-[#760235] text-white hover:bg-white hover:text-[#760235]"
                                  >
                                    <span className="relative z-10 flex items-center gap-3">
                                      Book Experience
                                      <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
                                    </span>
                                  </button>
                                ) : (
                                  <Link
                                    href={`/tours/${exp.slug}`}
                                    className="relative px-10 py-5 text-[11px] font-bold uppercase tracking-[0.25em] transition-all duration-500 overflow-hidden group border select-none flex items-center justify-center gap-3 w-full sm:w-auto border-[#760235] bg-[#760235] text-white hover:bg-white hover:text-[#760235]"
                                  >
                                    <span className="relative z-10 flex items-center gap-3">
                                      Book Experience
                                      <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
                                    </span>
                                  </Link>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </Reveal>
           ))}

           {/* Mensaje si no hay experiencias en esa categoría */}
           {filteredExperiences.length === 0 && (
             <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-sm">
                <p className="text-gray-400 font-serif italic text-xl">There are no experiences available in this category at this time.</p>
             </div>
           )}
        </div>
      </div>

      {/* Modal de Ticket Tailor */}
      <TicketTailorModal
        eventId={modalEventId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalEventId(null);
        }}
      />
    </section>
  );
}