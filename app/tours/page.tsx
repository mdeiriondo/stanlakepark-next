import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Reveal from '@/components/ui/Reveal';
import ExperienceCard from '@/components/ui/ExperienceCard';
import TransitionLink from '@/components/ui/TransitionLink';

const GET_TOURS = `
  query GetTours {
    experiences(first: 100) {
      nodes {
        slug
        title
        formattedPrice
        experienceDetails {
          shortDescription
          basePrice
          duration
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        experienceGroups {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

async function getTours() {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    console.error('WORDPRESS_GRAPHQL_ENDPOINT not configured');
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: GET_TOURS }),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`GraphQL request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const json = await response.json();
    
    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      return null;
    }

    const allExperiences = json.data?.experiences?.nodes ?? [];
    console.log(`Found ${allExperiences.length} total experiences`);
    
    // Filtrar solo las experiencias que pertenecen al grupo "Tours"
    // El nombre del grupo puede ser "Tours", "tours", o similar - verificamos ambos
    const tours = allExperiences.filter((exp: {
      title?: string;
      experienceGroups?: { nodes?: Array<{ name?: string; slug?: string }> };
    }) => {
      const groups = exp.experienceGroups?.nodes ?? [];
      const isTour = groups.some(
        (group) =>
          group.name?.toLowerCase() === 'tours' ||
          group.slug?.toLowerCase() === 'tours'
      );
      if (isTour) {
        console.log(`Tour found: ${exp.title}`, groups);
      }
      return isTour;
    });
    
    console.log(`Found ${tours.length} tours after filtering`);
    return tours.length > 0 ? tours : null;
  } catch (error) {
    console.error('Error fetching tours:', error);
    return null;
  }
}

export const metadata = {
  title: 'Vineyard Tours | Stanlake Park Wine Estate',
  description: 'Guided vineyard tours and wine tastings at Stanlake Park.',
};

export default async function ToursPage() {
  const tours = await getTours();

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

      {/* Lista de Tours */}
      <section className="pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        {tours && tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour: {
              slug: string;
              title: string;
              formattedPrice?: string;
              experienceDetails?: { shortDescription?: string; basePrice?: string; duration?: string };
              featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
            }, i: number) => {
              const price = tour.formattedPrice ||
                (tour.experienceDetails?.basePrice
                  ? `£${parseFloat(tour.experienceDetails.basePrice).toFixed(2)}`
                  : null);
              return (
                <Reveal key={tour.slug} delay={i * 100}>
                  <ExperienceCard
                    slug={tour.slug}
                    title={tour.title}
                    price={price || undefined}
                    image={tour.featuredImage?.node?.sourceUrl}
                    duration={tour.experienceDetails?.duration}
                  />
                </Reveal>
              );
            })}
          </div>
        ) : (
          <Reveal>
            <div className="text-center py-16 max-w-xl mx-auto">
              <p className="text-gray-600 mb-4">
                {process.env.WORDPRESS_GRAPHQL_ENDPOINT
                  ? 'No tours are available yet, or the connection to the content source failed.'
                  : 'Configure WORDPRESS_GRAPHQL_ENDPOINT in .env.local to load tours from WordPress.'}
              </p>
              {process.env.WORDPRESS_GRAPHQL_ENDPOINT && (
                <p className="text-xs text-gray-400 mb-6">
                  Endpoint: {process.env.WORDPRESS_GRAPHQL_ENDPOINT}
                  <br />
                  Check server logs for detailed error messages.
                </p>
              )}
              <TransitionLink href="/experiences" className="text-brand font-semibold border-b border-brand pb-1">
                View all experiences
              </TransitionLink>
            </div>
          </Reveal>
        )}
      </section>

      <Footer />
    </main>
  );
}
