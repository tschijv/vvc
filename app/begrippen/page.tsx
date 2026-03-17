import { getBegrippen } from "@/lib/services/begrippen";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Begrippen - Voorzieningencatalogus",
  description: "Begrippenlijst (glossary) van de Voorzieningencatalogus, conform NL-SBB",
};

export default async function BegrippenPage({
  searchParams,
}: {
  searchParams: Promise<{ zoek?: string }>;
}) {
  const params = await searchParams;
  const zoek = params.zoek || "";
  const begrippen = await getBegrippen({ zoek: zoek || undefined });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Begrippen</h1>
          <p className="text-sm text-gray-500 mt-1">
            {begrippen.length} begrippen uit het{" "}
            <a
              href="https://begrippen.noraonline.nl/nl/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1a6ca8] hover:underline"
            >
              NORA begrippenkader
            </a>
            {" "}(NL-SBB)
          </p>
        </div>
        <a
          href="/api/v1/begrippen"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded border border-gray-200"
        >
          JSON export
        </a>
      </div>

      {/* Zoekbalk */}
      <form role="search" method="GET" className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            name="zoek"
            defaultValue={zoek}
            placeholder="Zoek op term of definitie..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-[#1a6ca8] text-white px-5 py-2.5 rounded-lg text-sm hover:bg-[#155a8c] transition-colors"
          >
            Zoeken
          </button>
          {zoek && (
            <Link
              href="/begrippen"
              className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-200"
            >
              Wissen
            </Link>
          )}
        </div>
      </form>

      {begrippen.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            {zoek
              ? `Geen begrippen gevonden voor "${zoek}"`
              : "Nog geen begrippen gesynchroniseerd. Gebruik het admin-panel om begrippen te synchroniseren."}
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-48">Term</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Definitie</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-40">Synoniemen</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-36">Vocabulaire</th>
              </tr>
            </thead>
            <tbody>
              {begrippen.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {b.uri ? (
                      <a
                        href={b.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1a6ca8] hover:underline"
                      >
                        {b.term}
                      </a>
                    ) : (
                      b.term
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{b.definitie}</div>
                    {b.toelichting && (
                      <div className="text-xs text-gray-400 mt-1">{b.toelichting}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {b.synoniemen.length > 0
                      ? b.synoniemen.join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {b.vocab || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
