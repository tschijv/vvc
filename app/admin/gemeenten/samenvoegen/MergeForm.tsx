"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Gemeente = { id: string; naam: string };
type Preview = {
  bron: { id: string; naam: string };
  doel: { id: string; naam: string };
  users: number;
  pakketten: { totaalBron: number; overlap: number; uniek: number };
  koppelingen: number;
  samenwerkingen: { totaalBron: number; overlap: number; uniek: number };
};

export default function MergeForm({
  gemeenten,
}: {
  gemeenten: Gemeente[];
}) {
  const router = useRouter();
  const [bronId, setBronId] = useState("");
  const [doelId, setDoelId] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadPreview() {
    if (!bronId || !doelId) return;
    setError("");
    setPreview(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/admin/gemeenten/samenvoegen/preview?bronId=${bronId}&doelId=${doelId}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
      setPreview(data);
    } catch {
      setError("Kan preview niet laden.");
    }
    setLoading(false);
  }

  async function handleMerge() {
    setError("");
    setMerging(true);

    try {
      const res = await fetch("/api/admin/gemeenten/samenvoegen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bronGemeenteId: bronId, doelGemeenteId: doelId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setMerging(false);
        return;
      }
      setSuccess(
        `${preview?.bron.naam} is samengevoegd met ${preview?.doel.naam}.`
      );
      setTimeout(() => router.push("/admin"), 2000);
    } catch {
      setError("Er is een fout opgetreden.");
      setMerging(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg">
        <p className="font-semibold">{success}</p>
        <p className="text-sm mt-1 text-green-600">
          U wordt doorgestuurd naar het beheerpaneel...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brongemeente <span className="text-gray-400">(wordt verwijderd)</span>
            </label>
            <select
              value={bronId}
              onChange={(e) => {
                setBronId(e.target.value);
                setPreview(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
            >
              <option value="">Selecteer gemeente...</option>
              {gemeenten
                .filter((g) => g.id !== doelId)
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.naam}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doelgemeente <span className="text-gray-400">(blijft bestaan)</span>
            </label>
            <select
              value={doelId}
              onChange={(e) => {
                setDoelId(e.target.value);
                setPreview(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
            >
              <option value="">Selecteer gemeente...</option>
              {gemeenten
                .filter((g) => g.id !== bronId)
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.naam}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <button
          onClick={loadPreview}
          disabled={!bronId || !doelId || loading}
          className="mt-4 bg-[#1a6ca8] text-white px-4 py-2 rounded font-medium hover:bg-[#155a8c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? "Laden..." : "Preview laden"}
        </button>
      </div>

      {preview && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Samenvatting samenvoeging
          </h2>

          <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 text-sm text-amber-800">
            <strong>{preview.bron.naam}</strong> wordt samengevoegd met{" "}
            <strong>{preview.doel.naam}</strong>. Na de samenvoeging wordt{" "}
            <strong>{preview.bron.naam}</strong> verwijderd.
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th scope="col" className="text-left py-2 text-gray-600 font-medium">
                  Onderdeel
                </th>
                <th scope="col" className="text-right py-2 text-gray-600 font-medium">
                  Verplaatst
                </th>
                <th scope="col" className="text-right py-2 text-gray-600 font-medium">
                  Overlap
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2">Gebruikers</td>
                <td className="py-2 text-right font-mono">
                  {preview.users}
                </td>
                <td className="py-2 text-right text-gray-400">—</td>
              </tr>
              <tr>
                <td className="py-2">Pakketten</td>
                <td className="py-2 text-right font-mono">
                  {preview.pakketten.uniek}
                </td>
                <td className="py-2 text-right font-mono text-amber-600">
                  {preview.pakketten.overlap}
                </td>
              </tr>
              <tr>
                <td className="py-2">Koppelingen</td>
                <td className="py-2 text-right font-mono">
                  {preview.koppelingen}
                </td>
                <td className="py-2 text-right text-gray-400">—</td>
              </tr>
              <tr>
                <td className="py-2">Samenwerkingen</td>
                <td className="py-2 text-right font-mono">
                  {preview.samenwerkingen.uniek}
                </td>
                <td className="py-2 text-right font-mono text-amber-600">
                  {preview.samenwerkingen.overlap}
                </td>
              </tr>
            </tbody>
          </table>

          {preview.pakketten.overlap > 0 && (
            <p className="text-xs text-gray-500 mt-3">
              Bij overlap behoudt de doelgemeente haar bestaande gegevens.
              Dubbele records van de brongemeente worden verwijderd.
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleMerge}
              disabled={merging}
              className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {merging
                ? "Bezig met samenvoegen..."
                : `${preview.bron.naam} samenvoegen met ${preview.doel.naam}`}
            </button>
            <span className="text-xs text-red-500">
              Dit kan niet ongedaan worden gemaakt.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
