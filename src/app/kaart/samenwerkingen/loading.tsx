export default function SamenwerkingenKaartLoading() {
  return (
    <div className="max-w-[1600px]">
      {/* Breadcrumbs skeleton */}
      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />

      {/* Title skeleton */}
      <div className="h-7 w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />

      {/* Description skeleton */}
      <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-4" />

      {/* Stats summary bar skeleton */}
      <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mb-4" />

      {/* Map + Legend skeleton */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="h-[700px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse" />
        </div>
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="h-[700px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
