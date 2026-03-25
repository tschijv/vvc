"use client";

import { useState, useRef } from "react";
import type { UploadResult } from "@/service/upload";
import Spinner from "@/ui/components/Spinner";
import ErrorAlert from "@/ui/components/ErrorAlert";

interface Props {
  userRole: string;
  userLeverancierId?: string;
  userGemeenteId?: string;
  leveranciers: { id: string; naam: string }[];
  gemeenten: { id: string; naam: string }[];
}

type UploadType = "leverancier-pakketten" | "gemeente-portfolio";

export default function UploadForm({
  userRole,
  userLeverancierId,
  userGemeenteId,
  leveranciers,
  gemeenten,
}: Props) {
  const [uploadType, setUploadType] = useState<UploadType | "">(
    userRole === "LEVERANCIER"
      ? "leverancier-pakketten"
      : userRole === "GEMEENTE"
        ? "gemeente-portfolio"
        : ""
  );
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Derive fileName from file input ref instead of redundant state
  const fileName = fileRef.current?.files?.[0]?.name ?? null;

  const canSelectLeverancier =
    userRole === "ADMIN" || userRole === "LEVERANCIER";
  const canSelectGemeente = userRole === "ADMIN" || userRole === "GEMEENTE";

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Selecteer eerst een bestand.");
      return;
    }
    if (!uploadType) {
      setError("Kies eerst een importtype.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    // Add org ID for admin
    if (userRole === "ADMIN") {
      if (uploadType === "leverancier-pakketten") {
        if (!selectedOrg) {
          setError("Selecteer een leverancier.");
          setLoading(false);
          return;
        }
        formData.append("leverancierId", selectedOrg);
      } else {
        if (!selectedOrg) {
          setError("Selecteer een gemeente.");
          setLoading(false);
          return;
        }
        formData.append("gemeenteId", selectedOrg);
      }
    }

    const endpoint =
      uploadType === "leverancier-pakketten"
        ? "/api/upload/leverancier-pakketten"
        : "/api/upload/gemeente-portfolio";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Upload mislukt";
        setError(data.details ? `${msg}: ${data.details}` : msg);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(
        `Netwerkfout: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Upload type */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          1. Type import
        </h2>
        <div className="flex gap-3">
          {canSelectLeverancier && (
            <label
              className={`flex-1 border rounded-lg p-4 cursor-pointer transition ${
                uploadType === "leverancier-pakketten"
                  ? "border-[#1a6ca8] bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="uploadType"
                value="leverancier-pakketten"
                checked={uploadType === "leverancier-pakketten"}
                onChange={() => {
                  setUploadType("leverancier-pakketten");
                  setSelectedOrg("");
                  setResult(null);
                }}
                className="sr-only"
              />
              <div className="text-sm font-medium text-gray-800">
                Pakketten & versies
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Importeer softwarepakketten met versies, referentiecomponenten en
                standaarden
              </div>
            </label>
          )}
          {canSelectGemeente && (
            <label
              className={`flex-1 border rounded-lg p-4 cursor-pointer transition ${
                uploadType === "gemeente-portfolio"
                  ? "border-[#1a6ca8] bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="uploadType"
                value="gemeente-portfolio"
                checked={uploadType === "gemeente-portfolio"}
                onChange={() => {
                  setUploadType("gemeente-portfolio");
                  setSelectedOrg("");
                  setResult(null);
                }}
                className="sr-only"
              />
              <div className="text-sm font-medium text-gray-800">
                Applicatieportfolio
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Importeer welke pakketten uw gemeente in gebruik heeft
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Step 2: Organization (admin only) */}
      {userRole === "ADMIN" && uploadType && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            2. Organisatie
          </h2>
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full max-w-md"
          >
            <option value="">
              — Selecteer{" "}
              {uploadType === "leverancier-pakketten"
                ? "leverancier"
                : "gemeente"}{" "}
              —
            </option>
            {(uploadType === "leverancier-pakketten"
              ? leveranciers
              : gemeenten
            ).map((org) => (
              <option key={org.id} value={org.id}>
                {org.naam}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 3: File + Mode */}
      {uploadType && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {userRole === "ADMIN" ? "3" : "2"}. Bestand & modus
          </h2>

          <div className="space-y-4">
            {/* File input */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Bestand (CSV, JSON of Excel)
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={() => setResult(null)}
                className="block text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#1a6ca8] file:text-white hover:file:bg-[#155a8c] file:cursor-pointer"
              />
            </div>

            {/* Mode toggle */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Synchronisatiemodus
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("merge")}
                  className={`text-sm px-4 py-2 rounded border transition ${
                    mode === "merge"
                      ? "bg-[#1a6ca8] text-white border-[#1a6ca8]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  Samenvoegen
                </button>
                <button
                  type="button"
                  onClick={() => setMode("replace")}
                  className={`text-sm px-4 py-2 rounded border transition ${
                    mode === "replace"
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  Overschrijven
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {mode === "merge"
                  ? "Bestaande data wordt aangevuld. Niets wordt verwijderd."
                  : "Alle bestaande data wordt vervangen door de inhoud van het bestand."}
              </p>
              {mode === "replace" && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700">
                  ⚠️ Let op: bij overschrijven wordt alle bestaande data van
                  deze{" "}
                  {uploadType === "leverancier-pakketten"
                    ? "leverancier (pakketten, versies en koppelingen)"
                    : "gemeente (applicatieportfolio)"}{" "}
                  verwijderd en vervangen.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload button */}
      {uploadType && fileName && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-[#1a6ca8] text-white text-sm px-6 py-2.5 rounded hover:bg-[#155a8c] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Spinner size={16} label="Bezig met importeren..." />
            ) : (
              "Importeren"
            )}
          </button>
          <span className="text-xs text-gray-400">{fileName}</span>
        </div>
      )}

      {/* Error */}
      {error && <ErrorAlert message={error} />}

      {/* Result */}
      {result && (
        <div
          className={`border rounded-lg p-5 ${
            result.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-3 ${
              result.success ? "text-green-800" : "text-red-800"
            }`}
          >
            {result.success ? "✓ Import geslaagd" : "✗ Import mislukt"}
          </h3>

          <div className="grid grid-cols-5 gap-2 text-center mb-3">
            {[
              { label: "Totaal", value: result.summary.totalRows },
              { label: "Aangemaakt", value: result.summary.created },
              { label: "Bijgewerkt", value: result.summary.updated },
              { label: "Overgeslagen", value: result.summary.skipped },
              { label: "Fouten", value: result.summary.errors },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded p-2 border">
                <div className="text-lg font-bold text-gray-800">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Modus:{" "}
            {result.mode === "merge" ? "Samenvoegen" : "Overschrijven"}
          </p>

          {result.errors.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="text-xs text-gray-600 hover:text-gray-800 underline"
              >
                {showErrors
                  ? "Foutdetails verbergen"
                  : `${result.errors.length} fout(en) tonen`}
              </button>
              {showErrors && (
                <div className="mt-2 max-h-60 overflow-y-auto bg-white border rounded p-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th scope="col" className="py-1 pr-2">Rij</th>
                        <th scope="col" className="py-1 pr-2">Veld</th>
                        <th scope="col" className="py-1">Fout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((err, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-1 pr-2 text-gray-600">
                            {err.row}
                          </td>
                          <td className="py-1 pr-2 text-gray-600">
                            {err.field || "—"}
                          </td>
                          <td className="py-1 text-red-600">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Template downloads */}
      {uploadType && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-gray-600 mb-2">
            Voorbeeldbestanden downloaden
          </h3>
          <div className="flex gap-3">
            {(["csv", "json", "xlsx"] as const).map((fmt) => (
              <a
                key={fmt}
                href={`/api/upload/templates?type=${uploadType}&format=${fmt}`}
                download
                className="text-xs text-[#1a6ca8] hover:underline"
              >
                Template .{fmt} ↓
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
