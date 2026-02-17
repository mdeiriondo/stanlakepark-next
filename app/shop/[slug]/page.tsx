import { notFound } from 'next/navigation';
import ProductDetail from '@/components/shop/ProductDetail';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import TransitionLink from '@/components/ui/TransitionLink';
import { ArrowLeft } from 'lucide-react';

async function getProduct(slug: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const url = base ? `${base}/api/products/${slug}` : `/api/products/${slug}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProduct(slug);

  if (!data) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${data.product.name} | Stanlake Park`,
    description: data.product.short_description
      ?.replace(/<[^>]*>/g, '')
      .substring(0, 155),
  };
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2670&auto=format&fit=crop';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProduct(slug);

  if (!data) {
    notFound();
  }

  const product = data.product as {
    name: string;
    images?: { src: string }[];
  };
  const imageUrl =
    product.images?.[0]?.src ?? FALLBACK_IMAGE;

  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      {/* Hero — mismo diseño que experiences/[slug] */}
      <div className="relative h-[70vh] w-full overflow-hidden bg-dark">
        <img
          src={imageUrl}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60 animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-20 text-white">
          <Reveal>
            <TransitionLink
              href="/shop"
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Wine Shop
            </TransitionLink>
            <h1 className="text-5xl md:text-8xl font-serif mb-6">{product.name}</h1>
          </Reveal>
        </div>
      </div>

      <ProductDetail product={data.product} variations={data.variations} />

      <Footer />
    </main>
  );
}
