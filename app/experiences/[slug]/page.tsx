// app/experiences/[slug]/page.tsx — Misma plantilla que /tours/[slug], datos desde WordPress
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import { BookingFlowWC } from '@/components/booking/BookingFlowWC';
import TransitionLink from '@/components/ui/TransitionLink';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Info,
  CheckCircle,
} from 'lucide-react';

const GET_EXPERIENCE_BY_SLUG = `
  query GetExperienceBySlug($slug: ID!) {
    experience(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      content
      slug
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails { width height }
        }
      }
      experienceDetails {
        ticketTailorEventId
        basePrice
        duration
        frequency
        schedule
        shortDescription
      }
      highlights
      formattedPrice
      isBookable
      experienceGroups { nodes { name slug } }
    }
  }
`;

const GET_EXPERIENCE_BY_URI = `
  query GetExperienceByUri($uri: ID!) {
    experience(id: $uri, idType: URI) {
      id
      databaseId
      title
      content
      slug
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails { width height }
        }
      }
      experienceDetails {
        ticketTailorEventId
        basePrice
        duration
        frequency
        schedule
        shortDescription
      }
      highlights
      formattedPrice
      isBookable
      experienceGroups { nodes { name slug } }
    }
  }
`;

async function getExperience(slug: string) {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    console.error('WORDPRESS_GRAPHQL_ENDPOINT not configured');
    return null;
  }

  const runQuery = async (query: string, variables: Record<string, string>) => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 60 },
      });
      
      if (!res.ok) {
        console.error(`GraphQL request failed: ${res.status} ${res.statusText}`);
        return null;
      }
      
      const json = await res.json();
      
      if (json.errors) {
        console.error('GraphQL errors:', json.errors);
      }
      
      return json as { data?: { experience?: unknown }; errors?: Array<{ message: string }> };
    } catch (error) {
      console.error('Error fetching experience:', error);
      return null;
    }
  };

  const uri = `/experiences/${slug}/`;
  const byUri = await runQuery(GET_EXPERIENCE_BY_URI, { uri });
  if (byUri?.data?.experience) return byUri.data.experience;

  const bySlug = await runQuery(GET_EXPERIENCE_BY_SLUG, { slug });
  if (bySlug?.data?.experience) return bySlug.data.experience;

  console.warn(`Experience not found for slug: ${slug}`);
  return null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;
  const experience = await getExperience(slug);

  if (!experience) notFound();

  const {
    title,
    content,
    featuredImage,
    experienceDetails,
    highlights,
    isBookable,
    formattedPrice,
  } = experience as {
    title: string;
    content: string;
    featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
    experienceDetails?: {
      ticketTailorEventId?: string;
      basePrice?: string;
      duration?: string;
      frequency?: string;
      schedule?: string;
      shortDescription?: string;
    };
    highlights?: string[] | null;
    isBookable?: boolean;
    formattedPrice?: string;
  };

  const imageUrl =
    featuredImage?.node?.sourceUrl ||
    'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop';
  const price = formattedPrice || experienceDetails?.basePrice || '—';
  const duration = experienceDetails?.duration || '—';
  const schedule =
    experienceDetails?.schedule ||
    (experienceDetails?.frequency != null
      ? typeof experienceDetails.frequency === 'string'
        ? experienceDetails.frequency.replace(/-/g, ' ')
        : String(experienceDetails.frequency)
      : null);

  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      {/* Hero — mismo diseño que tours/[slug] */}
      <div className="relative h-[70vh] w-full overflow-hidden bg-dark">
        <img
          src={imageUrl}
          className="absolute inset-0 w-full h-full object-cover opacity-60 animate-ken-burns"
          alt={title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-20 text-white">
          <Reveal>
            <TransitionLink
              href="/experiences"
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Experiences
            </TransitionLink>
            <h1 className="text-5xl md:text-8xl font-serif mb-6">{title}</h1>
            <div className="flex flex-wrap gap-8 text-sm font-bold uppercase tracking-widest text-gold">
              <span className="flex items-center gap-2">
                <Clock size={16} /> {duration}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={16} /> The Cellar & Vineyard
              </span>
              {schedule && (
                <span className="flex items-center gap-2">
                  <Calendar size={16} /> {schedule}
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Contenido principal — misma columna que tours */}
        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="text-3xl font-serif text-dark mb-8">
              About this Experience
            </h2>
            {content ? (
              <div
                className="text-gray-600 text-lg leading-relaxed mb-8 prose prose-lg max-w-none prose-p:mb-4"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-gray-600 text-lg leading-relaxed mb-16">
                {experienceDetails?.shortDescription ||
                  'Discover this experience at Stanlake Park.'}
              </p>
            )}

            {/* What's Included — datos de WordPress o lista por defecto */}
            <div className="bg-[#F9F9F9] p-10 mb-16 border-l-4 border-brand">
              <h3 className="text-xl font-serif text-dark mb-6">
                What&apos;s Included
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highlights && highlights.length > 0
                  ? highlights.map((item: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-gray-700"
                      >
                        <CheckCircle size={16} className="text-brand" />{' '}
                        {item}
                      </li>
                    ))
                  : [
                      'Guided Vineyard Walk',
                      'Winery Production Tour',
                      'Tasting of 6 Wines',
                      'Expert Guide',
                      '10% Shop Discount',
                      'Souvenir Guide',
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-gray-700"
                      >
                        <CheckCircle size={16} className="text-brand" /> {item}
                      </li>
                    ))}
              </ul>
            </div>

            <h3 className="text-2xl font-serif text-dark mb-6">
              Important Information
            </h3>
            <div className="space-y-6 text-gray-500 font-light">
              <div className="flex gap-4">
                <Info className="shrink-0 text-brand" size={20} />
                <p>
                  Please arrive 10 minutes before the start time. The tour
                  involves walking on grass and uneven ground, so comfortable
                  footwear is recommended.
                </p>
              </div>
              <div className="flex gap-4">
                <Info className="shrink-0 text-brand" size={20} />
                <p>This is an 18+ event. We operate a Challenge 25 policy.</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Sidebar de reserva — mismo layout que tours; contenido dinámico con BookingFlow */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-32 bg-white border border-gray-100 shadow-xl p-10">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-serif text-dark">{price}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Per Person
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-8">
              Instant confirmation • Mobile tickets
            </p>

            {isBookable ? (
              <BookingFlowWC
                experienceSlug={slug}
                experienceName={title}
              />
            ) : (
              <>
                <p className="text-dark/60 text-center py-6">
                  Booking not available for this experience.
                </p>
                <p className="text-center text-xs text-dark/40">
                  Please contact us for more information.
                </p>
              </>
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

export async function generateStaticParams() {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return [];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query { experiences(first: 100) { nodes { slug } } }
      `,
    }),
  });
  const { data } = await res.json();
  return (
    data?.experiences?.nodes?.map((exp: { slug: string }) => ({
      slug: exp.slug,
    })) ?? []
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const experience = await getExperience(slug);
  if (!experience) return { title: 'Experience Not Found' };

  const exp = experience as {
    title: string;
    experienceDetails?: { shortDescription?: string };
    featuredImage?: { node?: { sourceUrl?: string; mediaDetails?: { width?: number; height?: number } } };
  };
  return {
    title: `${exp.title} | Stanlake Park Wine Estate`,
    description: exp.experienceDetails?.shortDescription || exp.title,
    openGraph: {
      title: exp.title,
      description: exp.experienceDetails?.shortDescription,
      images: exp.featuredImage?.node?.sourceUrl
        ? [
            {
              url: exp.featuredImage.node.sourceUrl,
              width: exp.featuredImage.node.mediaDetails?.width,
              height: exp.featuredImage.node.mediaDetails?.height,
            },
          ]
        : [],
    },
  };
}
