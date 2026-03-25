import { getReferentiecomponenten, getReferentiecomponentenCount } from "@/lib/services/referentiecomponent";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Props {
  searchParams: Promise<{ zoek?: string; pagina?: string }>;
}

const PER_PAGE = 25;

export default async function ReferentiecomponentenPage({ searchParams }: Props) {
  const params = await searchParams;
  const zoek = params.zoek?.trim() || "";
  const pagina = parseInt(params.pagina || "1");

  const [refComps, totaal] = await Promise.all([
    getReferentiecomponenten({
      zoek: zoek || undefined,
      skip: (pagina - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    getReferentiecomponentenCount({ zoek: zoek || undefined }),
  ]);

  const aantalPaginas = Math.ceil(totaal / PER_PAGE);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (zoek) p.set("zoek", zoek);
    p.set("pagina", "1");
    Object.entries(overrides).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    return `/referentiecomponenten?${p.toString()}`;
  }

  return (
    <div className="max-w-4xl">
      <Breadcrumbs items={[{ label: "Referentiecomponenten", href: "/referentiecomponenten" }]} />
      <h1 className="text-2xl font-semibold text-[#1a6ca8] mb-4">Referentiecomponenten</h1>

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

      <p className="text-sm text-gray-600 mb-4">
        {totaal} referentiecomponent{totaal !== 1 ? "en" : ""} gevonden.
      </p>

      {refComps.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-3" role="img" aria-label="Zoeken">&#x1F50D;</span>
          <p className="font-bold mb-1">Geen resultaten gevonden</p>
          <p className="text-sm text-gray-400">Probeer een andere zoekterm</p>
        </div>
      ) : (
        <table className="w-full text-sm border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th scope="col" className="py-2 px-4 font-semibold text-gray-700">Naam</th>
              <th scope="col" className="py-2 px-4 font-semibold text-gray-700 text-center">GEMMA</th>
              <th scope="col" className="py-2 px-4 font-semibold text-gray-700 text-right">Pakketten</th>
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
      )}

      {aantalPaginas > 1 && (
        <div className="flex gap-2 mt-4 text-sm">
          {pagina > 1 && (
            <Link
              href={buildUrl({ pagina: String(pagina - 1) })}
              className="px-3 py-1 border rounded hover:bg-gray-50"
            >
              &larr; Vorige
            </Link>
          )}
          <span className="px-3 py-1 text-gray-600">
            Pagina {pagina} van {aantalPaginas}
          </span>
          {pagina < aantalPaginas && (
            <Link
              href={buildUrl({ pagina: String(pagina + 1) })}
              className="px-3 py-1 border rounded hover:bg-gray-50"
            >
              Volgende &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
