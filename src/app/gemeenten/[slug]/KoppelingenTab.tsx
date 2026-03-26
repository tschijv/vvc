import Link from "next/link";
import CollapsibleFilterList from "@/ui/components/CollapsibleFilterList";
import DashboardKaartBar from "@/ui/components/DashboardKaartBar";
import { AddKoppelingButton, KoppelingRowActions } from "./KoppelingenTabActions";
import type { KoppelingRow } from "@/service/gemeente";

// ─── Koppelingen tab ─────────────────────────────────────────────────────────

export default function KoppelingenTab({
  koppelingen: allKoppelingen,
  views,
  organisatieId,
  organisatieNaam,
  filterStandaard,
  filterBron,
  filterBuitenOrganisatie,
  canEdit,
}: {
  koppelingen: KoppelingRow[];
  views: { id: string; titel: string; domein: string }[];
  organisatieId: string;
  organisatieNaam: string;
  filterStandaard?: string;
  filterBron?: string;
  filterBuitenOrganisatie?: string;
  canEdit?: boolean;
}) {
  // Counts on unfiltered data for sidebar
  const buitenOrganisatieCount = allKoppelingen.filter((k) => k.buitenOrganisatie).length;

  const standaardCounts: Record<string, number> = {};
  allKoppelingen.forEach((k) => {
    if (k.standaard) {
      standaardCounts[k.standaard] = (standaardCounts[k.standaard] || 0) + 1;
    }
  });
  const standaardEntries = Object.entries(standaardCounts).sort((a, b) => b[1] - a[1]);

  const pakketversieCounts: Record<string, number> = {};
  allKoppelingen.forEach((k) => {
    if (k.bron && k.bron !== "\u2014") {
      pakketversieCounts[k.bron] = (pakketversieCounts[k.bron] || 0) + 1;
    }
  });
  const pakketversieEntries = Object.entries(pakketversieCounts).sort((a, b) => b[1] - a[1]);

  // Apply filters
  let koppelingen = allKoppelingen;
  if (filterBuitenOrganisatie === "ja") {
    koppelingen = koppelingen.filter((k) => k.buitenOrganisatie);
  }
  if (filterStandaard) {
    koppelingen = koppelingen.filter((k) => k.standaard === filterStandaard);
  }
  if (filterBron) {
    koppelingen = koppelingen.filter((k) => k.bron === filterBron);
  }

  const hasActiveFilter = filterBuitenOrganisatie || filterStandaard || filterBron;

  // Build base URLs for each filter (with the other filters preserved)
  function buildBaseHref(excludeParam?: string) {
    const url = new URL(`/gemeenten/${organisatieId}`, "http://localhost");
    url.searchParams.set("tab", "koppelingen");
    if (filterBuitenOrganisatie && excludeParam !== "buitengemeentelijk") url.searchParams.set("buitengemeentelijk", filterBuitenOrganisatie);
    if (filterStandaard && excludeParam !== "standaard") url.searchParams.set("standaard", filterStandaard);
    if (filterBron && excludeParam !== "bron") url.searchParams.set("bron", filterBron);
    return `${url.pathname}${url.search}`;
  }

  const buitenOrganisatieToggleHref = filterBuitenOrganisatie === "ja"
    ? buildBaseHref("buitengemeentelijk")
    : buildBaseHref("buitengemeentelijk") + "&buitengemeentelijk=ja";

  const standaardBaseHref = buildBaseHref("standaard");
  const bronBaseHref = buildBaseHref("bron");

  return (
    <div>
      {/* Action bar with export */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>{canEdit && <AddKoppelingButton organisatieId={organisatieId} pakketversies={[]} />}</div>
        <DashboardKaartBar views={views} organisatieId={organisatieId} organisatieNaam={organisatieNaam} />
      </div>

      <div className="flex gap-8">
        {/* Filter sidebar */}
        <div className="w-72 flex-shrink-0 space-y-6">
          {/* Soort koppelingen */}
          <div>
            <h3 className="font-bold text-sm mb-2">Soort koppelingen</h3>
            <div className="space-y-1.5 text-sm">
              <Link
                href={buitenOrganisatieToggleHref}
                className="flex items-center gap-2 hover:underline"
              >
                <input type="checkbox" readOnly checked={filterBuitenOrganisatie === "ja"} className="rounded border-gray-300" />
                <span className={filterBuitenOrganisatie === "ja" ? "text-gray-900 font-medium" : "text-gray-700"}>
                  Buitengemeentelijk ({buitenOrganisatieCount})
                </span>
              </Link>
            </div>
          </div>

          {/* Standaard */}
          {standaardEntries.length > 0 && (
            <CollapsibleFilterList
              title="Standaard"
              items={standaardEntries.map(([naam, count]) => ({ label: naam, count }))}
              initialCount={5}
              activeValue={filterStandaard}
              baseHref={standaardBaseHref}
              paramName="standaard"
            />
          )}

          {/* Pakketversie/buitengemeentelijk koppelvlak */}
          {pakketversieEntries.length > 0 && (
            <CollapsibleFilterList
              title="Pakketversie/buitengemeentelijk koppelvlak"
              items={pakketversieEntries.map(([naam, count]) => ({ label: naam, count }))}
              initialCount={5}
              activeValue={filterBron}
              baseHref={bronBaseHref}
              paramName="bron"
            />
          )}

          {/* Reset filters */}
          {hasActiveFilter && (
            <Link
              href={`/gemeenten/${organisatieId}?tab=koppelingen`}
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
              {koppelingen.length} van {allKoppelingen.length} koppelingen
            </p>
          )}
          {koppelingen.length > 0 ? (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left">
                  <th scope="col" className="pb-2 pr-4 font-semibold text-[#1a6ca8]">Pakketversie/Extern</th>
                  <th scope="col" className="pb-2 pr-4 font-semibold text-center">Koppeling</th>
                  <th scope="col" className="pb-2 pr-4 font-semibold text-[#1a6ca8]">Pakketversie/Extern/Buitengemeentelijk</th>
                  <th scope="col" className="pb-2 pr-4 font-semibold">Status</th>
                  <th scope="col" className="pb-2 font-semibold text-[#1a6ca8]">Standaard</th>
                  {canEdit && <th scope="col" className="pb-2 w-20"></th>}
                </tr>
              </thead>
              <tbody>
                {koppelingen.map((k, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4 text-[#1a6ca8]">{k.bron}</td>
                    <td className="py-3 pr-4 text-center text-lg">{k.richting}</td>
                    <td className="py-3 pr-4 text-[#1a6ca8]">{k.doel}</td>
                    <td className="py-3 pr-4 text-gray-600">{k.status || "\u2014"}</td>
                    <td className="py-3 text-gray-600">{k.standaard || "\u2014"}</td>
                    {canEdit && (
                      <td className="py-3">
                        <KoppelingRowActions
                          organisatieId={organisatieId}
                          koppeling={{
                            id: k.id,
                            bron: k.bron,
                            doel: k.doel,
                            richtingRaw: k.richtingRaw,
                            buitenOrganisatie: k.buitenOrganisatie,
                            status: k.status,
                            standaard: k.standaard,
                            transportprotocol: k.transportprotocol,
                            aanvullendeInformatie: k.aanvullendeInformatie,
                            bronPakketversieId: k.bronPakketversieId,
                            bronExternPakketId: k.bronExternPakketId,
                            doelPakketversieId: k.doelPakketversieId,
                            doelExternPakketId: k.doelExternPakketId,
                          }}
                          pakketversies={[]}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">
              {hasActiveFilter ? "Geen koppelingen gevonden met deze filters." : "Geen koppelingen geregistreerd."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
