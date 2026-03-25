import { getApplicatiefuncties, getApplicatiefunctieCount } from "@/service/applicatiefunctie";
import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";

interface Props {
  searchParams: Promise<{ zoek?: string; pagina?: string }>;
}

const PER_PAGE = 25;

export default async function ApplicatiefunctiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const zoek = params.zoek?.trim() || "";
  const pagina = parseInt(params.pagina || "1");

  const [functies, totaal] = await Promise.all([
    getApplicatiefuncties({
      zoek: zoek || undefined,
      skip: (pagina - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    getApplicatiefunctieCount({ zoek: zoek || undefined }),
  ]);

  const aantalPaginas = Math.ceil(totaal / PER_PAGE);

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (zoek) p.set("zoek", zoek);
    p.set("pagina", "1");
    Object.entries(overrides).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    return `/applicatiefuncties?${p.toString()}`;
  }

  return (
    <div className="max-w-4xl">
      <Breadcrumbs items={[{ label: "Applicatiefuncties", href: "/applicatiefuncties" }]} />
      <h1 className="text-2xl font-semibold text-[#1a6ca8] mb-4">Applicatiefuncties</h1>

      {/* Search bar */}
      <form role="search" method="GET" action="/applicatiefuncties" className="mb-6">
        <div className="flex">
          <input
            type="text"
            name="zoek"
            defaultValue={zoek}
            placeholder="Zoek in applicatiefuncties"
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
        {totaal} applicatiefunctie{totaal !== 1 ? "s" : ""} gevonden.
      </p>

      {functies.length === 0 ? (
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
              <th scope="col" className="py-2 px-4 font-semibold text-gray-700">Beschrijving</th>
              <th scope="col" className="py-2 px-4 font-semibold text-gray-700 text-right">Pakketten</th>
            </tr>
          </thead>
          <tbody>
            {functies.map((f) => (
              <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-4 font-medium text-gray-800">{f.naam}</td>
                <td className="py-2 px-4 text-gray-600">
                  {f.beschrijving
                    ? f.beschrijving.length > 80
                      ? f.beschrijving.slice(0, 80) + "..."
                      : f.beschrijving
                    : "—"}
                </td>
                <td className="py-2 px-4 text-right">
                  {f._count.pakketten > 0 ? (
                    <Link
                      href={`/pakketten?applicatiefunctie=${encodeURIComponent(f.naam)}`}
                      className="text-[#1a6ca8] hover:underline"
                    >
                      {f._count.pakketten}
                    </Link>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
}
