import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { prisma } from "@/data/prisma";
import { getSessionUser } from "@/process/auth-helpers";
import { redirect } from "next/navigation";
import { tenant } from "@/process/tenant-config";

export const revalidate = 3600; // ISR: regenerate every hour

interface Props {
  searchParams: Promise<{
    pagina?: string;
    soort?: string;
    standaard?: string;
    status?: string;
  }>;
}

const PER_PAGE = 30;

export default async function AlleKoppelingenPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login?callbackUrl=/koppelingen");

  const params = await searchParams;
  const pagina = parseInt(params.pagina || "1");
  const soortFilter = params.soort || "";
  const standaardFilter = params.standaard || "";
  const statusFilter = params.status || "";

  // Build where clause
  const where: Record<string, unknown> = {};
  if (soortFilter === "buitengemeentelijk") {
    where.buitenOrganisatie = true;
  }
  if (standaardFilter) {
    where.standaard = { contains: standaardFilter, mode: "insensitive" };
  }
  if (statusFilter) {
    where.status = statusFilter;
  }

  // Load filter options
  const [standaarden, statusOpties, buitengemeentelijkCount, totaal, koppelingen] = await Promise.all([
    prisma.koppeling.groupBy({
      by: ["standaard"],
      where: { standaard: { not: null } },
      _count: true,
      orderBy: { _count: { standaard: "desc" } },
      take: 20,
    }),
    prisma.koppeling.groupBy({
      by: ["status"],
      where: { status: { not: null } },
      _count: true,
      orderBy: { _count: { status: "desc" } },
    }),
    prisma.koppeling.count({ where: { buitenOrganisatie: true } }),
    prisma.koppeling.count({ where }),
    prisma.koppeling.findMany({
      where,
      include: {
        organisatie: true,
        bronPakketversie: { include: { pakket: true } },
        bronExternPakket: true,
        doelPakketversie: { include: { pakket: true } },
        doelExternPakket: true,
      },
      orderBy: [{ organisatie: { naam: "asc" } }, { createdAt: "asc" }],
      skip: (pagina - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const aantalPaginas = Math.ceil(totaal / PER_PAGE);

  function buildFilterUrl(key: string, value: string): string {
    const p = new URLSearchParams();
    if (key === "soort") p.set("soort", soortFilter === value ? "" : value);
    else if (soortFilter) p.set("soort", soortFilter);

    if (key === "standaard") p.set("standaard", standaardFilter === value ? "" : value);
    else if (standaardFilter) p.set("standaard", standaardFilter);

    if (key === "status") p.set("status", statusFilter === value ? "" : value);
    else if (statusFilter) p.set("status", statusFilter);

    return `/koppelingen?${p.toString()}`;
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Koppelingen", href: "/koppelingen" }]} />
      <h1 className="text-3xl font-light text-[#1a6ca8] mb-6">Alle koppelingen</h1>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <div className="w-72 flex-shrink-0 space-y-6">
          {/* Soort koppelingen */}
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-semibold text-sm mb-3">Soort koppelingen</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                readOnly
                checked={soortFilter === "buitengemeentelijk"}
                className="rounded border-gray-300"
              />
              <Link href={buildFilterUrl("soort", "buitengemeentelijk")} className="hover:underline">
                Buitengemeentelijk ({buitengemeentelijkCount})
              </Link>
            </label>
          </div>

          {/* Standaard */}
          {standaarden.length > 0 && (
            <div className="bg-gray-50 rounded p-4">
              <h3 className="font-semibold text-sm mb-3">Standaard</h3>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {standaarden.map((s) =>
                  s.standaard ? (
                    <label key={s.standaard} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        readOnly
                        checked={standaardFilter === s.standaard}
                        className="rounded border-gray-300"
                      />
                      <Link href={buildFilterUrl("standaard", s.standaard)} className="hover:underline">
                        {s.standaard} ({s._count})
                      </Link>
                    </label>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Status */}
          {statusOpties.length > 0 && (
            <div className="bg-gray-50 rounded p-4">
              <h3 className="font-semibold text-sm mb-3">Status</h3>
              <div className="space-y-1.5">
                {statusOpties.map((s) =>
                  s.status ? (
                    <label key={s.status} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        readOnly
                        checked={statusFilter === s.status}
                        className="rounded border-gray-300"
                      />
                      <Link href={buildFilterUrl("status", s.status)} className="hover:underline">
                        {s.status} ({s._count})
                      </Link>
                    </label>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left">
                <th scope="col" className="pb-2 pr-4 font-semibold">{tenant.organisatieType.meervoudCapitaal}</th>
                <th scope="col" className="pb-2 pr-4">
                  <Link href="#" className="text-[#1a6ca8] hover:underline font-semibold">
                    Pakketversie/Extern
                  </Link>
                </th>
                <th scope="col" className="pb-2 pr-4 font-semibold text-center">Koppeling</th>
                <th scope="col" className="pb-2 pr-4">
                  <Link href="#" className="text-[#1a6ca8] hover:underline font-semibold">
                    Pakketversie/Extern/Buitengemeentelijk
                  </Link>
                </th>
                <th scope="col" className="pb-2 pr-4 font-semibold">Status</th>
                <th scope="col" className="pb-2">
                  <Link href="#" className="text-[#1a6ca8] hover:underline font-semibold">
                    Standaard
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {koppelingen.map((k) => {
                const bronLabel = k.bronPakketversie
                  ? `${k.bronPakketversie.pakket.naam} - ${k.bronPakketversie.naam}`
                  : k.bronExternPakket
                    ? `${k.bronExternPakket.naam}${k.bronExternPakket.versie ? ` - ${k.bronExternPakket.versie}` : ""} (Extern pakket)`
                    : "—";

                const doelLabel = k.doelPakketversie
                  ? `${k.doelPakketversie.pakket.naam} - ${k.doelPakketversie.naam}`
                  : k.doelExternPakket
                    ? `${k.doelExternPakket.naam}${k.doelExternPakket.versie ? ` - ${k.doelExternPakket.versie}` : ""}${k.buitenOrganisatie ? " (Buitengemeentelijk)" : " (Extern pakket)"}`
                    : "—";

                const richting = k.richting === "heen" ? "→" : k.richting === "weer" ? "←" : "↔";

                return (
                  <tr key={k.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                    <td className="py-3 pr-4">
                      <Link href={`/gemeenten/${k.organisatieId}`} className="text-[#1a6ca8] hover:underline">
                        {k.organisatie.naam}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {k.bronPakketversie ? (
                        <Link href={`/pakketten/${k.bronPakketversie.pakket.slug}`} className="text-[#1a6ca8] hover:underline">
                          {bronLabel}
                        </Link>
                      ) : (
                        bronLabel
                      )}
                    </td>
                    <td className="py-3 pr-4 text-center text-lg">{richting}</td>
                    <td className="py-3 pr-4 text-gray-700">
                      {k.doelPakketversie ? (
                        <Link href={`/pakketten/${k.doelPakketversie.pakket.slug}`} className="text-[#1a6ca8] hover:underline">
                          {doelLabel}
                        </Link>
                      ) : (
                        doelLabel
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{k.status || "—"}</td>
                    <td className="py-3 text-gray-600">{k.standaard || "Onbekend"}</td>
                  </tr>
                );
              })}
              {koppelingen.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Geen koppelingen gevonden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {aantalPaginas > 1 && (
            <div className="flex gap-2 mt-4 text-sm">
              {pagina > 1 && (
                <Link
                  href={`/koppelingen?pagina=${pagina - 1}${soortFilter ? `&soort=${soortFilter}` : ""}${standaardFilter ? `&standaard=${standaardFilter}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`}
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
                  href={`/koppelingen?pagina=${pagina + 1}${soortFilter ? `&soort=${soortFilter}` : ""}${standaardFilter ? `&standaard=${standaardFilter}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`}
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
