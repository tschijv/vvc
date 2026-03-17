import Link from "next/link";

export default function CloudProvidersPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="mb-6">
        <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto" fill="none">
          <path d="M22 54 C10 54 10 40 22 37 C22 26 36 20 44 28 C52 22 66 28 64 38 C72 40 72 54 64 54 Z" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M32 46 L40 52 L52 38" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Cloud-providers</h1>
      <p className="text-gray-600 mb-2">
        Deze functionaliteit is nog niet geïmplementeerd.
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Hier komt een overzicht van cloud-providers die hosting en infrastructuur leveren voor gemeentelijke software.
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
