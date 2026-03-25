import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import {
  getAddenda,
  getAddendaCount,
  getAddendaCountPerType,
  getLeveranciersMetAddendaCount,
} from "@/service/addendum";
import EditAddendumModal from "./EditAddendumModal";

export const revalidate = 3600; // ISR: regenerate every hour

interface Props {
  searchParams: Promise<{
    type?: string;
    leverancier?: string;
    pagina?: string;
  }>;
}

const PER_PAGE = 25;

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function AddendaPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedType = params.type || "";
  const selectedLeverancier = params.leverancier || "";
  const pagina = parseInt(params.pagina || "1");

  const [addenda, totaal, countPerType, leveranciersMetCount] =
    await Promise.all([
      getAddenda({
        type: selectedType || undefined,
        zoek: selectedLeverancier || undefined,
        skip: (pagina - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      getAddendaCount({
        type: selectedType || undefined,
        zoek: selectedLeverancier || undefined,
      }),
      getAddendaCountPerType(),
      getLeveranciersMetAddendaCount(),
    ]);

  const aantalPaginas = Math.ceil(totaal / PER_PAGE);

  function buildQuery(overrides: Record<string, string | number>) {
    const q = new URLSearchParams();
    if (selectedType) q.set("type", selectedType);
    if (selectedLeverancier) q.set("leverancier", selectedLeverancier);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) q.set(k, String(v));
    }
    return q.toString();
  }

  const exportParams = new URLSearchParams();
  if (selectedType) exportParams.set("type", selectedType);
  if (selectedLeverancier) exportParams.set("zoek", selectedLeverancier);
  const exportUrl = `/api/addenda/export?${exportParams.toString()}`;

  // Max leveranciers to show initially in sidebar
  const MAX_SIDEBAR_ITEMS = 10;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Addenda", href: "/addenda" }]} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#1a6ca8]">Addenda</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">{totaal} resultaten</p>
          <Link
            href={exportUrl}
            className="text-sm border px-3 py-1 rounded hover:bg-gray-50"
          >
            CSV export
          </Link>
        </div>
      </div>

      <hr className="border-gray-200 mb-6" />

      <div className="flex gap-8">
        {/* ── Sidebar met filters ── */}
        <aside className="w-72 flex-shrink-0 hidden md:block">
          {/* Addendum type filter */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-gray-900 mb-2">Addendum</h3>
            <hr className="border-gray-300 mb-3" />
            <div className="space-y-1.5">
              {countPerType.map((t) => {
                const isActive = selectedType === t.naam;
                const q = new URLSearchParams();
                if (!isActive) q.set("type", t.naam);
                if (selectedLeverancier)
                  q.set("leverancier", selectedLeverancier);

                return (
                  <Link
                    key={t.naam}
                    href={`/addenda?${q.toString()}`}
                    className={`flex items-start gap-2 text-sm group ${
                      isActive ? "font-semibold text-gray-900" : "text-gray-700"
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center ${
                        isActive
                          ? "bg-[#1a6ca8] border-[#1a6ca8]"
                          : "border-gray-400 group-hover:border-[#1a6ca8]"
                      }`}
                    >
                      {isActive && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="group-hover:underline leading-tight">
                      {t.naam} ({t.aantal})
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Leverancier filter */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-gray-900 mb-2">
              Leverancier
            </h3>
            <hr className="border-gray-300 mb-3" />
            <div className="space-y-1.5">
              {leveranciersMetCount
                .slice(0, MAX_SIDEBAR_ITEMS)
                .map((l) => {
                  const isActive = selectedLeverancier === l.naam;
                  const q = new URLSearchParams();
                  if (selectedType) q.set("type", selectedType);
                  if (!isActive) q.set("leverancier", l.naam);

                  return (
                    <Link
                      key={l.id}
                      href={`/addenda?${q.toString()}`}
                      className={`flex items-start gap-2 text-sm group ${
                        isActive
                          ? "font-semibold text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      <span
                        className={`mt-0.5 w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center ${
                          isActive
                            ? "bg-[#1a6ca8] border-[#1a6ca8]"
                            : "border-gray-400 group-hover:border-[#1a6ca8]"
                        }`}
                      >
                        {isActive && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="group-hover:underline">
                        {l.naam} ({l.aantal})
                      </span>
                    </Link>
                  );
                })}
              {leveranciersMetCount.length > MAX_SIDEBAR_ITEMS && (
                <details className="mt-1">
                  <summary className="text-sm text-[#1a6ca8] cursor-pointer hover:underline border border-gray-300 rounded px-2 py-0.5 inline-block">
                    Show more
                  </summary>
                  <div className="space-y-1.5 mt-1.5">
                    {leveranciersMetCount
                      .slice(MAX_SIDEBAR_ITEMS)
                      .map((l) => {
                        const isActive = selectedLeverancier === l.naam;
                        const q = new URLSearchParams();
                        if (selectedType) q.set("type", selectedType);
                        if (!isActive) q.set("leverancier", l.naam);

                        return (
                          <Link
                            key={l.id}
                            href={`/addenda?${q.toString()}`}
                            className={`flex items-start gap-2 text-sm group ${
                              isActive
                                ? "font-semibold text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            <span
                              className={`mt-0.5 w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center ${
                                isActive
                                  ? "bg-[#1a6ca8] border-[#1a6ca8]"
                                  : "border-gray-400 group-hover:border-[#1a6ca8]"
                              }`}
                            >
                              {isActive && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </span>
                            <span className="group-hover:underline">
                              {l.naam} ({l.aantal})
                            </span>
                          </Link>
                        );
                      })}
                  </div>
                </details>
              )}
            </div>
          </div>

          {/* Reset filters */}
          {(selectedType || selectedLeverancier) && (
            <Link
              href="/addenda"
              className="text-sm text-[#1a6ca8] hover:underline"
            >
              Alle filters wissen
            </Link>
          )}
        </aside>

        {/* ── Tabel ── */}
        <div className="flex-1 min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 text-left">
                  <th scope="col" className="pb-2 pr-4 font-semibold text-[#1a6ca8]">
                    <Link href={`/addenda?${buildQuery({})}`}>
                      Leverancier
                    </Link>
                  </th>
                  <th scope="col" className="pb-2 pr-4 font-semibold text-[#1a6ca8]">
                    <Link href={`/addenda?${buildQuery({})}`}>Addendum</Link>
                  </th>
                  <th scope="col" className="pb-2 pr-4 font-semibold text-[#1a6ca8] text-right">
                    Afspraak realisatie
                  </th>
                  <th scope="col" className="pb-2 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {addenda.map((a) => (
                  <tr
                    key={`${a.leverancierId}-${a.addendumId}`}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/leveranciers/${a.leverancier.slug}`}
                        className="text-[#1a6ca8] hover:underline"
                      >
                        {a.leverancier.naam}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/addenda?type=${encodeURIComponent(a.addendum.naam)}`}
                        className="text-[#1a6ca8] hover:underline"
                      >
                        {a.addendum.naam}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 text-right">
                      {formatDate(a.deadline)}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditAddendumModal
                          leverancierId={a.leverancierId}
                          addendumId={a.addendumId}
                          leverancierNaam={a.leverancier.naam}
                          addendumNaam={a.addendum.naam}
                          deadline={a.deadline ? new Date(a.deadline).toISOString().split("T")[0] : null}
                          datumGereed={a.ondertekend ? new Date(a.ondertekend).toISOString().split("T")[0] : null}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {addenda.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="font-bold mb-1">Geen addenda gevonden</p>
              <p className="text-sm text-gray-400">
                Probeer een ander filter
              </p>
            </div>
          )}

          {/* Pagination */}
          {aantalPaginas > 1 && (
            <div className="flex gap-2 mt-4 text-sm">
              {pagina > 1 && (
                <Link
                  href={`/addenda?${buildQuery({ pagina: pagina - 1 })}`}
                  className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                  &#8592; Vorige
                </Link>
              )}
              <span className="px-3 py-1 text-gray-600">
                Pagina {pagina} van {aantalPaginas}
              </span>
              {pagina < aantalPaginas && (
                <Link
                  href={`/addenda?${buildQuery({ pagina: pagina + 1 })}`}
                  className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                  Volgende &#8594;
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
