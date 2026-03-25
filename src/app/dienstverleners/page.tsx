import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { getDienstverleners, getDienstverlenerCount } from "@/service/dienstverlener";

export const revalidate = 3600; // ISR: regenerate every hour

interface Props {
  searchParams: Promise<{ zoek?: string; type?: string; pagina?: string }>;
}

const PER_PAGE = 25;

const TYPES = ["Advies", "Implementatie", "Beheer", "Hosting", "Training"];

export default async function DienstverlenerPage({ searchParams }: Props) {
  const params = await searchParams;
  const zoek = params.zoek || "";
  const type = params.type || "";
  const pagina = parseInt(params.pagina || "1");

  const [dienstverleners, totaal] = await Promise.all([
    getDienstverleners({
      zoek: zoek || undefined,
      type: type || undefined,
      skip: (pagina - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    getDienstverlenerCount({
      zoek: zoek || undefined,
      type: type || undefined,
    }),
  ]);

  const aantalPaginas = Math.ceil(totaal / PER_PAGE);

  /** Build query string preserving current filters */
  function qs(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (zoek) p.set("zoek", zoek);
    if (type) p.set("type", type);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Dienstverleners", href: "/dienstverleners" }]} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">Dienstverleners</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{totaal} resultaten</p>
      </div>

      {/* Search + filter */}
      <form role="search" method="GET" action="/dienstverleners" className="mb-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            name="zoek"
            defaultValue={zoek}
            placeholder="Zoek in dienstverleners..."
            className="border rounded px-3 py-1.5 text-sm w-72 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
          />
          <select
            name="type"
            defaultValue={type}
            className="border rounded px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="">Alle types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-700 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-800"
          >
            Zoeken
          </button>
          {(zoek || type) && (
            <Link href="/dienstverleners" className="text-sm text-gray-500 py-1.5 hover:underline">
              Wissen
            </Link>
          )}
        </div>
      </form>

      {/* Type filter badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TYPES.map((t) => (
          <Link
            key={t}
            href={`/dienstverleners${qs({ type: type === t ? "" : t, pagina: "" })}`}
            className={`text-xs px-2.5 py-1 rounded-full border transition ${
              type === t
                ? "bg-[#1a6ca8] text-white border-[#1a6ca8]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600 text-left">
              <th scope="col" className="pb-2 pr-4 font-semibold">Naam</th>
              <th scope="col" className="pb-2 pr-4 font-semibold">Type</th>
              <th scope="col" className="pb-2 pr-4 font-semibold">Specialisaties</th>
              <th scope="col" className="pb-2 pr-4 font-semibold">Regio</th>
              <th scope="col" className="pb-2 pr-4 font-semibold">Pakketten</th>
              <th scope="col" className="pb-2 font-semibold">Klanten</th>
            </tr>
          </thead>
          <tbody>
            {dienstverleners.map((d) => (
              <tr key={d.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-2 pr-4">
                  <Link href={`/dienstverleners/${d.slug}`} className="text-blue-700 dark:text-blue-400 hover:underline">
                    {d.naam}
                  </Link>
                </td>
                <td className="py-2 pr-4">
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {d.type}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  {d.specialisaties ? (
                    <div className="flex flex-wrap gap-1">
                      {d.specialisaties.split(",").map((s) => (
                        <span key={s.trim()} className="inline-block text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{d.regio || "—"}</td>
                <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{d._count.pakketten}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{d._count.organisaties}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dienstverleners.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="font-bold mb-1">Geen resultaten gevonden</p>
          <p className="text-sm text-gray-400">Probeer een andere zoekterm of filter</p>
        </div>
      )}

      {/* Pagination */}
      {aantalPaginas > 1 && (
        <div className="flex gap-2 mt-4 text-sm">
          {pagina > 1 && (
            <Link
              href={`/dienstverleners${qs({ pagina: String(pagina - 1) })}`}
              className="px-3 py-1 border rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              &#8592; Vorige
            </Link>
          )}
          <span className="px-3 py-1 text-gray-600 dark:text-gray-400">
            Pagina {pagina} van {aantalPaginas}
          </span>
          {pagina < aantalPaginas && (
            <Link
              href={`/dienstverleners${qs({ pagina: String(pagina + 1) })}`}
              className="px-3 py-1 border rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Volgende &#8594;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
