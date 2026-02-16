import { redirect } from 'next/navigation';

/**
 * Redirige /tours/[slug] a /experiences/[slug]
 * Mantiene la consistencia: todas las experiencias individuales están en /experiences
 */
export default async function TourSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/experiences/${slug}`);
}
