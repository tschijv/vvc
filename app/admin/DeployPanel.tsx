"use client";

import { useState } from "react";

export default function DeployPanel() {
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    url?: string;
    output?: string;
    error?: string;
  } | null>(null);

  async function handleDeploy() {
    if (deploying) return;
    if (!confirm("Weet je zeker dat je naar productie wilt deployen?")) return;

    setDeploying(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/deploy", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, error: "Netwerk fout bij deployment" });
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">Deploy naar productie</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Deploy de huidige code naar Vercel productie
          </p>
        </div>
        <button
          onClick={handleDeploy}
          disabled={deploying}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
            deploying
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#1a6ca8] hover:bg-[#15567f]"
          }`}
        >
          {deploying ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Deploying…
            </span>
          ) : (
            "🚀 Deploy"
          )}
        </button>
      </div>

      {result && (
        <div
          className={`mt-3 p-3 rounded-md text-sm ${
            result.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {result.success ? (
            <div>
              <p className="text-green-800 font-medium">
                ✅ Deployment geslaagd!
              </p>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 underline text-xs mt-1 block"
                >
                  {result.url}
                </a>
              )}
            </div>
          ) : (
            <div>
              <p className="text-red-800 font-medium">❌ Deployment mislukt</p>
              {result.error && (
                <p className="text-red-600 text-xs mt-1">{result.error}</p>
              )}
            </div>
          )}
          {result.output && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer">
                Toon output
              </summary>
              <pre className="mt-1 text-xs text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto bg-gray-50 p-2 rounded">
                {result.output}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
