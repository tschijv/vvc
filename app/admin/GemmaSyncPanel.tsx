"use client";

import { useState } from "react";
import Spinner from "@/components/Spinner";
import ErrorAlert from "@/components/ErrorAlert";

interface SyncResult {
  type: string;
  gemmaCount: number;
  dbCount: number;
  matched: number;
  alreadyHadGuid: number;
  notFound: number;
  unmatchedNames: string[];
}

interface ViewSyncResult {
  type: string;
  gemmaCount: number;
  synced: number;
  created: number;
  updated: number;
}

interface SyncResponse {
  success: boolean;
  timestamp: string;
  results: SyncResult[];
  viewSync?: ViewSyncResult;
  error?: string;
  details?: string;
}

export default function GemmaSyncPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/sync-gemma", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Synchronisatie mislukt");
        if (data.details) setError((prev) => `${prev}: ${data.details}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(
        `Fout bij synchronisatie: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-semibold text-gray-800 whitespace-nowrap">GEMMA synchronisatie</span>
          <span className="text-sm text-gray-500 truncate hidden sm:inline">Referentiecomponenten, applicatiefuncties en standaarden</span>
        </div>
        <button
          onClick={handleSync}
          disabled={loading}
          className={`px-3 py-1.5 rounded text-white text-sm font-medium whitespace-nowrap ml-4 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#1a6ca8] hover:bg-[#155a8c]"
          }`}
        >
          {loading ? (
            <Spinner size={14} label="Bezig..." />
          ) : (
            "Synchroniseren"
          )}
        </button>
      </div>

      {error && <ErrorAlert message={error} className="mx-5 mb-4" />}

      {result && (
        <div className="px-5 pb-4 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
            Synchronisatie voltooid op{" "}
            {new Date(result.timestamp).toLocaleString("nl-NL")}
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 border border-gray-200 font-semibold">
                  Type
                </th>
                <th className="text-right p-2 border border-gray-200 font-semibold">
                  GEMMA Online
                </th>
                <th className="text-right p-2 border border-gray-200 font-semibold">
                  Database
                </th>
                <th className="text-right p-2 border border-gray-200 font-semibold">
                  Nieuw gematcht
                </th>
                <th className="text-right p-2 border border-gray-200 font-semibold">
                  Had al GUID
                </th>
                <th className="text-right p-2 border border-gray-200 font-semibold">
                  Niet gevonden
                </th>
              </tr>
            </thead>
            <tbody>
              {result.results.map((r) => (
                <tr key={r.type}>
                  <td className="p-2 border border-gray-200 font-medium">
                    {r.type}
                  </td>
                  <td className="p-2 border border-gray-200 text-right">
                    {r.gemmaCount}
                  </td>
                  <td className="p-2 border border-gray-200 text-right">
                    {r.dbCount}
                  </td>
                  <td className="p-2 border border-gray-200 text-right text-green-700 font-medium">
                    {r.matched}
                  </td>
                  <td className="p-2 border border-gray-200 text-right text-gray-500">
                    {r.alreadyHadGuid}
                  </td>
                  <td className="p-2 border border-gray-200 text-right text-orange-600">
                    {r.notFound}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.viewSync && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              <strong>Views:</strong> {result.viewSync.gemmaCount} views opgehaald van GEMMA Online
              {result.viewSync.created > 0 && `, ${result.viewSync.created} nieuw aangemaakt`}
              {result.viewSync.updated > 0 && `, ${result.viewSync.updated} bijgewerkt`}
            </div>
          )}

          {result.results.some((r) => r.unmatchedNames.length > 0) && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                Niet-gematchte items tonen
              </summary>
              <div className="mt-2 space-y-3">
                {result.results
                  .filter((r) => r.unmatchedNames.length > 0)
                  .map((r) => (
                    <div key={r.type}>
                      <h4 className="font-medium text-gray-700">{r.type}</h4>
                      <ul className="mt-1 list-disc pl-5 text-gray-500">
                        {r.unmatchedNames.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
