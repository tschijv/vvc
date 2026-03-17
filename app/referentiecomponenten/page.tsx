import { getReferentiecomponenten } from "@/lib/services/referentiecomponent";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ zoek?: string }>;
}

export default async function ReferentiecomponentenPage({ searchParams }: Props) {
  const params = await searchParams;
  const zoek = params.zoek?.trim() || "";

  const refComps = await getReferentiecomponenten({ zoek: zoek || undefined });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-[#1a6ca8] mb-4">Referentiecomponenten</h1>

      {/* Search bar matching live site */}
      <form role="search" method="GET" action="/referentiecomponenten" className="mb-6">
        <div className="flex">
          <input
            type="text"
            name="zoek"
            defaultValue={zoek}
            placeholder="Zoek in referentiecomponenten"
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

      {refComps.length === 0 ? (
        <p className="text-gray-500 text-sm italic">Geen referentiecomponenten gevonden.</p>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">{refComps.length} referentiecomponenten gevonden</p>
          <table className="w-full text-sm border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="py-2 px-4 font-semibold text-gray-700">Naam</th>
                <th className="py-2 px-4 font-semibold text-gray-700 text-center">GEMMA</th>
                <th className="py-2 px-4 font-semibold text-gray-700 text-right">Pakketten</th>
              </tr>
            </thead>
            <tbody>
              {refComps.map((rc) => (
                <tr key={rc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <Link
                      href={`/pakketten?referentiecomponent=${rc.id}`}
                      className="text-[#1a6ca8] hover:underline font-medium"
                    >
                      {rc.naam}
                    </Link>
                  </td>
                  <td className="py-2 px-4 text-center">
                    {rc.guid ? (
                      <a
                        href={`https://www.gemmaonline.nl/wiki/GEMMA/id-${rc.guid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1a6ca8] hover:underline text-xs"
                      >
                        Bekijken
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <Link
                      href={`/pakketten?referentiecomponent=${rc.id}`}
                      className="text-gray-600 hover:text-[#1a6ca8]"
                    >
                      {rc._count.pakketversies}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
