import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canViewGemeentePortfolio } from "@/lib/auth-helpers";
import { getGemeenteById } from "@/lib/services/gemeente";
import GemeenteSelector from "./GemeenteSelector";

export const metadata: Metadata = {
  title: "Gemeenten vergelijken",
  description: "Vergelijk het applicatielandschap van twee gemeenten",
};

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function VergelijkPage({ searchParams }: Props) {
  const params = await searchParams;
  const idA = params.a || "";
  const idB = params.b || "";

  const user = await getSessionUser();
  const showPortfolio = canViewGemeentePortfolio(user);

  // Get all gemeenten for the selectors
  const alleGemeenten = await prisma.gemeente.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });

  // Load selected gemeenten if both are specified
  let gemeenteA = null;
  let gemeenteB = null;
  if (idA && idB && showPortfolio) {
    [gemeenteA, gemeenteB] = await Promise.all([
      getGemeenteById(idA),
      getGemeenteById(idB),
    ]);
  }

  // Build comparison data
  type PakketRow = {
    pakketNaam: string;
    leverancierNaam: string;
    pakketSlug: string;
    inA: boolean;
    inB: boolean;
    versieA?: string;
    versieB?: string;
  };

  const pakketMap = new Map<string, PakketRow>();

  if (gemeenteA && gemeenteB && showPortfolio) {
    for (const gp of gemeenteA.pakketten) {
      const key = gp.pakketversie.pakket.id;
      pakketMap.set(key, {
        pakketNaam: gp.pakketversie.pakket.naam,
        leverancierNaam: gp.pakketversie.pakket.leverancier.naam,
        pakketSlug: gp.pakketversie.pakket.slug,
        inA: true,
        inB: false,
        versieA: gp.pakketversie.naam,
      });
    }
    for (const gp of gemeenteB.pakketten) {
      const key = gp.pakketversie.pakket.id;
      const existing = pakketMap.get(key);
      if (existing) {
        existing.inB = true;
        existing.versieB = gp.pakketversie.naam;
      } else {
        pakketMap.set(key, {
          pakketNaam: gp.pakketversie.pakket.naam,
          leverancierNaam: gp.pakketversie.pakket.leverancier.naam,
          pakketSlug: gp.pakketversie.pakket.slug,
          inA: false,
          inB: true,
          versieB: gp.pakketversie.naam,
        });
      }
    }
  }

  const pakketten = Array.from(pakketMap.values()).sort((a, b) =>
    a.pakketNaam.localeCompare(b.pakketNaam)
  );

  const gemeenschappelijk = pakketten.filter((p) => p.inA && p.inB).length;
  const alleenA = pakketten.filter((p) => p.inA && !p.inB).length;
  const alleenB = pakketten.filter((p) => !p.inA && p.inB).length;

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <Link href="/gemeenten" className="text-sm text-[#1a6ca8] hover:underline">
          ← Terug naar gemeenten
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[#1a6ca8] mb-6">Gemeenten vergelijken</h1>

      <GemeenteSelector
        gemeenten={alleGemeenten}
        selectedA={idA}
        selectedB={idB}
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

      {showPortfolio && idA && idB && gemeenteA && gemeenteB && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{gemeenschappelijk}</div>
              <div className="text-xs text-green-600 font-medium">Gemeenschappelijk</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">{alleenA}</div>
              <div className="text-xs text-orange-600 font-medium">Alleen {gemeenteA.naam}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{alleenB}</div>
              <div className="text-xs text-blue-600 font-medium">Alleen {gemeenteB.naam}</div>
            </div>
          </div>

          {/* Progress comparison */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 bg-gray-50 rounded p-4">
              <h3 className="font-semibold text-sm mb-2">{gemeenteA.naam}</h3>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#1a6ca8] h-2 rounded-full" style={{ width: `${Math.min(gemeenteA.progress, 100)}%` }} />
                </div>
                <span className="text-sm text-gray-700 whitespace-nowrap">{gemeenteA.progress}%</span>
              </div>
            </div>
            <div className="flex-1 bg-gray-50 rounded p-4">
              <h3 className="font-semibold text-sm mb-2">{gemeenteB.naam}</h3>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#1a6ca8] h-2 rounded-full" style={{ width: `${Math.min(gemeenteB.progress, 100)}%` }} />
                </div>
                <span className="text-sm text-gray-700 whitespace-nowrap">{gemeenteB.progress}%</span>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          {pakketten.length > 0 ? (
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-left">
                    <th className="pb-2 pr-4 font-semibold">Pakket</th>
                    <th className="pb-2 pr-4 font-semibold hidden sm:table-cell">Leverancier</th>
                    <th className="pb-2 pr-2 font-semibold text-center whitespace-nowrap">
                      {gemeenteA.naam}
                    </th>
                    <th className="pb-2 font-semibold text-center whitespace-nowrap">
                      {gemeenteB.naam}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pakketten.map((p) => (
                    <tr
                      key={p.pakketSlug}
                      className={`border-b border-gray-100 ${
                        p.inA && p.inB
                          ? "bg-green-50/50"
                          : p.inA
                          ? "bg-orange-50/50"
                          : "bg-blue-50/50"
                      }`}
                    >
                      <td className="py-2 pr-4">
                        <Link href={`/pakketten/${p.pakketSlug}`} className="text-[#1a6ca8] hover:underline">
                          {p.pakketNaam}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-gray-600 hidden sm:table-cell">{p.leverancierNaam}</td>
                      <td className="py-2 pr-2 text-center">
                        {p.inA ? (
                          <span className="text-green-600 font-bold" title={p.versieA}>✓</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {p.inB ? (
                          <span className="text-green-600 font-bold" title={p.versieB}>✓</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Geen pakketten geregistreerd bij deze gemeenten.
            </p>
          )}
        </>
      )}

      {showPortfolio && (!idA || !idB) && (
        <p className="text-sm text-gray-500 mt-4">
          Selecteer twee gemeenten om hun applicatielandschap te vergelijken.
        </p>
      )}
    </div>
  );
}
