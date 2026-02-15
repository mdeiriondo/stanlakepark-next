import { getExperienceInfo } from '@/lib/wordpress';
import ExperienceCard from '@/components/ui/ExperienceCard';
import PageHero from '@/components/layout/PageHero';

const TOURS = ['wine_tour_tasting', 'wine_cheese_tour', 'special_tastings'];
const SEASONAL = ['wine_cream_tea', 'wine_cheese_tasting', 'special_events'];
const LIFESTYLE = ['work_vineyard', 'wset_courses'];

export default async function ExperiencesPage() {
  const experiences = await getExperienceInfo();

  const wineTours = experiences.filter((exp) =>
    TOURS.includes(exp.experienceDetails.experienceType)
  );
  const seasonal = experiences.filter((exp) =>
    SEASONAL.includes(exp.experienceDetails.experienceType)
  );
  const lifestyle = experiences.filter((exp) =>
    LIFESTYLE.includes(exp.experienceDetails.experienceType)
  );

  return (
    <div>
      <PageHero
        title="Experiences at Stanlake Park"
        subtitle="Discover English wine at one of the country's oldest vineyards"
      />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {wineTours.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Wine Tours</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {wineTours.map((exp) => (
                <ExperienceCard key={exp.databaseId} experience={exp} />
              ))}
            </div>
          </section>
        )}

        {seasonal.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Seasonal Experiences</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {seasonal.map((exp) => (
                <ExperienceCard key={exp.databaseId} experience={exp} />
              ))}
            </div>
          </section>
        )}

        {lifestyle.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Lifestyle</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {lifestyle.map((exp) => (
                <ExperienceCard key={exp.databaseId} experience={exp} />
              ))}
            </div>
          </section>
        )}

        {experiences.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            No experiences available at the moment.
          </p>
        )}
      </div>
    </div>
  );
}
