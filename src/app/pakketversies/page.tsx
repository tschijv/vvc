import Link from "next/link";
import MobileFilterToggle from "@/ui/components/MobileFilterToggle";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { getPakketversies, getPakketversieCount } from "@/service/pakketversie";
import { getAlleLeveranciers, getAlleReferentiecomponenten } from "@/service/pakket";

export const revalidate = 3600; // ISR: regenerate every hour

interface Props {
  searchParams: Promise<{
    zoek?: string;
    leverancier?: string;
    status?: string;
    referentiecomponent?: string;
    pagina?: string;
  }>;
}

const PER_PAGE = 25;

const STATUS_OPTIES = [
  { value: "", label: "Alle statussen" },
  { value: "In gebruik", label: "In gebruik" },
  { value: "Einde ondersteuning", label: "Einde ondersteuning" },
  { value: "In ontwikkeling", label: "In ontwikkeling" },
  { value: "Teruggetrokken", label: "Teruggetrokken" },
];

function statusBadgeKleur(status: string) {
  switch (status) {
    case "In gebruik":
      return "bg-green-100 text-green-800";
    case "Einde ondersteuning":
      return "bg-red-100 text-red-800";
    case "In ontwikkeling":
      return "bg-yellow-100 text-yellow-800";
    case "Teruggetrokken":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default async function PakketversiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const zoek = params.zoek || "";
  const leverancierId = params.leverancier || "";
  const statusFilter = params.status || "";
  const refCompId = params.referentiecomponent || "";
  const pagina = parseInt(params.pagina || "1");

  const [pakketversies, totaal, alleLeveranciers, alleRefComps] = await Promise.all([
    getPakketversies({
      zoek: zoek || undefined,
      leverancierId: leverancierId || undefined,
      status: statusFilter || undefined,
      referentiecomponentId: refCompId || undefined,
      skip: (pagina - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    getPakketversieCount({
      zoek: zoek || undefined,
      leverancierId: leverancierId || undefined,
      status: statusFilter || undefined,
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
    if (statusFilter) p.set("status", statusFilter);
    if (refCompId) p.set("referentiecomponent", refCompId);
    p.set("pagina", "1");
    Object.entries(overrides).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    return `/pakketversies?${p.toString()}`;
  }

  const exportParams = new URLSearchParams();
  if (zoek) exportParams.set("zoek", zoek);
  if (leverancierId) exportParams.set("leverancier", leverancierId);
  if (statusFilter) exportParams.set("status", statusFilter);
  if (refCompId) exportParams.set("referentiecomponent", refCompId);

  const filterForm = (
    <>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1">Zoeken</label>
        <input
          type="text"
          name="zoek"
          defaultValue={zoek}
          placeholder="Versie, pakket of leverancier..."
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Leverancier</p>
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
        <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Status / Planning</p>
        <select name="status" defaultValue={statusFilter} className="w-full border rounded px-2 py-1 text-sm">
          {STATUS_OPTIES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Referentiecomponent</p>
        <select name="referentiecomponent" defaultValue={refCompId} className="w-full border rounded px-2 py-1 text-sm">
          <option value="">Alle componenten</option>
          {alleRefComps.map((r) => (
            <option key={r.id} value={r.id}>
              {r.naam}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="w-full bg-blue-700 text-white text-sm px-3 py-2 rounded hover:bg-blue-800">
        Filter toepassen
      </button>
      {(zoek || leverancierId || statusFilter || refCompId) && (
        <Link href="/pakketversies" className="block text-center text-xs text-gray-500 mt-2 hover:underline">
          Filters wissen
        </Link>
      )}
    </>
  );

  return (
    <div>
      <Breadcrumbs items={[{ label: "Pakketversies", href: "/pakketversies" }]} />
      <div className="flex flex-col md:flex-row gap-6">
      {/* Mobile filter toggle */}
      <MobileFilterToggle>
        <form role="search" method="GET" action="/pakketversies" className="bg-gray-50 rounded p-4">
          {filterForm}
        </form>
      </MobileFilterToggle>

      {/* Desktop filterpaneel */}
      <aside className="w-60 shrink-0 hidden md:block">
        <form role="search" method="GET" action="/pakketversies">
          {filterForm}
        </form>
      </aside>

      {/* Resultatenlijst */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Pakketversies</h1>
          <Link
            href={`/api/pakketversies/export?${exportParams.toString()}`}
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
                <th scope="col" className="pb-2 pr-4 font-semibold">Pakketversie</th>
                <th scope="col" className="pb-2 pr-4 font-semibold">Pakket</th>
                <th scope="col" className="pb-2 pr-4 font-semibold hidden sm:table-cell">Leverancier</th>
                <th scope="col" className="pb-2 pr-4 font-semibold hidden md:table-cell">Status</th>
                <th scope="col" className="pb-2 font-semibold hidden lg:table-cell">Referentiecomponenten</th>
              </tr>
            </thead>
            <tbody>
              {pakketversies.map((pv) => (
                <tr key={pv.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-4">
                    <Link href={`/pakketten/${pv.pakket.slug}`} className="text-blue-700 hover:underline">
                      {pv.naam}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-gray-700">
                    <Link href={`/pakketten/${pv.pakket.slug}`} className="hover:underline">
                      {pv.pakket.naam}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-gray-700 hidden sm:table-cell">
                    <Link
                      href={`/leveranciers/${pv.pakket.leverancier.slug}`}
                      className="hover:underline"
                    >
                      {pv.pakket.leverancier.naam}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 hidden md:table-cell">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${statusBadgeKleur(pv.status)}`}>
                      {pv.status}
                    </span>
                  </td>
                  <td className="py-2 hidden lg:table-cell">
                    {pv._count.referentiecomponenten > 0 && (
                      <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {pv._count.referentiecomponenten}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pakketversies.length === 0 && (
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
      </main>
    </div>
    </div>
  );
}
