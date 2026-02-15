import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Info,
  CheckCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getExperienceInfoBySlug } from "@/lib/wordpress";
import TicketTailorWidget from "@/components/ui/TicketTailorWidget";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop";

/** Textos estáticos cuando WordPress no tiene contenido */
const STATIC_ABOUT = [
  "Immerse yourself in the history of Stanlake Park. This comprehensive tour takes you through our 17th-century walled garden vineyard, explains the unique microclimate of Berkshire, and leads you into the fascinating world of our winery.",
  "Learn how we transform our grapes into award-winning English wines. The experience concludes in our tasting barn, where you'll sample 6 of our finest wines guided by our expert staff.",
];

const STATIC_WHATS_INCLUDED = [
  "Guided Vineyard Walk",
  "Winery Production Tour",
  "Tasting of 6 Wines",
  "Expert Guide",
  "10% Shop Discount",
  "Souvenir Guide",
];

const STATIC_IMPORTANT_INFO = [
  {
    text: "Please arrive 10 minutes before the start time. The tour involves walking on grass and uneven ground, so comfortable footwear is recommended.",
  },
  {
    text: "This is an 18+ event. We operate a Challenge 25 policy.",
  },
];

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function TourTemplate({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = await getExperienceInfoBySlug(slug);

  const titleText = experience?.title?.rendered?.trim()
    ? experience.title.rendered
    : slugToTitle(slug);
  const featuredImage =
    experience?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? PLACEHOLDER_IMAGE;
  const durationDisplay =
    experience?.acf?.duration_display?.trim() || "2 Hours";
  const displaySchedule =
    experience?.acf?.display_schedule?.trim() || "Fri, Sat, Sun";
  const price =
    experience?.acf?.price != null && experience.acf.price > 0
      ? experience.acf.price
      : 25;
  const priceDisplay = `£${price.toFixed(2)}`;
  const hasBooking = Boolean(experience?.acf?.ticket_tailor_event_id?.trim());
  const ticketTailorEventId = experience?.acf?.ticket_tailor_event_id ?? null;

  const aboutContent = experience?.content?.rendered?.trim();
  const whatsIncluded = experience?.acf?.whats_included?.trim();
  const faq = experience?.acf?.faq;

  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      {/* Hero — mismo diseño que antes */}
      <div className="relative h-[70vh] w-full overflow-hidden bg-dark">
        <img
          src={featuredImage}
          className="absolute inset-0 w-full h-full object-cover opacity-60 animate-ken-burns"
          alt={titleText}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-20 text-white">
          <Reveal>
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Experiences
            </Link>
            <h1 className="text-5xl md:text-8xl font-serif mb-6">{titleText}</h1>
            <div className="flex flex-wrap gap-8 text-sm font-bold uppercase tracking-widest text-gold">
              <span className="flex items-center gap-2">
                <Clock size={16} /> {durationDisplay}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={16} /> The Cellar & Vineyard
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} /> {displaySchedule}
              </span>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Contenido Principal — mismo diseño que antes */}
        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="text-3xl font-serif text-dark mb-8">
              About this Experience
            </h2>
            {aboutContent ? (
              <div
                className="text-gray-600 text-lg leading-relaxed mb-8 prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: aboutContent }}
              />
            ) : (
              <>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {STATIC_ABOUT[0]}
                </p>
                <p className="text-gray-600 text-lg leading-relaxed mb-16">
                  {STATIC_ABOUT[1]}
                </p>
              </>
            )}

            <div className="bg-[#F9F9F9] p-10 mb-16 border-l-4 border-brand">
              <h3 className="text-xl font-serif text-dark mb-6">
                What&apos;s Included
              </h3>
              {whatsIncluded ? (
                <div
                  className="prose text-gray-700"
                  dangerouslySetInnerHTML={{ __html: whatsIncluded }}
                />
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {STATIC_WHATS_INCLUDED.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <CheckCircle size={16} className="text-brand" /> {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <h3 className="text-2xl font-serif text-dark mb-6">
              Important Information
            </h3>
            {faq && faq.length > 0 ? (
              <div className="space-y-6 text-gray-500 font-light">
                {faq.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <Info className="shrink-0 text-brand" size={20} />
                    <p>{item.answer}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 text-gray-500 font-light">
                {STATIC_IMPORTANT_INFO.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <Info className="shrink-0 text-brand" size={20} />
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        </div>

        {/* Sidebar de Reserva (Sticky) — mismo diseño exacto que antes + Ticket Tailor */}
        <div className="lg:col-span-5 relative" id="book-experience">
          <div className="sticky top-32 bg-white border border-gray-100 shadow-xl p-10">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-serif text-dark">{priceDisplay}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Per Person
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-8">
              Instant confirmation • Mobile tickets
            </p>

            <div className="space-y-4 mb-8">
              <div className="p-4 border border-gray-200 cursor-pointer hover:border-brand transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Select Date
                </span>
                <span className="text-dark font-medium flex justify-between items-center">
                  Choose a date <Calendar size={16} />
                </span>
              </div>
              <div className="p-4 border border-gray-200 cursor-pointer hover:border-brand transition-colors">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Guests
                </span>
                <span className="text-dark font-medium flex justify-between items-center">
                  2 Adults <Users size={16} />
                </span>
              </div>
            </div>

            <Button className="w-full justify-center">
              Check Availability
            </Button>

            {hasBooking && ticketTailorEventId && (
              <TicketTailorWidget
                eventId={ticketTailorEventId}
                className="mt-6 mb-2"
              />
            )}

            <p className="text-center text-xs text-gray-400 mt-6">
              Free cancellation up to 48 hours before the event.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
