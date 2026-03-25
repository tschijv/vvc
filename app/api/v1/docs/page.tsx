import { Metadata } from "next";
import SwaggerUI from "./SwaggerUI";

export const metadata: Metadata = {
  title: "API Documentatie - Voorzieningencatalogus",
  description: "Interactieve API documentatie voor de Voorzieningencatalogus API v1",
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Ontwikkelaarsdocumentatie */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Voorzieningencatalogus API
          <span className="ml-3 text-sm font-normal bg-green-100 text-green-800 px-2 py-0.5 rounded">v1.0.0</span>
          <span className="ml-2 text-sm font-normal bg-blue-100 text-blue-800 px-2 py-0.5 rounded">OAS 3.0</span>
        </h1>
        <p className="text-gray-600 mb-6">
          Publieke API voor de Voorzieningencatalogus van Nederlandse gemeenten.
          Biedt toegang tot gegevens over gemeenten, leveranciers, softwarepakketten,
          referentiecomponenten en standaarden.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Aan de slag */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Aan de slag</h2>
            <pre className="bg-gray-900 text-gray-100 rounded p-3 text-sm overflow-x-auto mb-3">
{`cd ~/claude/vvc
npm install    # Afhankelijkheden installeren
npm run dev    # Server starten op :3000`}
            </pre>
            <p className="text-sm text-gray-500">
              OpenAPI spec (JSON):{" "}
              <a href="/api/v1/openapi" className="text-blue-600 hover:underline font-mono text-xs">/api/v1/openapi</a>
            </p>
          </div>

          {/* Commando's */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Handige commando&apos;s</h2>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Dev server", "npm run dev"],
                  ["Tests draaien", "npx vitest run"],
                  ["Tests (watch)", "npx vitest"],
                  ["DB schema push", "npx prisma db push"],
                  ["DB browser", "npx prisma studio"],
                ].map(([label, cmd]) => (
                  <tr key={cmd} className="border-b border-gray-200 last:border-0">
                    <td className="py-1.5 text-gray-600">{label}</td>
                    <td className="py-1.5 font-mono text-xs text-gray-800">{cmd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Response formaat */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Response formaat</h2>
          <p className="text-sm text-gray-600 mb-3">
            Alle endpoints retourneren JSON met een consistente structuur.
            Gepagineerde endpoints ondersteunen <code className="bg-white px-1 rounded text-xs">?zoek=</code>,{" "}
            <code className="bg-white px-1 rounded text-xs">?offset=</code> en{" "}
            <code className="bg-white px-1 rounded text-xs">?limit=</code> (max 200) parameters.
            Het totaal is ook beschikbaar via de <code className="bg-white px-1 rounded text-xs">X-Total-Count</code> header.
          </p>
          <pre className="bg-gray-900 text-gray-100 rounded p-3 text-sm overflow-x-auto">
{`{
  "data": [ ... ],
  "meta": {
    "total": 389,
    "offset": 0,
    "limit": 50
  }
}`}
          </pre>
        </div>

        <hr className="border-gray-200" />
        <p className="text-sm text-gray-500 mt-4 mb-2">
          Gebruik de interactieve API explorer hieronder om endpoints direct uit te proberen.
        </p>
      </div>

      {/* Swagger UI */}
      <SwaggerUI />
    </div>
  );
}
