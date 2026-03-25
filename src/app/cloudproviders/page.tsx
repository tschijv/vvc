import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { getCloudproviders, getCloudproviderCount } from "@/service/cloudprovider";

interface Props {
  searchParams: Promise<{ zoek?: string; type?: string; pagina?: string }>;
}

const PER_PAGE = 25;

const TYPES = ["IaaS", "PaaS", "SaaS", "Hosting"];

/** Color mapping for certification badges */
function certBadgeClass(cert: string): string {
  const c = cert.trim().toLowerCase();
  if (c.includes("bio") || c.includes("nen 7510")) {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }
  if (c.includes("iso")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
}

export default async function CloudProvidersPage({ searchParams }: Props) {
  const params = await searchParams;
  const zoek = params.zoek || "";
  const type = params.type || "";
  const pagina = parseInt(params.pagina || "1");

  const [cloudproviders, totaal] = await Promise.all([
    getCloudproviders({
      zoek: zoek || undefined,
      type: type || undefined,
      skip: (pagina - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    getCloudproviderCount({
      zoek: zoek || undefined,
      type: type || undefined,
    }),
  ]);

  const aantalPaginas = Math.ceil(totaal / PER_PAGE);

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
      <Breadcrumbs items={[{ label: "Cloud-providers", href: "/cloudproviders" }]} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">Cloud-providers</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{totaal} resultaten</p>
      </div>

      {/* Search + filter */}
      <form role="search" method="GET" action="/cloudproviders" className="mb-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            name="zoek"
            defaultValue={zoek}
            placeholder="Zoek in cloud-providers..."
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
            <Link href="/cloudproviders" className="text-sm text-gray-500 py-1.5 hover:underline">
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
            href={`/cloudproviders${qs({ type: type === t ? "" : t, pagina: "" })}`}
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
              <th scope="col" className="pb-2 pr-4 font-semibold">Certificeringen</th>
              <th scope="col" className="pb-2 pr-4 font-semibold">Datacenter</th>
              <th scope="col" className="pb-2 font-semibold">Pakketten</th>
            </tr>
          </thead>
          <tbody>
            {cloudproviders.map((cp) => (
              <tr key={cp.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-2 pr-4">
                  <Link href={`/cloudproviders/${cp.slug}`} className="text-blue-700 dark:text-blue-400 hover:underline">
                    {cp.naam}
                  </Link>
                </td>
                <td className="py-2 pr-4">
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {cp.type}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  {cp.certificeringen ? (
                    <div className="flex flex-wrap gap-1">
                      {cp.certificeringen.split(",").map((c) => (
                        <span key={c.trim()} className={`inline-block text-xs px-1.5 py-0.5 rounded ${certBadgeClass(c)}`}>
                          {c.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{cp.datacenterLocatie || "—"}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{cp._count.pakketten}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cloudproviders.length === 0 && (
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
              href={`/cloudproviders${qs({ pagina: String(pagina - 1) })}`}
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
              href={`/cloudproviders${qs({ pagina: String(pagina + 1) })}`}
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
