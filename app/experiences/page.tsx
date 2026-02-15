import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import Reveal from '@/components/ui/Reveal';
import TransitionLink from '@/components/ui/TransitionLink';

const GET_EXPERIENCES = `
  query GetExperiences {
    experiences(first: 100) {
      nodes {
        slug
        title
        experienceDetails {
          shortDescription
          formattedPrice
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
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: GET_EXPERIENCES }),
      next: { revalidate: 60 },
    });
    const { data } = await response.json();
    return data?.experiences?.nodes ?? null;
  } catch {
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

      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {experiences && experiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experiences.map((exp: {
                slug: string;
                title: string;
                experienceDetails?: { shortDescription?: string; formattedPrice?: string; duration?: string };
                featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
              }) => (
                <Reveal key={exp.slug}>
                  <TransitionLink href={`/experiences/${exp.slug}`} className="block group">
                    <article className="h-full bg-cream/30 rounded-lg overflow-hidden border border-dark/5 hover:border-brand/30 transition-colors duration-300">
                      {exp.featuredImage?.node?.sourceUrl && (
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={exp.featuredImage.node.sourceUrl}
                            alt={exp.featuredImage.node.altText || exp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h2 className="text-xl font-serif text-dark mb-2 group-hover:text-brand transition-colors">
                          {exp.title}
                        </h2>
                        {exp.experienceDetails?.formattedPrice && (
                          <p className="text-brand font-semibold text-sm mb-2">
                            {exp.experienceDetails.formattedPrice}
                            {exp.experienceDetails.duration && ` • ${exp.experienceDetails.duration}`}
                          </p>
                        )}
                        {exp.experienceDetails?.shortDescription && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {exp.experienceDetails.shortDescription}
                          </p>
                        )}
                        <span className="inline-block mt-3 text-xs font-bold uppercase tracking-widest text-brand border-b border-brand pb-0.5">
                          View experience
                        </span>
                      </div>
                    </article>
                  </TransitionLink>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="text-center py-16 max-w-xl mx-auto">
                <p className="text-gray-600 mb-6">
                  {process.env.WORDPRESS_GRAPHQL_ENDPOINT
                    ? 'No experiences are available yet, or the connection to the content source failed.'
                    : 'Configure WORDPRESS_GRAPHQL_ENDPOINT in .env.local to load experiences from WordPress.'}
                </p>
                <TransitionLink href="/" className="text-brand font-semibold border-b border-brand pb-1">
                  Back to home
                </TransitionLink>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
