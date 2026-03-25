export default function AddendaLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Type breakdown skeleton */}
      <div className="flex gap-3 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-7 w-52 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>

      {/* Search bar skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-8 w-72 bg-gray-200 animate-pulse rounded" />
        <div className="h-8 w-40 bg-gray-200 animate-pulse rounded" />
        <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Table skeleton */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-300 text-left">
            <th scope="col" className="pb-2 pr-4">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
            </th>
            <th scope="col" className="pb-2 pr-4">
              <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
            </th>
            <th scope="col" className="pb-2 pr-4">
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
            </th>
            <th scope="col" className="pb-2">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2 pr-4">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-36" />
              </td>
              <td className="py-2 pr-4">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-48" />
              </td>
              <td className="py-2 pr-4">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
              </td>
              <td className="py-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
