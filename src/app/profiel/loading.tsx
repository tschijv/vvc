export default function ProfielLoading() {
  return (
    <div>
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-4" />
      <div className="h-7 w-48 bg-gray-200 animate-pulse rounded mb-4" />

      {/* Mijn gegevens card skeleton */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
          <div className="h-5 w-36 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-1" />
                <div className="h-10 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
          <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>

      {/* Mijn activiteit card skeleton */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
          <div className="h-5 w-36 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* Voorkeuren card skeleton */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
          <div className="h-5 w-28 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
              <div className="h-6 w-11 bg-gray-200 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
