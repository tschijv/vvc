import Link from "next/link";

// ─── Tab link component ──────────────────────────────────────────────────────

export default function TabLink({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
        active
          ? "border-[#1a6ca8] text-[#1a6ca8]"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded ${active ? "bg-[#1a6ca8] text-white" : "bg-gray-200 text-gray-600"}`}>
          {count}
        </span>
      )}
    </Link>
  );
}
