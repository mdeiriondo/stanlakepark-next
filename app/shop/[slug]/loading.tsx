import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ProductLoading() {
  return (
    <main className="bg-white min-h-screen">
      <Navbar mode="winery" />

      {/* Hero skeleton */}
      <div className="relative h-[70vh] w-full overflow-hidden bg-dark">
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-20">
          <div className="h-4 w-32 bg-white/20 rounded animate-pulse mb-8" />
          <div className="h-16 md:h-24 w-full max-w-2xl bg-white/30 rounded animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-7">
          <div className="aspect-[3/4] bg-cream/30 rounded-lg animate-pulse mb-12" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="sticky top-32 bg-white border border-gray-100 shadow-xl p-10 rounded-lg">
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-10 w-28 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-6" />
            <div className="h-12 w-full bg-gray-200 rounded animate-pulse mb-6" />
            <div className="h-14 w-full bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
