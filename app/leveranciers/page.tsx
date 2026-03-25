import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getLeveranciers, getLeverancierCount } from "@/lib/services/leverancier";

interface Props {
  searchParams: Promise<{ zoek?: string; pagina?: string }>;
}

const PER_PAGE = 30;

export default async function LeveranciersPage({ searchParams }: Props) {
  const params = await searchParams;
  const zoek = params.zoek || "";
  const pagina = parseInt(params.pagina || "1");

  const [leveranciers, totaal] = await Promise.all([
    getLeveranciers({
      zoek: zoek || undefined,
      skip: (pagina - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    getLeverancierCount({ zoek: zoek || undefined }),
  ]);

  const aantalPaginas = Math.ceil(totaal / PER_PAGE);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Leveranciers", href: "/leveranciers" }]} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-blue-700">Leveranciers</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">{totaal} resultaten</p>
          <Link
            href="/marktverdeling"
            className="text-sm border px-3 py-1 rounded hover:bg-gray-50 text-[#1a6ca8]"
          >
            Marktverdeling
          </Link>
          <Link
            href={`/api/leveranciers/export?zoek=${zoek}`}
            className="text-sm border px-3 py-1 rounded hover:bg-gray-50"
          >
            Export to CSV
          </Link>
        </div>
      </div>

      <form role="search" method="GET" action="/leveranciers" className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            name="zoek"
            defaultValue={zoek}
            placeholder="Zoek in leveranciers..."
            className="border rounded px-3 py-1.5 text-sm w-72"
          />
          <button
            type="submit"
            className="bg-blue-700 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-800"
          >
            Zoeken
          </button>
          {zoek && (
            <Link href="/leveranciers" className="text-sm text-gray-500 py-1.5 hover:underline">
              Wissen
            </Link>
          )}
        </div>
      </form>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-300 text-left">
            <th scope="col" className="pb-2 pr-4 font-semibold">Naam</th>
            <th scope="col" className="pb-2 pr-4 font-semibold">Contactpersoon</th>
            <th scope="col" className="pb-2 pr-4 font-semibold">E-mail</th>
            <th scope="col" className="pb-2 pr-4 font-semibold">Pakketten</th>
            <th scope="col" className="pb-2 font-semibold">Addenda</th>
          </tr>
        </thead>
        <tbody>
          {leveranciers.map((l) => (
            <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 pr-4">
                <Link href={`/leveranciers/${l.slug}`} className="text-blue-700 hover:underline">
                  {l.naam}
                </Link>
              </td>
              <td className="py-2 pr-4 text-gray-700">{l.contactpersoon || "—"}</td>
              <td className="py-2 pr-4">
                {l.email ? (
                  <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline">
                    {l.email}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="py-2 pr-4 text-gray-600">{l._count.pakketten}</td>
              <td className="py-2 text-gray-600">{l.addenda.length}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {leveranciers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-3" role="img" aria-label="Zoeken">&#x1F50D;</span>
          <p className="font-bold mb-1">Geen resultaten gevonden</p>
          <p className="text-sm text-gray-400">Probeer een andere zoekterm of filter</p>
        </div>
      )}

      {aantalPaginas > 1 && (
        <div className="flex gap-2 mt-4 text-sm">
          {pagina > 1 && (
            <Link
              href={`/leveranciers?zoek=${zoek}&pagina=${pagina - 1}`}
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
              href={`/leveranciers?zoek=${zoek}&pagina=${pagina + 1}`}
              className="px-3 py-1 border rounded hover:bg-gray-50"
            >
              Volgende →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
