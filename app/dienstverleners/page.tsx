import Link from "next/link";

export default function DienstverlenerPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="mb-6">
        <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto" fill="none">
          <circle cx="32" cy="26" r="10" stroke="#059669" strokeWidth="2.5" />
          <path d="M16 54 C16 44 22 38 32 38 C42 38 48 44 48 54" stroke="#059669" strokeWidth="2.5" />
          <circle cx="56" cy="30" r="8" stroke="#059669" strokeWidth="2.5" />
          <path d="M44 54 C44 46 48 42 56 42 C64 42 68 46 68 54" stroke="#059669" strokeWidth="2.5" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Dienstverleners</h1>
      <p className="text-gray-600 mb-2">
        Deze functionaliteit is nog niet geïmplementeerd.
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Hier komt een overzicht van dienstverleners die gemeenten ondersteunen bij het gebruik van software en voorzieningen.
      </p>
      <Link
        href="/"
        className="inline-block px-5 py-2.5 bg-[#059669] text-white rounded hover:bg-[#047857] transition text-sm font-medium"
      >
        Terug naar home
      </Link>
    </div>
  );
}
