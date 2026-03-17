import Link from "next/link";
import MobileFilterToggle from "@/components/MobileFilterToggle";
import { getPakketten, getPakketCount, getAlleLeveranciers, getAlleReferentiecomponenten } from "@/lib/services/pakket";

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

  const [pakketten, totaal, alleLeveranciers, alleRefComps] = await Promise.all([
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
            <select name="leverancier" className="w-full border rounded px-2 py-1 text-sm">
              <option value="">Alle leveranciers</option>
              {alleLeveranciers.map((l) => (
                <option key={l.id} value={l.id} selected={l.id === leverancierId}>
                  {l.naam}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Referentiecomponent
            </p>
            <select name="referentiecomponent" className="w-full border rounded px-2 py-1 text-sm">
              <option value="">Alle componenten</option>
              {alleRefComps.map((r) => (
                <option key={r.id} value={r.id} selected={r.id === refCompId}>
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
                <th className="pb-2 pr-4 font-semibold">
                  <Link href={buildUrl({})} className="hover:underline">Naam</Link>
                </th>
                <th className="pb-2 pr-4 font-semibold">Leverancier</th>
                <th className="pb-2 font-semibold hidden sm:table-cell">Beschrijving</th>
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
                  <td className="py-2 text-gray-600 max-w-md truncate hidden sm:table-cell">
                    {p.beschrijving?.slice(0, 120)}
                    {p.beschrijving && p.beschrijving.length > 120 ? "…" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
  );
}
