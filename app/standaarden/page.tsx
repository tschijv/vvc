import { getStandaarden } from "@/lib/services/standaard";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ zoek?: string }>;
}

export default async function StandaardenPage({ searchParams }: Props) {
  const params = await searchParams;
  const zoek = params.zoek?.trim() || "";

  const standaarden = await getStandaarden({ zoek: zoek || undefined });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-[#1a6ca8] mb-4">Standaarden</h1>

      {/* Search bar matching live site */}
      <form role="search" method="GET" action="/standaarden" className="mb-6">
        <div className="flex">
          <input
            type="text"
            name="zoek"
            defaultValue={zoek}
            placeholder="Zoek in standaarden"
            className="border border-gray-300 rounded-l px-4 py-2 text-sm flex-1 focus:outline-none focus:border-[#1a6ca8]"
          />
          <button
            type="submit"
            className="bg-[#1a6ca8] text-white px-5 py-2 rounded-r hover:bg-[#155a8c] flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </form>

      {standaarden.length === 0 ? (
        <p className="text-gray-500 text-sm italic">Geen standaarden gevonden.</p>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">{standaarden.length} standaard{standaarden.length !== 1 ? "en" : ""} gevonden</p>
          <table className="w-full text-sm border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="py-2 px-4 font-semibold text-gray-700">Naam</th>
                <th className="py-2 px-4 font-semibold text-gray-700">Versies</th>
                <th className="py-2 px-4 font-semibold text-gray-700 text-right">Pakketten</th>
              </tr>
            </thead>
            <tbody>
              {standaarden.map((s) => {
                const totaalPakketten = s.versies.reduce(
                  (sum, v) => sum + v._count.pakketversies, 0
                );
                return (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium text-gray-800">{s.naam}</td>
                    <td className="py-2 px-4">
                      <div className="flex flex-wrap gap-1">
                        {s.versies.map((v) => (
                          <Link
                            key={v.id}
                            href={`/pakketten?standaard=${encodeURIComponent(v.naam)}`}
                            className="inline-block bg-blue-50 text-[#1a6ca8] text-xs px-2 py-0.5 rounded hover:bg-blue-100"
                          >
                            {v.naam}
                          </Link>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-4 text-gray-600 text-right">{totaalPakketten}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
