"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
const KaartViewer = dynamic(() => import("@/components/KaartViewer"), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-lg" />,
});

interface GemmaView {
  id: string;
  objectId: string;
  titel: string;
  domein: string;
  laag: string;
}

interface Gemeente {
  id: string;
  naam: string;
}

interface KaartPageClientProps {
  views: GemmaView[];
  gemeenten: Gemeente[];
  eigenGemeente: Gemeente | null;
  isAdmin: boolean;
}

export default function KaartPageClient({
  views,
  gemeenten,
  eigenGemeente,
  isAdmin,
}: KaartPageClientProps) {
  const [selectedViewId, setSelectedViewId] = useState<string>("");
  const [selectedGemeenteId, setSelectedGemeenteId] = useState<string>(
    eigenGemeente?.id || ""
  );

  // Groepeer views op domein
  const viewsByDomain = useMemo(() => {
    const grouped = new Map<string, GemmaView[]>();
    for (const view of views) {
      const domain = view.domein || "Overig";
      if (!grouped.has(domain)) {
        grouped.set(domain, []);
      }
      grouped.get(domain)!.push(view);
    }
    return grouped;
  }, [views]);

  const selectedGemeente = isAdmin
    ? gemeenten.find((g) => g.id === selectedGemeenteId)
    : eigenGemeente;

  const canGenerate = selectedViewId && selectedGemeenteId;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a6ca8] mb-2">
        GEMMA Applicatielandschap
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Bekijk de softwarepakketten van{" "}
        {selectedGemeente ? selectedGemeente.naam : "een gemeente"} op het GEMMA
        applicatielandschap.
      </p>

      {/* Selectors */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* View selector */}
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            View
          </label>
          <select
            value={selectedViewId}
            onChange={(e) => setSelectedViewId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
          >
            <option value="">Selecteer een view...</option>
            {Array.from(viewsByDomain.entries()).map(([domain, domainViews]) => (
              <optgroup key={domain} label={domain}>
                {domainViews.map((view) => (
                  <option key={view.id} value={view.id}>
                    {view.titel}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Gemeente selector (alleen voor ADMIN) */}
        {isAdmin && (
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gemeente
            </label>
            <select
              value={selectedGemeenteId}
              onChange={(e) => setSelectedGemeenteId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent"
            >
              <option value="">Selecteer een gemeente...</option>
              {gemeenten.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.naam}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Hint als er nog geen views zijn */}
      {views.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 mb-6">
          Er zijn nog geen views gesynchroniseerd. Ga naar{" "}
          <a href="/admin" className="text-[#1a6ca8] hover:underline font-medium">
            Beheer
          </a>{" "}
          en synchroniseer met GEMMA Online om views op te halen.
        </div>
      )}

      {/* Kaart viewer */}
      {canGenerate ? (
        <KaartViewer
          viewId={selectedViewId}
          gemeenteId={selectedGemeenteId}
          gemeenteNaam={selectedGemeente?.naam}
        />
      ) : (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-sm">
            {!selectedViewId && !selectedGemeenteId
              ? "Selecteer een view en gemeente om de kaart te genereren"
              : !selectedViewId
                ? "Selecteer een view"
                : "Selecteer een gemeente"}
          </p>
        </div>
      )}
    </div>
  );
}
