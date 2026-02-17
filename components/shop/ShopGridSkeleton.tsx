export default function ShopGridSkeleton() {
  return (
    <div>
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
  );
}
