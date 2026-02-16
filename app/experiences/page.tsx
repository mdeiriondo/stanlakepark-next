import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Reveal from '@/components/ui/Reveal';
import ExperienceCard from '@/components/ui/ExperienceCard';
import TransitionLink from '@/components/ui/TransitionLink';

const GET_EXPERIENCES = `
  query GetExperiences {
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
      }
    }
  }
`;

async function getExperiences() {
  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    console.error('WORDPRESS_GRAPHQL_ENDPOINT not configured');
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: GET_EXPERIENCES }),
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

    const experiences = json.data?.experiences?.nodes ?? [];
    console.log(`Found ${experiences.length} experiences`);
    return experiences.length > 0 ? experiences : null;
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return null;
  }
}

export const metadata = {
  title: 'Experiences | Stanlake Park Wine Estate',
  description: 'Vineyard tours, wine tastings and experiences at Stanlake Park.',
};

export default async function ExperiencesPage() {
  const experiences = await getExperiences();

  return (
    <main className="min-h-screen bg-white">
      <Navbar mode="winery" />

      <PageHero
        title="Experiences"
        subtitle="Tours, tastings and more at Stanlake Park"
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

      {/* Lista de Experiencias */}
      <section className="pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        {experiences && experiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map((exp: {
              slug: string;
              title: string;
              formattedPrice?: string;
              experienceDetails?: { shortDescription?: string; basePrice?: string; duration?: string };
              featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
            }, i: number) => {
              // Usar formattedPrice si existe, sino calcular desde basePrice
              const price = exp.formattedPrice || 
                (exp.experienceDetails?.basePrice 
                  ? `£${parseFloat(exp.experienceDetails.basePrice).toFixed(2)}`
                  : null);
              
              return (
                <Reveal key={exp.slug} delay={i * 100}>
                  <ExperienceCard
                    slug={exp.slug}
                    title={exp.title}
                    price={price || undefined}
                    image={exp.featuredImage?.node?.sourceUrl}
                    duration={exp.experienceDetails?.duration}
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
                    ? 'No experiences are available yet, or the connection to the content source failed.'
                    : 'Configure WORDPRESS_GRAPHQL_ENDPOINT in .env.local to load experiences from WordPress.'}
                </p>
                {process.env.WORDPRESS_GRAPHQL_ENDPOINT && (
                  <p className="text-xs text-gray-400 mb-6">
                    Endpoint: {process.env.WORDPRESS_GRAPHQL_ENDPOINT}
                    <br />
                    Check server logs for detailed error messages.
                  </p>
                )}
                <TransitionLink href="/" className="text-brand font-semibold border-b border-brand pb-1">
                  Back to home
                </TransitionLink>
              </div>
            </Reveal>
          )}
      </section>

      <Footer />
    </main>
  );
}
