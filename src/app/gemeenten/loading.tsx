export default function GemeentenLoading() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div className="h-9 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="h-9 w-32 bg-gray-200 animate-pulse rounded" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filter skeleton */}
        <div className="w-72 flex-shrink-0 hidden md:block">
          <div className="bg-gray-50 rounded p-4">
            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 animate-pulse rounded w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search bar skeleton */}
          <div className="flex gap-0 mb-4">
            <div className="h-10 flex-1 bg-gray-200 animate-pulse rounded-l" />
            <div className="h-10 w-12 bg-gray-200 animate-pulse rounded-r" />
          </div>

          <div className="h-4 w-40 bg-gray-200 animate-pulse rounded mb-4" />

          {/* Table skeleton */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th scope="col" className="pb-2 pr-4 text-left">
                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                  </th>
                  <th scope="col" className="pb-2 text-left">
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 pr-4">
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-40" />
                    </td>
                    <td className="py-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div key={j} className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
