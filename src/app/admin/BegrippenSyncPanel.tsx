"use client";

import { useState, useEffect } from "react";
import Spinner from "@/ui/components/Spinner";
import ErrorAlert from "@/ui/components/ErrorAlert";

interface VocabulaireConfig {
  naam: string;
  apiUrl: string;
}

interface CacheResponse {
  success: boolean;
  count: number;
  timestamp: string;
  error?: string;
}

interface CacheInfo {
  isCached: boolean;
  timestamp: string | null;
  count: number;
  ageMinutes: number | null;
  vocabulaires: VocabulaireConfig[];
}

export default function BegrippenSyncPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CacheResponse | null>(null);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [vocabs, setVocabs] = useState<VocabulaireConfig[]>([]);
  const [newNaam, setNewNaam] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/sync-begrippen")
      .then((res) => res.json())
      .then((data: CacheInfo) => {
        setCacheInfo(data);
        setVocabs(data.vocabulaires || []);
      })
      .catch((err) => console.error("Failed to fetch begrippen sync info:", err));
  }, [result]);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/sync-begrippen", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Cache verversen mislukt");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(`Fout bij verversen: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  function handleAddVocab() {
    const naam = newNaam.trim();
    const url = newUrl.trim();
    if (!naam || !url) return;
    if (vocabs.some((v) => v.naam === naam)) {
      setError(`Vocabulaire "${naam}" bestaat al`);
      return;
    }
    try {
      new URL(url);
    } catch {
      setError("Ongeldige URL. Gebruik een volledige URL (bijv. https://begrippen.noraonline.nl/rest/v1/basisbegrippen)");
      return;
    }
    setVocabs([...vocabs, { naam, apiUrl: url }]);
    setNewNaam("");
    setNewUrl("");
    setError(null);
  }

  function handleRemoveVocab(naam: string) {
    setVocabs(vocabs.filter((v) => v.naam !== naam));
  }

  async function handleSaveVocabs() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sync-begrippen", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocabulaires: vocabs }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Opslaan mislukt");
      } else {
        setCacheInfo(data.cacheInfo);
        setEditing(false);
        setResult({ success: true, count: data.cacheInfo?.count || 0, timestamp: new Date().toISOString() });
      }
    } catch (err) {
      setError(`Fout: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-semibold text-gray-800 whitespace-nowrap">Begrippen (live)</span>
          <span className="text-sm text-gray-500 truncate hidden sm:inline">
            Direct van SKOSMOS begrippenkaders · cache 1 uur
          </span>
          {cacheInfo && cacheInfo.isCached && (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
              {cacheInfo.count} begrippen · {cacheInfo.ageMinutes} min oud
            </span>
          )}
          {cacheInfo && !cacheInfo.isCached && (
            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
              Laden...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setEditing(!editing)}
            className="px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            {editing ? "Annuleren" : "Vocabulaires"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`px-3 py-1.5 rounded text-white text-sm font-medium whitespace-nowrap ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#1a6ca8] hover:bg-[#155a8c]"
            }`}
          >
            {loading ? <Spinner size={14} label="Verversen..." /> : "Cache verversen"}
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} className="mx-5 mb-4" />}

      {/* Vocabulaires weergave */}
      {!editing && cacheInfo && cacheInfo.vocabulaires && (
        <div className="px-5 pb-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-gray-400">Begrippenkaders:</span>
            {cacheInfo.vocabulaires.map((v) => (
              <a
                key={v.naam}
                href={v.apiUrl.replace("/rest/v1/", "/nl/") + "/"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-100"
                title={v.apiUrl}
              >
                {v.naam}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulaires bewerken */}
      {editing && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-3">
            Beheer welke NL-SBB begrippenkaders (SKOSMOS) worden gebruikt.
            Geef per kader een naam en de SKOSMOS REST API URL op.
          </p>

          {/* Bestaande vocabulaires */}
          <div className="space-y-2 mb-3">
            {vocabs.map((v) => (
              <div
                key={v.naam}
                className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2"
              >
                <span className="font-medium text-sm text-gray-800 w-40 flex-shrink-0">{v.naam}</span>
                <span className="text-xs text-gray-500 truncate flex-1" title={v.apiUrl}>
                  {v.apiUrl}
                </span>
                <button
                  onClick={() => handleRemoveVocab(v.naam)}
                  className="text-gray-400 hover:text-red-500 flex-shrink-0 text-lg leading-none"
                  title="Verwijderen"
                >
                  ×
                </button>
              </div>
            ))}
            {vocabs.length === 0 && (
              <p className="text-sm text-gray-400">Geen vocabulaires geconfigureerd</p>
            )}
          </div>

          {/* Nieuw vocabulaire toevoegen */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newNaam}
              onChange={(e) => setNewNaam(e.target.value)}
              placeholder="Naam (bijv. basisbegrippen)"
              className="w-40 flex-shrink-0 text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
            />
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddVocab())}
              placeholder="SKOSMOS API URL (bijv. https://begrippen.noraonline.nl/rest/v1/basisbegrippen)"
              className="flex-1 text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
            />
            <button
              onClick={handleAddVocab}
              disabled={!newNaam.trim() || !newUrl.trim()}
              className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 whitespace-nowrap"
            >
              Toevoegen
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveVocabs}
              disabled={saving}
              className={`px-4 py-1.5 rounded text-sm font-medium text-white ${
                saving ? "bg-gray-400" : "bg-[#1a6ca8] hover:bg-[#155a8c]"
              }`}
            >
              {saving ? <Spinner size={14} label="Opslaan..." /> : "Opslaan & verversen"}
            </button>
            <span className="text-xs text-gray-400">
              Wijzigingen worden opgeslagen in de database
            </span>
          </div>
        </div>
      )}

      {result && (
        <div className="px-5 pb-4">
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
            Cache ververst op{" "}
            {new Date(result.timestamp).toLocaleString("nl-NL")}
            {" · "}
            {result.count} begrippen opgehaald
          </div>
        </div>
      )}
    </div>
  );
}
