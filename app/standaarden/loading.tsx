export default function StandaardenLoading() {
  return (
    <div className="max-w-4xl">
      <div className="h-8 w-40 bg-gray-200 animate-pulse rounded mb-4" />

      {/* Search bar skeleton */}
      <div className="flex mb-6">
        <div className="h-10 flex-1 bg-gray-200 animate-pulse rounded-l" />
        <div className="h-10 w-12 bg-gray-200 animate-pulse rounded-r" />
      </div>

      <div className="h-4 w-44 bg-gray-200 animate-pulse rounded mb-4" />

      {/* Table skeleton */}
      <table className="w-full text-sm border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left">
            <th scope="col" className="py-2 px-4">
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
            </th>
            <th scope="col" className="py-2 px-4">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
            </th>
            <th scope="col" className="py-2 px-4 text-right">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 7 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2 px-4">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-36" />
              </td>
              <td className="py-2 px-4">
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 2 + (i % 3) }).map((_, j) => (
                    <div key={j} className="h-5 w-16 bg-gray-200 animate-pulse rounded" />
                  ))}
                </div>
              </td>
              <td className="py-2 px-4 text-right">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-8 ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
