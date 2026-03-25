/**
 * Shared error alert banner used across the application.
 * Replaces 8+ duplicate error display implementations.
 */
export default function ErrorAlert({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 ${className}`}
    >
      {message}
    </div>
  );
}
