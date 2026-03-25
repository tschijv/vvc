"use client";

import { useState } from "react";

const ENTITIES = [
  { label: "Catalogus", value: "catalog" },
  { label: "Gemeenten", value: "gemeenten" },
  { label: "Leveranciers", value: "leveranciers" },
  { label: "Referentiecomponenten", value: "referentiecomponenten" },
  { label: "Standaarden", value: "standaarden" },
  { label: "Begrippen", value: "begrippen" },
];

const FORMATS = [
  { label: "JSON-LD", value: "jsonld" },
  { label: "Turtle", value: "turtle" },
  { label: "RDF/XML", value: "rdfxml" },
];

export default function RdfExplorer() {
  const [entity, setEntity] = useState("catalog");
  const [format, setFormat] = useState("jsonld");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFetch() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/v1/${entity}?format=${format}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const text = await res.text();
      setResult(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout bij ophalen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">RDF Explorer</h2>

      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entiteit</label>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ENTITIES.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Formaat</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleFetch}
          disabled={loading}
          className="px-4 py-2 bg-[#1a6ca8] text-white text-sm font-medium rounded-md hover:bg-[#155a8a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Laden..." : "Ophalen"}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
          <svg className="animate-spin h-4 w-4 text-[#1a6ca8]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Data ophalen...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
          <code>{result}</code>
        </pre>
      )}
    </div>
  );
}
