import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import RdfExplorer from "./RdfExplorer";

const ENDPOINTS = [
  { entity: "Catalogus", path: "/api/v1/catalog" },
  { entity: "Gemeenten", path: "/api/v1/gemeenten" },
  { entity: "Leveranciers", path: "/api/v1/leveranciers" },
  { entity: "Pakketten", path: null },
  { entity: "Referentiecomponenten", path: "/api/v1/referentiecomponenten" },
  { entity: "Standaarden", path: "/api/v1/standaarden" },
  { entity: "Begrippen", path: "/api/v1/begrippen" },
] as const;

const FORMATS = [
  { label: "JSON-LD", param: "jsonld" },
  { label: "Turtle", param: "turtle" },
  { label: "RDF/XML", param: "rdfxml" },
] as const;

const JSON_LD_CONTEXT = {
  "@context": {
    "@vocab": "https://data.overheid.nl/vvc/",
    schema: "https://schema.org/",
    skos: "http://www.w3.org/2004/02/skos/core#",
    dcat: "http://www.w3.org/ns/dcat#",
    dcterms: "http://purl.org/dc/terms/",
    foaf: "http://xmlns.com/foaf/0.1/",
    org: "http://www.w3.org/ns/org#",
    naam: "schema:name",
    beschrijving: "schema:description",
    website: "schema:url",
    leverancier: "schema:provider",
    gemeente: "org:Organization",
    referentiecomponent: "dcat:Resource",
    standaard: "dcterms:Standard",
    begrip: "skos:Concept",
  },
};

export default async function LinkedDataPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Linked Data", href: "/admin/linked-data" },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Linked Data (RDF)</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-2xl">
        De Voorzieningencatalogus publiceert data als Linked Data volgens W3C-standaarden.
        Alle API-endpoints ondersteunen drie RDF-serialisaties: JSON-LD, Turtle en RDF/XML.
        Gebruik de <code className="bg-gray-100 px-1 rounded text-xs">?format=</code> query-parameter
        om het gewenste formaat op te vragen.
      </p>

      {/* Endpoints table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th scope="col" className="text-left px-5 py-3 font-semibold text-gray-700">Entiteit</th>
              <th scope="col" className="text-left px-5 py-3 font-semibold text-gray-700">Endpoint URL</th>
              <th scope="col" className="text-left px-5 py-3 font-semibold text-gray-700">Formaten</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ENDPOINTS.map((ep) => (
              <tr key={ep.entity}>
                <td className="px-5 py-3 font-medium text-gray-800">{ep.entity}</td>
                <td className="px-5 py-3">
                  {ep.path ? (
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-700">
                      {ep.path}
                    </code>
                  ) : (
                    <span className="text-gray-400 text-xs italic">binnenkort beschikbaar</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {ep.path ? (
                    <span className="flex gap-2">
                      {FORMATS.map((f) => (
                        <a
                          key={f.param}
                          href={`${ep.path}?format=${f.param}`}
                          className="text-xs text-[#1a6ca8] hover:underline"
                        >
                          {f.label}
                        </a>
                      ))}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">&mdash;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* JSON-LD @context */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">JSON-LD @context</h2>
        <p className="text-sm text-gray-500 mb-4">
          Alle JSON-LD responses gebruiken onderstaande gedeelde context.
        </p>
        <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
          <code>{JSON.stringify(JSON_LD_CONTEXT, null, 2)}</code>
        </pre>
      </div>

      {/* RDF Explorer */}
      <RdfExplorer />
    </div>
  );
}
