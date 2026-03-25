import Link from "next/link";
import CollapsibleFilterList from "@/components/CollapsibleFilterList";
import DashboardKaartBar from "@/components/DashboardKaartBar";
import { AddPakketButton, PakketRowActions } from "./PakkettenTabActions";
import type { PakketRow } from "./types";

// ─── Pakketten tab ───────────────────────────────────────────────────────────

export default function PakkettenTab({
  pakketten,
  totalPakketCount,
  compliancyFilter,
  standaardFilter,
  testrapportFilter,
  standaardFilters,
  views,
  gemeenteId,
  gemeenteNaam,
  canEdit,
}: {
  pakketten: PakketRow[];
  totalPakketCount: number;
  compliancyFilter?: string;
  standaardFilter?: string;
  testrapportFilter?: string;
  standaardFilters?: { naam: string; count: number }[];
  views: { id: string; titel: string; domein: string }[];
  gemeenteId: string;
  gemeenteNaam: string;
  canEdit?: boolean;
}) {
  const nietCompliant = pakketten.filter((p) => !p.hasCompliancy).length;
  const welCompliant = pakketten.filter((p) => p.hasCompliancy).length;

  const hasActiveFilter = compliancyFilter || standaardFilter || testrapportFilter;

  // Build base URL preserving other active filters
  function buildBaseHref(excludeParam?: string) {
    const url = new URL(`/gemeenten/${gemeenteId}`, "http://localhost");
    url.searchParams.set("tab", "pakketten");
    if (compliancyFilter && excludeParam !== "compliancy") url.searchParams.set("compliancy", compliancyFilter);
    if (standaardFilter && excludeParam !== "standaard") url.searchParams.set("standaard", standaardFilter);
    if (testrapportFilter && excludeParam !== "testrapport") url.searchParams.set("testrapport", testrapportFilter);
    return `${url.pathname}${url.search}`;
  }

  function compliancyHref(value: string) {
    const base = buildBaseHref("compliancy");
    return compliancyFilter === value ? base : `${base}&compliancy=${value}`;
  }

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>{canEdit && <AddPakketButton gemeenteId={gemeenteId} />}</div>
        <DashboardKaartBar views={views} gemeenteId={gemeenteId} gemeenteNaam={gemeenteNaam} />
      </div>

      <div className="flex gap-8">
        {/* Filters */}
        <div className="w-72 flex-shrink-0 space-y-6">
          {/* Compliancy filter */}
          <div>
            <h3 className="font-bold text-sm mb-2">Pakketversie is compliant</h3>
            <div className="space-y-1.5 text-sm">
              <Link href={compliancyHref("niet")} className="flex items-center gap-2 hover:underline">
                <input type="checkbox" readOnly checked={compliancyFilter === "niet"} className="rounded border-gray-300" />
                <span className={compliancyFilter === "niet" ? "text-gray-900 font-medium" : "text-gray-700"}>
                  Niet compliant met een standaard ({nietCompliant})
                </span>
              </Link>
              <Link href={compliancyHref("wel")} className="flex items-center gap-2 hover:underline">
                <input type="checkbox" readOnly checked={compliancyFilter === "wel"} className="rounded border-gray-300" />
                <span className={compliancyFilter === "wel" ? "text-gray-900 font-medium" : "text-gray-700"}>
                  Compliant met een testrapport ({welCompliant})
                </span>
              </Link>
            </div>
          </div>

          {/* Standaard met testrapport */}
          {standaardFilters && standaardFilters.filter(s => s.count > 0).length > 0 && (
            <CollapsibleFilterList
              title="Standaard met testrapport"
              items={standaardFilters.filter(s => s.count > 0).map(s => ({ label: `Met testrapport ${s.naam}`, count: s.count, value: s.naam }))}
              initialCount={5}
              activeValue={testrapportFilter}
              baseHref={buildBaseHref("testrapport")}
              paramName="testrapport"
            />
          )}

          {/* Standaard */}
          {standaardFilters && standaardFilters.length > 0 && (
            <CollapsibleFilterList
              title="Standaard"
              items={standaardFilters.map(s => ({ label: s.naam, count: s.count }))}
              initialCount={5}
              activeValue={standaardFilter}
              baseHref={buildBaseHref("standaard")}
              paramName="standaard"
            />
          )}

          {/* Reset filters */}
          {hasActiveFilter && (
            <Link
              href={`/gemeenten/${gemeenteId}?tab=pakketten`}
              scroll={false}
              className="text-[#1a6ca8] hover:underline text-xs font-medium block"
            >
              Alle filters wissen
            </Link>
          )}
        </div>

        {/* Table */}
        <div className="flex-1">
          {hasActiveFilter && (
            <p className="text-xs text-gray-500 mb-3">
              {pakketten.length} van {totalPakketCount} pakketten
            </p>
          )}
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left">
                <th scope="col" className="pb-2 pr-4 font-semibold">Leverancier</th>
                <th scope="col" className="pb-2 pr-4 font-semibold">Pakketnaam en -versie</th>
                <th scope="col" className="pb-2 pr-4 font-semibold">Status</th>
                <th scope="col" className="pb-2 font-semibold">Gebruikt voor</th>
                {canEdit && <th scope="col" className="pb-2 w-20"></th>}
              </tr>
            </thead>
            <tbody>
              {pakketten.map((p, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                  <td className="py-3 pr-4 text-gray-700">{p.leverancier}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/pakketten/${p.pakketSlug}`} className="text-[#1a6ca8] hover:underline">
                      {p.pakketNaam} {p.versie}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {p.status || "In productie"}
                    {p.datumIngangStatus && (
                      <div className="text-xs text-gray-400">
                        {new Date(p.datumIngangStatus).toLocaleDateString("nl-NL")}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-gray-600 text-xs leading-relaxed">
                    {p.gebruiktVoor.join(", ") || "\u2014"}
                  </td>
                  {canEdit && (
                    <td className="py-3">
                      <PakketRowActions
                        gemeenteId={gemeenteId}
                        row={{
                          pakketversieId: p.pakketversieId,
                          pakketNaam: p.pakketNaam,
                          versieNaam: p.versie,
                          status: p.status,
                          technologie: p.technologie,
                          verantwoordelijke: p.verantwoordelijke,
                          licentievorm: p.licentievorm,
                          aantalGebruikers: p.aantalGebruikers,
                          maatwerk: p.maatwerk,
                        }}
                      />
                    </td>
                  )}
                </tr>
              ))}
              {pakketten.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Geen pakketten gevonden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
