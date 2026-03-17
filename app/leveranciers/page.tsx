import Link from "next/link";
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-blue-700">Leveranciers</h1>
        <p className="text-sm text-gray-600">{totaal} resultaten</p>
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
            <th className="pb-2 pr-4 font-semibold">Naam</th>
            <th className="pb-2 pr-4 font-semibold">Contactpersoon</th>
            <th className="pb-2 pr-4 font-semibold">E-mail</th>
            <th className="pb-2 pr-4 font-semibold">Pakketten</th>
            <th className="pb-2 font-semibold">Addenda</th>
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
