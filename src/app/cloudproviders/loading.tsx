export default function CloudProvidersLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      </div>

      {/* Search bar skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-8 w-72 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      </div>

      {/* Filter badges skeleton */}
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-6 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
        ))}
      </div>

      {/* Table skeleton */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-600 text-left">
            <th scope="col" className="pb-2 pr-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" /></th>
            <th scope="col" className="pb-2 pr-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" /></th>
            <th scope="col" className="pb-2 pr-4"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" /></th>
            <th scope="col" className="pb-2 pr-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" /></th>
            <th scope="col" className="pb-2"><div className="h-4 w-18 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" /></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
              <td className="py-2 pr-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-36" /></td>
              <td className="py-2 pr-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full w-14" /></td>
              <td className="py-2 pr-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-40" /></td>
              <td className="py-2 pr-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-20" /></td>
              <td className="py-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-8" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
