// app/experiences/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BookingFlow } from '@/components/booking/BookingFlow';

// GraphQL query para obtener la experiencia
const GET_EXPERIENCE = `
  query GetExperience($slug: ID!) {
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
          mediaDetails {
            width
            height
          }
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
      experienceFeatures {
        highlight1
        highlight2
        highlight3
        highlight4
        highlight5
        highlight6
        includesTitle
        includesDescription
        goodToKnow
      }
      highlights
      formattedPrice
      isBookable
      experienceGroups {
        nodes {
          name
          slug
        }
      }
    }
  }
`;

async function getExperience(slug: string) {
  const response = await fetch(process.env.WORDPRESS_GRAPHQL_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_EXPERIENCE,
      variables: { slug },
    }),
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  const { data } = await response.json();
  return data?.experience;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ExperiencePage({ params }: PageProps) {
  const { slug } = await params;
  const experience = await getExperience(slug);

  if (!experience) {
    notFound();
  }

  const {
    title,
    content,
    featuredImage,
    experienceDetails,
    experienceFeatures,
    highlights,
    isBookable,
  } = experience;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px]">
        {featuredImage?.node?.sourceUrl && (
          <Image
            src={featuredImage.node.sourceUrl}
            alt={featuredImage.node.altText || title}
            fill
            className="object-cover"
            priority
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/40 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">
              {title}
            </h1>
            {experienceDetails?.shortDescription && (
              <p className="text-xl text-cream/90 max-w-2xl">
                {experienceDetails.shortDescription}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Left Column - Content */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Description */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Highlights */}
              {highlights && highlights.length > 0 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-3xl text-dark">
                    What's Included
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {highlights.map((highlight: string, index: number) => (
                      <li 
                        key={index}
                        className="flex items-start gap-3"
                      >
                        <svg 
                          className="h-6 w-6 text-brand shrink-0 mt-0.5"
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                        <span className="text-dark/80">
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Includes */}
              {experienceFeatures?.includesDescription && (
                <div className="space-y-4 p-6 bg-white rounded-lg border border-dark/10">
                  <h3 className="font-serif text-2xl text-dark">
                    {experienceFeatures.includesTitle || "What's Included"}
                  </h3>
                  <div 
                    className="text-dark/70 whitespace-pre-line"
                    dangerouslySetInnerHTML={{ 
                      __html: experienceFeatures.includesDescription 
                    }}
                  />
                </div>
              )}

              {/* Good to Know */}
              {experienceFeatures?.goodToKnow && (
                <div className="space-y-4 p-6 bg-gold/10 rounded-lg border border-gold/20">
                  <h3 className="font-serif text-2xl text-dark">
                    Good to Know
                  </h3>
                  <div 
                    className="text-dark/70 whitespace-pre-line"
                    dangerouslySetInnerHTML={{ 
                      __html: experienceFeatures.goodToKnow 
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                
                {/* Quick Info Card */}
                <div className="p-6 bg-white rounded-lg border border-dark/10 space-y-4">
                  {experienceDetails?.duration && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-dark/60">
                        Duration
                      </p>
                      <p className="mt-1 text-dark font-medium">
                        {experienceDetails.duration}
                      </p>
                    </div>
                  )}

                  {experienceDetails?.schedule && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-dark/60">
                        Schedule
                      </p>
                      <p className="mt-1 text-dark font-medium whitespace-pre-line">
                        {experienceDetails.schedule}
                      </p>
                    </div>
                  )}

                  {experienceDetails?.frequency && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-dark/60">
                        Frequency
                      </p>
                      <p className="mt-1 text-dark font-medium capitalize">
                        {experienceDetails.frequency.replace('-', ' ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Booking Widget */}
                {isBookable && experienceDetails?.ticketTailorEventId ? (
                  <div className="p-6 bg-white rounded-lg border border-dark/10">
                    <BookingFlow
                      ticketTailorEventId={experienceDetails.ticketTailorEventId}
                      experienceName={title}
                    />
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-lg border border-dark/10 text-center">
                    <p className="text-dark/60">
                      Booking not available for this experience.
                    </p>
                    <p className="mt-2 text-sm text-dark/40">
                      Please contact us for more information.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Generate static params for all experiences
export async function generateStaticParams() {
  const GET_ALL_EXPERIENCES = `
    query GetAllExperiences {
      experiences(first: 100) {
        nodes {
          slug
        }
      }
    }
  `;

  const response = await fetch(process.env.WORDPRESS_GRAPHQL_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_ALL_EXPERIENCES,
    }),
  });

  const { data } = await response.json();
  
  return data?.experiences?.nodes?.map((exp: { slug: string }) => ({
    slug: exp.slug,
  })) || [];
}

// Metadata
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const experience = await getExperience(slug);

  if (!experience) {
    return {
      title: 'Experience Not Found',
    };
  }

  return {
    title: `${experience.title} | Stanlake Park Wine Estate`,
    description: experience.experienceDetails?.shortDescription || experience.title,
    openGraph: {
      title: experience.title,
      description: experience.experienceDetails?.shortDescription,
      images: experience.featuredImage?.node?.sourceUrl ? [
        {
          url: experience.featuredImage.node.sourceUrl,
          width: experience.featuredImage.node.mediaDetails?.width,
          height: experience.featuredImage.node.mediaDetails?.height,
        }
      ] : [],
    },
  };
}
