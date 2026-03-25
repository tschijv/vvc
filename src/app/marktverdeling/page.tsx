import { prisma } from "@/data/prisma";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import MarktverdelingChart from "./MarktverdelingChart";

export const revalidate = 3600; // ISR: regenerate every hour

export const metadata = { title: "Marktverdeling" };

type LeverancierData = {
  id: string;
  naam: string;
  aantalKlanten: number;
  aantalRefcomps: number;
  aantalPakketten: number;
};

async function getMarktverdelingData(): Promise<LeverancierData[]> {
  // Get all leveranciers with their pakketversies, gemeentepakketten and refcomps
  const leveranciers = await prisma.leverancier.findMany({
    select: {
      id: true,
      naam: true,
      pakketten: {
        select: {
          id: true,
          referentiecomponenten: {
            select: { referentiecomponentId: true },
          },
          versies: {
            select: {
              id: true,
              organisatiePakketten: {
                select: { gemeenteId: true },
              },
            },
          },
        },
      },
    },
  });

  return leveranciers
    .map((lev) => {
      const uniqueGemeenten = new Set<string>();
      const uniqueRefcomps = new Set<string>();
      const uniquePakketten = new Set<string>();

      for (const pakket of lev.pakketten) {
        uniquePakketten.add(pakket.id);
        for (const rc of pakket.referentiecomponenten) {
          uniqueRefcomps.add(rc.referentiecomponentId);
        }
        for (const versie of pakket.versies) {
          for (const gp of versie.organisatiePakketten) {
            uniqueGemeenten.add(gp.organisatieId);
          }
        }
      }

      return {
        id: lev.id,
        naam: lev.naam,
        aantalKlanten: uniqueGemeenten.size,
        aantalRefcomps: uniqueRefcomps.size,
        aantalPakketten: uniquePakketten.size,
      };
    })
    .filter((d) => d.aantalKlanten > 0 || d.aantalRefcomps > 0);
}

export default async function MarktverdelingPage() {
  const data = await getMarktverdelingData();

  const totaalLeveranciers = data.length;
  const totaalMetKlanten = data.filter((d) => d.aantalKlanten > 0).length;
  const topLeverancier = data.reduce(
    (max, d) => (d.aantalKlanten > max.aantalKlanten ? d : max),
    data[0] || { naam: "-", aantalKlanten: 0 },
  );

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Marktverdeling", href: "/marktverdeling" }]}
      />
      <h1 className="text-2xl font-semibold text-[#1a6ca8] mb-2">
        Marktverdeling leveranciers
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Scatterplot van leveranciers op basis van marktbereik
        (klanten), functionele breedte (referentiecomponenten) en
        portfoliogrootte (aantal pakketten).
      </p>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">Leveranciers</div>
          <div className="text-2xl font-bold text-[#1a6ca8]">
            {totaalLeveranciers}
          </div>
          <div className="text-xs text-gray-400">
            {totaalMetKlanten} met klanten
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">
            Grootste leverancier
          </div>
          <div className="text-lg font-bold text-[#1a6ca8] truncate">
            {topLeverancier?.naam}
          </div>
          <div className="text-xs text-gray-400">
            {topLeverancier?.aantalKlanten} klanten
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">Legenda</div>
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <p>
              <strong>X-as:</strong> Unieke referentiecomponenten
            </p>
            <p>
              <strong>Y-as:</strong> Aantal klanten (gemeenten)
            </p>
            <p>
              <strong>Bolgrootte:</strong> Aantal pakketten
            </p>
          </div>
        </div>
      </div>

      <MarktverdelingChart data={data} />

      {/* Tabel */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-[#1a6ca8] font-medium hover:underline">
          Toon onderliggende data ({data.length} leveranciers)
        </summary>
        <table className="w-full text-sm border-collapse border border-gray-200 mt-3">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th scope="col" className="py-2 px-3 font-semibold text-gray-700">
                Leverancier
              </th>
              <th scope="col" className="py-2 px-3 font-semibold text-gray-700 text-right">
                Klanten
              </th>
              <th scope="col" className="py-2 px-3 font-semibold text-gray-700 text-right">
                Ref.componenten
              </th>
              <th scope="col" className="py-2 px-3 font-semibold text-gray-700 text-right">
                Pakketten
              </th>
            </tr>
          </thead>
          <tbody>
            {data
              .sort((a, b) => b.aantalKlanten - a.aantalKlanten)
              .map((d) => (
                <tr
                  key={d.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-1.5 px-3">{d.naam}</td>
                  <td className="py-1.5 px-3 text-right">
                    {d.aantalKlanten}
                  </td>
                  <td className="py-1.5 px-3 text-right">
                    {d.aantalRefcomps}
                  </td>
                  <td className="py-1.5 px-3 text-right">
                    {d.aantalPakketten}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
