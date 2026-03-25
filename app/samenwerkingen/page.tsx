import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Samenwerkingen - Voorzieningencatalogus",
};

export default async function SamenwerkingenPage({
  searchParams,
}: {
  searchParams: Promise<{ zoek?: string; type?: string; pagina?: string }>;
}) {
  const params = await searchParams;
  const zoek = params.zoek || "";
  const typeFilter = params.type || "";
  const pagina = Math.max(1, parseInt(params.pagina || "1", 10));
  const perPagina = 25;

  // Bouw where-clause
  const where: Record<string, unknown> = {};
  if (zoek) {
    where.naam = { contains: zoek, mode: "insensitive" };
  }
  if (typeFilter) {
    where.type = typeFilter;
  }

  const [samenwerkingen, totaal, alleTypes] = await Promise.all([
    prisma.samenwerking.findMany({
      where,
      include: {
        gemeenten: {
          include: {
            gemeente: {
              select: { id: true, naam: true },
            },
          },
          orderBy: { gemeente: { naam: "asc" } },
        },
      },
      orderBy: { naam: "asc" },
      skip: (pagina - 1) * perPagina,
      take: perPagina,
    }),
    prisma.samenwerking.count({ where }),
    prisma.samenwerking.findMany({
      where: { type: { not: null } },
      select: { type: true },
      distinct: ["type"],
      orderBy: { type: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totaal / perPagina);
  const types = alleTypes
    .map((t) => t.type)
    .filter((t): t is string => t !== null);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Samenwerkingen", href: "/samenwerkingen" }]} />
      <h1 className="text-2xl font-bold text-[#1a6ca8] mb-1">
        Samenwerkingen
      </h1>
      <p className="text-sm text-gray-500 mb-5">{totaal} samenwerkingen</p>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6" method="get">
        <input
          type="text"
          name="zoek"
          defaultValue={zoek}
          placeholder="Zoek samenwerking..."
          className="border border-gray-300 rounded px-3 py-2 text-sm w-64"
        />
        {types.length > 0 && (
          <select
            name="type"
            defaultValue={typeFilter}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">Alle types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
        <button
          type="submit"
          className="bg-[#1a6ca8] text-white text-sm px-4 py-2 rounded hover:bg-[#155a8c]"
        >
          Zoeken
        </button>
        {(zoek || typeFilter) && (
          <Link
            href="/samenwerkingen"
            className="text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            Wis filters
          </Link>
        )}
      </form>

      {/* Lijst */}
      {samenwerkingen.length === 0 ? (
        <p className="text-sm text-gray-500">
          Geen samenwerkingen gevonden
          {zoek ? ` voor "${zoek}"` : ""}.
        </p>
      ) : (
        <div className="space-y-4">
          {samenwerkingen.map((sw) => (
            <div
              key={sw.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                    <Link href={`/samenwerkingen/${sw.id}`} className="text-base font-semibold text-[#1a6ca8] hover:underline">
                    {sw.naam}
                  </Link>
                  <div className="flex items-center gap-3 mt-1">
                    {sw.type && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {sw.type}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {sw.gemeenten.length} gemeente
                      {sw.gemeenten.length !== 1 ? "n" : ""}
                    </span>
                  </div>
                </div>
                {(sw.contactpersoon || sw.email) && (
                  <div className="text-right text-xs text-gray-500">
                    {sw.contactpersoon && <div>{sw.contactpersoon}</div>}
                    {sw.email && (
                      <a
                        href={`mailto:${sw.email}`}
                        className="text-[#1a6ca8] hover:underline"
                      >
                        {sw.email}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Deelnemende gemeenten */}
              {sw.gemeenten.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Deelnemende gemeenten:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sw.gemeenten.map((sg) => (
                      <Link
                        key={sg.gemeenteId}
                        href={`/gemeenten/${encodeURIComponent(sg.gemeente.naam.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`}
                        className="text-xs bg-blue-50 text-[#1a6ca8] hover:bg-blue-100 px-2 py-0.5 rounded transition"
                      >
                        {sg.gemeente.naam}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginering */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {pagina > 1 && (
            <Link
              href={`/samenwerkingen?${new URLSearchParams({ ...(zoek ? { zoek } : {}), ...(typeFilter ? { type: typeFilter } : {}), pagina: String(pagina - 1) }).toString()}`}
              className="text-sm text-[#1a6ca8] hover:underline"
            >
              ← Vorige
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Pagina {pagina} van {totalPages}
          </span>
          {pagina < totalPages && (
            <Link
              href={`/samenwerkingen?${new URLSearchParams({ ...(zoek ? { zoek } : {}), ...(typeFilter ? { type: typeFilter } : {}), pagina: String(pagina + 1) }).toString()}`}
              className="text-sm text-[#1a6ca8] hover:underline"
            >
              Volgende →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
