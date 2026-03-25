export default function DashboardLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-200 animate-pulse rounded" />
            <div>
              <div className="h-7 w-80 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded ml-auto" />
            <div className="h-4 w-44 bg-gray-200 animate-pulse rounded ml-auto" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-28 bg-gray-200 animate-pulse rounded-t" />
        ))}
      </div>

      {/* Content area skeleton: table with sidebar */}
      <div className="flex gap-8">
        <div className="w-72 flex-shrink-0 space-y-4">
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 animate-pulse rounded w-full" />
          ))}
        </div>
        <div className="flex-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th scope="col" className="pb-2 pr-4 text-left">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                </th>
                <th scope="col" className="pb-2 pr-4 text-left">
                  <div className="h-4 w-36 bg-gray-200 animate-pulse rounded" />
                </th>
                <th scope="col" className="pb-2 pr-4 text-left">
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                </th>
                <th scope="col" className="pb-2 text-left">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 pr-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-28" />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-40" />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-20" />
                  </td>
                  <td className="py-3">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-32" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
