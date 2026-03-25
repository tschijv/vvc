export default function SamenwerkingenKaartLoading() {
  return (
    <div className="max-w-7xl">
      {/* Breadcrumbs skeleton */}
      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />

      {/* Title skeleton */}
      <div className="h-7 w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />

      {/* Description skeleton */}
      <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-4" />

      {/* Dropdown skeleton */}
      <div className="h-10 w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse mb-4" />

      {/* Map skeleton */}
      <div className="h-[700px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse" />
    </div>
  );
}
