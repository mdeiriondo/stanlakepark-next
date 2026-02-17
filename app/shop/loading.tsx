import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar mode="winery" />

      {/* Hero skeleton */}
      <div className="relative h-[60vh] w-full overflow-hidden bg-dark flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center px-6">
          <div className="h-4 w-48 bg-white/20 rounded animate-pulse mx-auto mb-6" />
          <div className="h-12 w-64 bg-white/30 rounded animate-pulse mx-auto" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n}>
                  <div className="bg-cream/50 aspect-[3/4] rounded-lg animate-pulse mb-4" />
                  <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
