import Link from "next/link";
import MobileFilterToggle from "@/ui/components/MobileFilterToggle";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { getSessionUser, canViewGemeenteContact } from "@/process/auth-helpers";
import { getGemeenten, getGemeenteCount, getPakkettenMetTellingen } from "@/service/gemeente";
import { sterrenDisplay } from "@/process/progress";
import { tenant } from "@/process/tenant-config";

interface Props {
  searchParams: Promise<{ zoek?: string; pagina?: string; pakket?: string }>;
}

const PER_PAGE = 30;

/** Map sterrenDisplay output to filled/empty for existing rendering logic. */
function sterren(progress: number): string[] {
  return sterrenDisplay(progress).map((s) => (s === "★" ? "filled" : "empty"));
}

function PakketFilterList({ pakkettenMetTellingen, pakketFilter, zoek }: { pakkettenMetTellingen: { id: string; naam: string; aantalOrganisaties: number }[]; pakketFilter: string; zoek: string }) {
  return (
    <div className="bg-gray-50 rounded p-4">
      <h3 className="font-semibold text-sm mb-3">Pakket</h3>
      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {pakkettenMetTellingen.map((p) => (
          <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#1a6ca8]">
            <input
              type="checkbox"
              checked={pakketFilter === p.id}
              readOnly
              className="rounded border-gray-300"
            />
            <Link
              href={`/gemeenten?pakket=${pakketFilter === p.id ? "" : p.id}${zoek ? `&zoek=${zoek}` : ""}`}
              className="hover:underline"
            >
              {p.naam} ({p.aantalOrganisaties})
            </Link>
          </label>
        ))}
      </div>
    </div>
  );
}

export default async function GemeentenPage({ searchParams }: Props) {
  const params = await searchParams;
  const zoek = params.zoek || "";
  const pagina = parseInt(params.pagina || "1");
  const pakketFilter = params.pakket || "";
  const user = await getSessionUser();
  const showContact = canViewGemeenteContact(user);

  const pakkettenMetTellingen = await getPakkettenMetTellingen();

  const [gemeenten, totaal] = await Promise.all([
    getGemeenten({
      zoek: zoek || undefined,
      pakketId: pakketFilter || undefined,
      skip: (pagina - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    getGemeenteCount({
      zoek: zoek || undefined,
      pakketId: pakketFilter || undefined,
    }),
  ]);

  const aantalPaginas = Math.ceil(totaal / PER_PAGE);

  return (
    <div>
      <Breadcrumbs items={[{ label: tenant.organisatieType.meervoudCapitaal, href: tenant.routes.organisaties }]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl sm:text-3xl font-light text-[#1a6ca8]">{tenant.organisatieType.meervoudCapitaal}</h1>
        <div className="flex items-center gap-2 self-start">
          <Link
            href={`/api/gemeenten/export?zoek=${zoek}${pakketFilter ? `&pakket=${pakketFilter}` : ""}`}
            className="text-sm text-[#1a6ca8] border border-[#1a6ca8] rounded px-3 py-1.5 hover:bg-blue-50 inline-flex items-center gap-1.5"
          >
            Export to CSV
          </Link>
          <Link
            href="/gemeenten/vergelijk"
            className="text-sm text-[#1a6ca8] border border-[#1a6ca8] rounded px-3 py-1.5 hover:bg-blue-50 inline-flex items-center gap-1.5"
          >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Vergelijken
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile filter toggle */}
        <MobileFilterToggle>
          <PakketFilterList pakkettenMetTellingen={pakkettenMetTellingen} pakketFilter={pakketFilter} zoek={zoek} />
        </MobileFilterToggle>

        {/* Desktop sidebar filters */}
        <div className="w-72 flex-shrink-0 hidden md:block">
          <PakketFilterList pakkettenMetTellingen={pakkettenMetTellingen} pakketFilter={pakketFilter} zoek={zoek} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search bar */}
          <form role="search" method="GET" action="/gemeenten" className="mb-4">
            {pakketFilter && <input type="hidden" name="pakket" value={pakketFilter} />}
            <div className="flex gap-0">
              <input
                type="text"
                name="zoek"
                defaultValue={zoek}
                placeholder={`Zoek in ${tenant.organisatieType.meervoud}`}
                className="border border-gray-300 rounded-l px-4 py-2.5 text-sm flex-1"
              />
              <button
                type="submit"
                className="bg-[#1a6ca8] text-white px-5 py-2.5 rounded-r hover:bg-[#155a8c]"
              >
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>

          <p className="text-sm text-gray-600 mb-4">{totaal} resultaten gevonden.</p>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left">
                  <th scope="col" className="pb-2 pr-4">
                    <Link href="/gemeenten?zoek=&pagina=1" className="text-[#1a6ca8] hover:underline font-semibold">
                      Naam
                    </Link>
                  </th>
                  {showContact && (
                    <>
                      <th scope="col" className="pb-2 pr-4 font-semibold hidden lg:table-cell">Contactpersoon</th>
                      <th scope="col" className="pb-2 pr-4 font-semibold hidden lg:table-cell">E-mailadres contactpersoon</th>
                    </>
                  )}
                  <th scope="col" className="pb-2 font-semibold">
                    <Link href="/gemeenten?zoek=&pagina=1" className="text-[#1a6ca8] hover:underline">
                      Voortgang
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody>
                {gemeenten.map((g) => (
                  <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <Link href={`/gemeenten/${g.id}`} className="text-[#1a6ca8] hover:underline">
                        {g.naam}
                      </Link>
                    </td>
                    {showContact && (
                      <>
                        <td className="py-3 pr-4 text-gray-700 hidden lg:table-cell">{g.contactpersoon || ""}</td>
                        <td className="py-3 pr-4 hidden lg:table-cell">
                          {g.email ? (
                            <a href={`mailto:${g.email}`} className="text-[#1a6ca8] hover:underline">
                              {g.email}
                            </a>
                          ) : (
                            ""
                          )}
                        </td>
                      </>
                    )}
                    <td className="py-3">
                      <div className="flex items-center gap-0.5">
                        {sterren(g.progress).map((s, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${s === "filled" ? "text-[#e35b10]" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {gemeenten.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-3" role="img" aria-label="Zoeken">&#x1F50D;</span>
              <p className="font-bold mb-1">Geen resultaten gevonden</p>
              <p className="text-sm text-gray-400">Probeer een andere zoekterm of filter</p>
            </div>
          )}

          {/* Pagination */}
          {aantalPaginas > 1 && (
            <div className="flex gap-2 mt-4 text-sm">
              {pagina > 1 && (
                <Link
                  href={`/gemeenten?zoek=${zoek}&pagina=${pagina - 1}${pakketFilter ? `&pakket=${pakketFilter}` : ""}`}
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
                  href={`/gemeenten?zoek=${zoek}&pagina=${pagina + 1}${pakketFilter ? `&pakket=${pakketFilter}` : ""}`}
                  className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                  Volgende →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
