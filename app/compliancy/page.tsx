import { prisma } from "@/lib/prisma";
import Link from "next/link";
import GlossaryHighlighter from "@/components/GlossaryHighlighter";

export const metadata = {
  title: "Compliancy Monitor - Voorzieningencatalogus",
};

export default async function CompliancyMonitorPage() {
  // Haal standaardversies op die in de compliancy monitor staan
  const standaardversies = await prisma.standaardversie.findMany({
    where: {
      compliancyMonitor: true,
    },
    include: {
      standaard: true,
      pakketversies: {
        include: {
          pakketversie: {
            include: {
              pakket: {
                include: { leverancier: true },
              },
            },
          },
        },
        orderBy: {
          pakketversie: {
            pakket: {
              leverancier: { naam: "asc" },
            },
          },
        },
      },
    },
    orderBy: [{ standaard: { naam: "asc" } }, { naam: "asc" }],
  });

  // Groepeer standaardversies op standaard
  const standaardenMap = new Map<
    string,
    {
      standaardNaam: string;
      versies: typeof standaardversies;
    }
  >();

  for (const sv of standaardversies) {
    const key = sv.standaard.naam;
    if (!standaardenMap.has(key)) {
      standaardenMap.set(key, {
        standaardNaam: key,
        versies: [],
      });
    }
    standaardenMap.get(key)!.versies.push(sv);
  }

  const standaarden = Array.from(standaardenMap.values());

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a6ca8] mb-4">
        Compliancy Monitor
      </h1>
      <p className="text-sm text-gray-600 mb-6 max-w-3xl">
        <GlossaryHighlighter>De Compliancy Monitor toont per standaard welke pakketversies compliant zijn. Dit geeft gemeenten inzicht in welke software voldoet aan de verplichte standaarden voor gegevensuitwisseling en dienstverlening.</GlossaryHighlighter>
      </p>

      {standaarden.length === 0 ? (
        <p className="text-sm text-gray-500">
          Er zijn nog geen standaarden geconfigureerd voor de compliancy monitor.
        </p>
      ) : (
        <div className="space-y-8">
          {standaarden.map(({ standaardNaam, versies }) => (
            <div key={standaardNaam}>
              {versies.map((sv) => (
                <div
                  key={sv.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4"
                >
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                    <h2 className="text-base font-semibold text-[#1a6ca8]">
                      {standaardNaam} {sv.naam}
                    </h2>
                    {sv.status && (
                      <span className="text-xs text-gray-500">
                        Status: {sv.status}
                      </span>
                    )}
                  </div>

                  {sv.pakketversies.length === 0 ? (
                    <p className="px-5 py-3 text-sm text-gray-400">
                      Geen pakketversies geregistreerd voor deze standaard.
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left">
                          <th className="px-5 py-2 font-semibold text-gray-600">
                            Leverancier
                          </th>
                          <th className="px-5 py-2 font-semibold text-gray-600">
                            Pakketversie
                          </th>
                          <th className="px-5 py-2 font-semibold text-gray-600">
                            Compliancy
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sv.pakketversies.map((pvs) => {
                          const pv = pvs.pakketversie;
                          const isCompliant = pvs.compliancy === true;
                          const isNotCompliant = pvs.compliancy === false;

                          return (
                            <tr
                              key={pv.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="px-5 py-2">
                                <Link
                                  href={`/leveranciers/${pv.pakket.leverancier.slug}`}
                                  className="text-[#1a6ca8] hover:underline"
                                >
                                  {pv.pakket.leverancier.naam}
                                </Link>
                              </td>
                              <td className="px-5 py-2">
                                <Link
                                  href={`/pakketten/${pv.pakket.slug}`}
                                  className="text-[#1a6ca8] hover:underline"
                                >
                                  {pv.pakket.naam} - {pv.naam}
                                </Link>
                              </td>
                              <td className="px-5 py-2">
                                {isCompliant ? (
                                  <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Ok
                                  </span>
                                ) : isNotCompliant ? (
                                  <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Niet ok
                                  </span>
                                ) : (
                                  <span className="text-gray-400">
                                    Onbekend
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {/* Samenvatting */}
                  {sv.pakketversies.length > 0 && (
                    <div className="px-5 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                      {sv.pakketversies.filter((p) => p.compliancy === true).length} van{" "}
                      {sv.pakketversies.length} compliant
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
