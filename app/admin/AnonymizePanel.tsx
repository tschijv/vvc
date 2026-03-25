"use client";

import { useState } from "react";
import Spinner from "@/components/Spinner";
import ErrorAlert from "@/components/ErrorAlert";

interface AnonymizeResponse {
  success: boolean;
  message: string;
  updated: number;
  total: number;
  timestamp: string;
  error?: string;
  details?: string;
}

export default function AnonymizePanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnonymizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleAnonymize() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setConfirming(false);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/anonymize-gemeenten", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Anonymisatie mislukt");
        if (data.details) setError((prev) => `${prev}: ${data.details}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(
        `Fout bij anonymisatie: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setConfirming(false);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-semibold text-gray-800 whitespace-nowrap">
            Contactgegevens anonimiseren
          </span>
          <span className="text-sm text-gray-500 truncate hidden sm:inline">
            Vervang persoonsgegevens van gemeenten door fictieve data
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {confirming && (
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Annuleren
            </button>
          )}
          <button
            onClick={handleAnonymize}
            disabled={loading}
            className={`px-3 py-1.5 rounded text-white text-sm font-medium whitespace-nowrap ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : confirming
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-[#1a6ca8] hover:bg-[#155a8c]"
            }`}
          >
            {loading ? (
              <Spinner size={14} label="Bezig..." />
            ) : confirming ? (
              "Bevestig anonimiseren"
            ) : (
              "Anonimiseren"
            )}
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} className="mx-5 mb-4" />}

      {result && (
        <div className="px-5 pb-4">
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
            {result.message}
            {" "}({new Date(result.timestamp).toLocaleString("nl-NL")})
          </div>
        </div>
      )}
    </div>
  );
}
