export default function PakkettenLoading() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Desktop filter sidebar skeleton */}
      <aside className="w-60 shrink-0 hidden md:block">
        <div className="space-y-4">
          <div>
            <div className="h-3 w-16 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-8 w-full bg-gray-200 animate-pulse rounded" />
          </div>
          <div>
            <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-8 w-full bg-gray-200 animate-pulse rounded" />
          </div>
          <div>
            <div className="h-3 w-32 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-8 w-full bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="h-9 w-full bg-gray-200 animate-pulse rounded" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-36 bg-gray-200 animate-pulse rounded" />
          <div className="h-8 w-28 bg-gray-200 animate-pulse rounded" />
        </div>

        <div className="h-4 w-44 bg-gray-200 animate-pulse rounded mb-3" />

        {/* Table skeleton */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th scope="col" className="pb-2 pr-4">
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                </th>
                <th scope="col" className="pb-2 pr-4">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                </th>
                <th scope="col" className="pb-2 hidden sm:table-cell">
                  <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 pr-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-36" />
                  </td>
                  <td className="py-2 pr-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-28" />
                  </td>
                  <td className="py-2 hidden sm:table-cell">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-64" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
