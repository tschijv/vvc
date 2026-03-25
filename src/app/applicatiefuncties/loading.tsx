export default function ApplicatiefunctiesLoading() {
  return (
    <div className="max-w-4xl">
      <div className="h-8 w-56 bg-gray-200 animate-pulse rounded mb-4" />

      {/* Search bar skeleton */}
      <div className="flex mb-6">
        <div className="h-10 flex-1 bg-gray-200 animate-pulse rounded-l" />
        <div className="h-10 w-12 bg-gray-200 animate-pulse rounded-r" />
      </div>

      <div className="h-4 w-52 bg-gray-200 animate-pulse rounded mb-4" />

      {/* Table skeleton */}
      <table className="w-full text-sm border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left">
            <th scope="col" className="py-2 px-4">
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
            </th>
            <th scope="col" className="py-2 px-4">
              <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
            </th>
            <th scope="col" className="py-2 px-4 text-right">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2 px-4">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-40" />
              </td>
              <td className="py-2 px-4">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-56" />
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
