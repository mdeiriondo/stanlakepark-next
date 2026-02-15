import { getExperienceInfoBySlug } from '@/lib/wordpress';
import TicketTailorWidget from '@/components/ui/TicketTailorWidget';
import BookExperienceButton from '@/components/ui/BookExperienceButton';
import PageHero from '@/components/layout/PageHero';
import { notFound } from 'next/navigation';

export default async function ExperienceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const experience = await getExperienceInfoBySlug(slug);

  if (!experience) notFound();

  const {
    title,
    content,
    acf: {
      duration_display,
      whats_included,
      ticket_tailor_event_id,
      short_description,
      faq,
      gallery,
    },
    _embedded,
  } = experience;

  const featuredImage = _embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const hasBooking = Boolean(ticket_tailor_event_id?.trim());

  return (
    <div>
      <PageHero
        title={title.rendered}
        subtitle={short_description}
        image={featuredImage}
      />

      {hasBooking && (
        <div className="bg-dark text-white py-4 px-6 flex justify-center">
          <BookExperienceButton
            show
            className="bg-gold hover:bg-gold/90 text-dark font-bold uppercase tracking-widest px-8 py-3 rounded transition-colors"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Content Column */}
          <div className="lg:col-span-2">
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content.rendered }} />
            </div>
            
            {/* What's Included */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-4">What's Included</h3>
              <div 
                className="prose" 
                dangerouslySetInnerHTML={{ __html: whats_included ?? '' }} 
              />
            </div>
            
            {/* FAQ */}
            {faq && faq.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">FAQ</h3>
                {faq.map((item: any, idx: number) => (
                  <details key={idx} className="mb-4 group">
                    <summary className="font-semibold cursor-pointer">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-gray-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            )}
          </div>
          
          {/* Booking Widget Column: Ticket Tailor embebido (usuario no sale del sitio) */}
          <div className="lg:col-span-1" id="book-experience">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Book Your Experience</h3>

              {hasBooking ? (
                <TicketTailorWidget eventId={ticket_tailor_event_id!} />
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Booking widget coming soon
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}