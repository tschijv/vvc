import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { prisma } from "@/data/prisma";
import { getSessionUser, canViewGemeentePortfolio } from "@/process/auth-helpers";
import { getGemeenteById } from "@/service/gemeente";
import OrganisatieSelector from "./OrganisatieSelector";
import HelpLink from "@/ui/components/HelpLink";

export const metadata: Metadata = {
  title: "Gemeenten vergelijken",
  description: "Vergelijk het applicatielandschap van meerdere gemeenten",
};

interface Props {
  searchParams: Promise<{ a?: string; b?: string; c?: string; d?: string }>;
}

export default async function VergelijkPage({ searchParams }: Props) {
  const params = await searchParams;
  // Collect selected IDs in order (a, b, c, d)
  const rawIds = [params.a, params.b, params.c, params.d];
  // Count slots: include all up to the last explicitly provided param (even if empty)
  // "_" is used as a placeholder for empty slots (empty string is dropped by some frameworks)
  const lastProvided = rawIds.reduce((last, v, i) => (v !== undefined ? i : last), -1);
  const slotCount = Math.max(lastProvided + 1, 2);
  const selectedIds = rawIds.slice(0, slotCount).map((v) => (!v || v === "_") ? "" : v);

  // Ensure at least 2 slots
  while (selectedIds.length < 2) selectedIds.push("");

  const user = await getSessionUser();
  const showPortfolio = canViewGemeentePortfolio(user);

  // Get all gemeenten for the selectors
  const alleGemeenten = await prisma.organisatie.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });

  // Load selected gemeenten that have a value
  const filledIds = selectedIds.filter(Boolean);
  const hasEnough = filledIds.length >= 2 && showPortfolio;

  type LoadedGemeente = NonNullable<Awaited<ReturnType<typeof getGemeenteById>>>;
  const gemeenteMap = new Map<string, LoadedGemeente>();

  if (hasEnough) {
    const loaded = await Promise.all(filledIds.map((id) => getGemeenteById(id)));
    for (let i = 0; i < filledIds.length; i++) {
      if (loaded[i]) gemeenteMap.set(filledIds[i], loaded[i]!);
    }
  }

  const gemeenten = selectedIds
    .filter((id) => id && gemeenteMap.has(id))
    .map((id) => gemeenteMap.get(id)!);

  // Build comparison matrix: rows = pakketten, columns = gemeenten
  type PakketRow = {
    pakketNaam: string;
    leverancierNaam: string;
    pakketSlug: string;
    present: boolean[]; // one per gemeente
    versies: (string | undefined)[]; // one per gemeente
  };

  const pakketIndex = new Map<string, number>();
  const pakketRows: PakketRow[] = [];

  if (gemeenten.length >= 2) {
    for (let gi = 0; gi < gemeenten.length; gi++) {
      for (const gp of gemeenten[gi].pakketten) {
        const key = gp.pakketversie.pakket.id;
        let rowIdx = pakketIndex.get(key);
        if (rowIdx === undefined) {
          rowIdx = pakketRows.length;
          pakketIndex.set(key, rowIdx);
          pakketRows.push({
            pakketNaam: gp.pakketversie.pakket.naam,
            leverancierNaam: gp.pakketversie.pakket.leverancier.naam,
            pakketSlug: gp.pakketversie.pakket.slug,
            present: new Array(gemeenten.length).fill(false),
            versies: new Array(gemeenten.length).fill(undefined),
          });
        }
        pakketRows[rowIdx].present[gi] = true;
        pakketRows[rowIdx].versies[gi] = gp.pakketversie.naam;
      }
    }
  }

  pakketRows.sort((a, b) => a.pakketNaam.localeCompare(b.pakketNaam));

  // Compute totals per gemeente
  const totals = gemeenten.map((_, gi) =>
    pakketRows.filter((r) => r.present[gi]).length
  );

  // Count how many are shared by all
  const sharedByAll = pakketRows.filter((r) => r.present.every(Boolean)).length;

  return (
    <div className="max-w-6xl">
      <Breadcrumbs items={[
        { label: "Gemeenten", href: "/gemeenten" },
        { label: "Vergelijken", href: "/gemeenten/vergelijk" },
      ]} />

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#1a6ca8]">Gemeenten vergelijken</h1>
        <HelpLink section="vergelijken" label="Help over gemeenten vergelijken" />
      </div>

      <OrganisatieSelector
        organisaties={alleGemeenten}
        selected={selectedIds}
      />

      {!showPortfolio && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm mt-4">
          <p className="text-yellow-800">
            <span className="font-semibold">Inloggen vereist.</span>{" "}
            <Link href="/auth/login?callbackUrl=/gemeenten/vergelijk" className="text-[#1a6ca8] hover:underline">
              Log in
            </Link>{" "}
            om het applicatieportfolio te vergelijken.
          </p>
        </div>
      )}

      {showPortfolio && gemeenten.length >= 2 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{sharedByAll}</div>
              <div className="text-xs text-green-600 font-medium">Gemeenschappelijk</div>
            </div>
            {gemeenten.map((g, i) => (
              <div key={g.id} className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
                <div className="text-2xl font-bold text-[#1a6ca8]">{totals[i]}</div>
                <div className="text-xs text-gray-600 font-medium truncate">{g.naam}</div>
              </div>
            ))}
          </div>

          {/* Progress comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {gemeenten.map((g) => (
              <div key={g.id} className="bg-gray-50 rounded p-4">
                <h3 className="font-semibold text-sm mb-2 truncate">{g.naam}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#1a6ca8] h-2 rounded-full"
                      style={{ width: `${Math.min(g.progress, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-700 whitespace-nowrap">{g.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison matrix table */}
          {pakketRows.length > 0 ? (
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-left">
                    <th scope="col" className="pb-2 pr-4 font-semibold">Pakket</th>
                    <th scope="col" className="pb-2 pr-4 font-semibold hidden sm:table-cell">Leverancier</th>
                    {gemeenten.map((g) => (
                      <th
                        key={g.id}
                        className="pb-2 pr-2 font-semibold text-center whitespace-nowrap"
                      >
                        <span className="truncate inline-block max-w-[120px]" title={g.naam}>
                          {g.naam}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pakketRows.map((p) => {
                    const allPresent = p.present.every(Boolean);
                    return (
                      <tr
                        key={p.pakketSlug}
                        className={`border-b border-gray-100 ${
                          allPresent ? "bg-green-50/50" : ""
                        }`}
                      >
                        <td className="py-2 pr-4">
                          <Link
                            href={`/pakketten/${p.pakketSlug}`}
                            className="text-[#1a6ca8] hover:underline"
                          >
                            {p.pakketNaam}
                          </Link>
                        </td>
                        <td className="py-2 pr-4 text-gray-600 hidden sm:table-cell">
                          {p.leverancierNaam}
                        </td>
                        {p.present.map((has, i) => (
                          <td key={i} className="py-2 pr-2 text-center">
                            {has ? (
                              <span
                                className="inline-block w-6 h-6 rounded bg-green-100 text-green-600 font-bold leading-6"
                                title={p.versies[i]}
                              >
                                ✓
                              </span>
                            ) : (
                              <span className="inline-block w-6 h-6 rounded bg-gray-100 text-gray-300 leading-6">
                                —
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 font-semibold">
                    <td className="py-2 pr-4">Totaal</td>
                    <td className="py-2 pr-4 hidden sm:table-cell"></td>
                    {totals.map((total, i) => (
                      <td key={i} className="py-2 pr-2 text-center text-[#1a6ca8]">
                        {total}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Geen pakketten geregistreerd bij deze gemeenten.
            </p>
          )}
        </>
      )}

      {showPortfolio && filledIds.length < 2 && (
        <p className="text-sm text-gray-500 mt-4">
          Selecteer minimaal twee gemeenten om hun applicatielandschap te vergelijken.
        </p>
      )}
    </div>
  );
}
