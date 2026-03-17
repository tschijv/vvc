"use client";

import { useState } from "react";
import Spinner from "@/components/Spinner";
import ErrorAlert from "@/components/ErrorAlert";

interface SyncResponse {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  errors: number;
  timestamp: string;
  error?: string;
  details?: string;
}

export default function BegrippenSyncPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/sync-begrippen", { method: "POST" });
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
          <span className="font-semibold text-gray-800 whitespace-nowrap">Begrippen synchronisatie</span>
          <span className="text-sm text-gray-500 truncate hidden sm:inline">NORA begrippenkader (SKOSMOS, NL-SBB)</span>
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
        <div className="px-5 pb-4 space-y-3">
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
            Synchronisatie voltooid op{" "}
            {new Date(result.timestamp).toLocaleString("nl-NL")}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {result.total}
              </div>
              <div className="text-xs text-gray-500 mt-1">Totaal</div>
            </div>
            <div className="bg-green-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-700">
                {result.created}
              </div>
              <div className="text-xs text-gray-500 mt-1">Nieuw</div>
            </div>
            <div className="bg-blue-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {result.updated}
              </div>
              <div className="text-xs text-gray-500 mt-1">Bijgewerkt</div>
            </div>
            <div className="bg-orange-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-orange-700">
                {result.errors}
              </div>
              <div className="text-xs text-gray-500 mt-1">Fouten</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
