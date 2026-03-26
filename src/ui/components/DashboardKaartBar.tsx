"use client";

import { useState, useMemo } from "react";
import KaartViewer from "@/ui/components/KaartViewer";

interface GemmaView {
  id: string;
  titel: string;
  domein: string;
}

interface DashboardKaartBarProps {
  views: GemmaView[];
  organisatieId: string;
  organisatieNaam: string;
}

type ExportType = "ameff" | "csv" | "ibd";

export default function DashboardKaartBar({
  views,
  organisatieId,
  organisatieNaam,
}: DashboardKaartBarProps) {
  const [selectedViewId, setSelectedViewId] = useState<string>("");
  const [showKaart, setShowKaart] = useState(false);
  const [exportType, setExportType] = useState<ExportType>("csv");
  const [exporting, setExporting] = useState(false);

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

  const handleToonKaart = () => {
    if (selectedViewId) {
      setShowKaart(true);
    }
  };

  const handleCloseKaart = () => {
    setShowKaart(false);
  };

  const handleExport = async () => {
    if (exporting) return;

    if (exportType === "ameff" && !selectedViewId) {
      alert(
        "Selecteer eerst een view in het dropdown om een AMEFF-export te maken."
      );
      return;
    }

    setExporting(true);
    try {
      const params = new URLSearchParams({
        type: exportType,
        organisatieId,
      });

      if (exportType === "ameff" && selectedViewId) {
        params.set("viewId", selectedViewId);
      }

      const response = await fetch(`/api/export?${params}`);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Export mislukt (${response.status})`);
      }

      // Bestandsnaam uit Content-Disposition header
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="([^"]+)"/);
      const filename =
        filenameMatch?.[1] ||
        `export-${organisatieNaam}.${exportType === "ameff" ? "xml" : "csv"}`;

      // Download het bestand
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Er ging iets mis bij het exporteren."
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {/* View selector + Toon kaart button */}
      <select
        value={selectedViewId}
        onChange={(e) => {
          setSelectedViewId(e.target.value);
          setShowKaart(false);
        }}
        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white min-w-[320px]"
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
      <button
        onClick={handleToonKaart}
        disabled={!selectedViewId}
        className={`text-white text-sm px-4 py-2 rounded ${
          selectedViewId
            ? "bg-[#1a6ca8] hover:bg-[#155a8c] cursor-pointer"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Toon kaart
      </button>

      {/* Export dropdown + Exporteren button */}
      <select
        value={exportType}
        onChange={(e) => setExportType(e.target.value as ExportType)}
        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white min-w-[220px]"
      >
        <optgroup label="Exports">
          <option value="ameff">AMEFF-export</option>
          <option value="csv">Exporteer pakketoverzicht (csv)</option>
          <option value="ibd">IBD foto (csv)</option>
        </optgroup>
      </select>
      <button
        onClick={handleExport}
        disabled={exporting}
        className={`text-white text-sm px-4 py-2 rounded ${
          exporting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#1a6ca8] hover:bg-[#155a8c] cursor-pointer"
        }`}
      >
        {exporting ? "Exporteren..." : "Exporteren"}
      </button>

      {/* Inline KaartViewer modal */}
      {showKaart && selectedViewId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#1a6ca8]">
                Applicatielandschap {organisatieNaam}
              </h2>
              <button
                onClick={handleCloseKaart}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            {/* Kaart */}
            <div className="flex-1 overflow-hidden p-4">
              <KaartViewer
                viewId={selectedViewId}
                organisatieId={organisatieId}
                organisatieNaam={organisatieNaam}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
