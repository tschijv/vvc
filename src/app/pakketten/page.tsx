import Link from "next/link";
import MobileFilterToggle from "@/ui/components/MobileFilterToggle";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { getPakketten, getPakketCount, getAlleLeveranciers, getAlleReferentiecomponenten } from "@/service/pakket";
import { getPakkettenWithAvgScore } from "@/service/review";

export const revalidate = 3600; // ISR: regenerate every hour

interface Props {
  searchParams: Promise<{
    zoek?: string;
    leverancier?: string;
    referentiecomponent?: string;
    pagina?: string;
  }>;
}

const PER_PAGE = 25;

export default async function PakkettenPage({ searchParams }: Props) {
  const params = await searchParams;
  const zoek = params.zoek || "";
  const leverancierId = params.leverancier || "";
  const refCompId = params.referentiecomponent || "";
  const pagina = parseInt(params.pagina || "1");

  const [pakketten, totaal, alleLeveranciers, alleRefComps, scoreMap] = await Promise.all([
    getPakketten({
      zoek: zoek || undefined,
      leverancierId: leverancierId || undefined,
      referentiecomponentId: refCompId || undefined,
      skip: (pagina - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    getPakketCount({
      zoek: zoek || undefined,
      leverancierId: leverancierId || undefined,
      referentiecomponentId: refCompId || undefined,
    }),
    getAlleLeveranciers(),
    getAlleReferentiecomponenten(),
    getPakkettenWithAvgScore(),
  ]);

  const aantalPaginas = Math.ceil(totaal / PER_PAGE);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (zoek) p.set("zoek", zoek);
    if (leverancierId) p.set("leverancier", leverancierId);
    if (refCompId) p.set("referentiecomponent", refCompId);
    p.set("pagina", "1");
    Object.entries(overrides).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    return `/pakketten?${p.toString()}`;
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Pakketten", href: "/pakketten" }]} />
      <div className="flex flex-col md:flex-row gap-6">
      {/* Mobile filter toggle */}
      <MobileFilterToggle>
        <form role="search" method="GET" action="/pakketten" className="bg-gray-50 rounded p-4">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Zoeken</label>
            <input
              type="text"
              name="zoek"
              defaultValue={zoek}
              placeholder="Pakket of leverancier..."
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Leverancier</p>
            <select name="leverancier" className="w-full border rounded px-2 py-1 text-sm">
              <option value="">Alle leveranciers</option>
              {alleLeveranciers.map((l) => (
                <option key={l.id} value={l.id} selected={l.id === leverancierId}>{l.naam}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Referentiecomponent</p>
            <select name="referentiecomponent" className="w-full border rounded px-2 py-1 text-sm">
              <option value="">Alle componenten</option>
              {alleRefComps.map((r) => (
                <option key={r.id} value={r.id} selected={r.id === refCompId}>{r.naam}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-700 text-white text-sm px-3 py-2 rounded hover:bg-blue-800">Filter toepassen</button>
          {(zoek || leverancierId || refCompId) && (
            <Link href="/pakketten" className="block text-center text-xs text-gray-500 mt-2 hover:underline">Filters wissen</Link>
          )}
        </form>
      </MobileFilterToggle>

      {/* Desktop filterpaneel */}
      <aside className="w-60 shrink-0 hidden md:block">
        <form role="search" method="GET" action="/pakketten">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Zoeken</label>
            <input
              type="text"
              name="zoek"
              defaultValue={zoek}
              placeholder="Pakket of leverancier..."
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Leverancier
            </p>
            <select name="leverancier" defaultValue={leverancierId} className="w-full border rounded px-2 py-1 text-sm">
              <option value="">Alle leveranciers</option>
              {alleLeveranciers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.naam}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Referentiecomponent
            </p>
            <select name="referentiecomponent" defaultValue={refCompId} className="w-full border rounded px-2 py-1 text-sm">
              <option value="">Alle componenten</option>
              {alleRefComps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.naam}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 text-white text-sm px-3 py-2 rounded hover:bg-blue-800"
          >
            Filter toepassen
          </button>

          {(zoek || leverancierId || refCompId) && (
            <Link
              href="/pakketten"
              className="block text-center text-xs text-gray-500 mt-2 hover:underline"
            >
              Filters wissen
            </Link>
          )}
        </form>
      </aside>

      {/* Resultatenlijst */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Pakketten</h1>
          <Link
            href={`/api/pakketten/export?zoek=${zoek}&leverancier=${leverancierId}&referentiecomponent=${refCompId}`}
            className="text-sm border px-3 py-1 rounded hover:bg-gray-50"
          >
            Export to CSV
          </Link>
        </div>

        <p className="text-sm text-gray-600 mb-3">{totaal} resultaten gevonden.</p>

        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th scope="col" className="pb-2 pr-4 font-semibold">
                  <Link href={buildUrl({})} className="hover:underline">Naam</Link>
                </th>
                <th scope="col" className="pb-2 pr-4 font-semibold">Leverancier</th>
                <th scope="col" className="pb-2 pr-4 font-semibold hidden md:table-cell">Score</th>
                <th scope="col" className="pb-2 font-semibold hidden sm:table-cell">Beschrijving</th>
              </tr>
            </thead>
            <tbody>
              {pakketten.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-4">
                    <Link href={`/pakketten/${p.slug}`} className="text-blue-700 hover:underline">
                      {p.naam}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-gray-700">
                    <Link
                      href={`/leveranciers/${p.leverancier.slug}`}
                      className="hover:underline"
                    >
                      {p.leverancier.naam}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 hidden md:table-cell">
                    {(() => {
                      const s = scoreMap.get(p.id);
                      if (!s || s.count === 0) return <span className="text-gray-400 text-xs">-</span>;
                      return (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <svg className="w-3.5 h-3.5 text-[#e35b10]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{s.avg}</span>
                          <span className="text-xs text-gray-400">({s.count})</span>
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-2 text-gray-600 max-w-md truncate hidden sm:table-cell">
                    {p.beschrijving?.slice(0, 120)}
                    {p.beschrijving && p.beschrijving.length > 120 ? "…" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pakketten.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <span className="text-4xl block mb-3" role="img" aria-label="Zoeken">&#x1F50D;</span>
            <p className="font-bold mb-1">Geen resultaten gevonden</p>
            <p className="text-sm text-gray-400">Probeer een andere zoekterm of filter</p>
          </div>
        )}

        {/* Paginering */}
        {aantalPaginas > 1 && (
          <div className="flex gap-2 mt-4 text-sm">
            {pagina > 1 && (
              <Link
                href={buildUrl({ pagina: String(pagina - 1) })}
                className="px-3 py-1 border rounded hover:bg-gray-50"
              >
                ← Vorige
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
                Volgende →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
    </>
  );
}
