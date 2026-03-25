import Link from "next/link";

export default function HelpLink({ section, label }: { section: string; label?: string }) {
  return (
    <Link
      href={`/help#${section}`}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300 text-xs font-bold hover:bg-[#1a6ca8] hover:text-white transition-colors"
      title={label || "Help"}
      aria-label={label || "Help over dit onderdeel"}
    >
      ?
    </Link>
  );
}
