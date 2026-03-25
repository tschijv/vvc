"use client";

import { useState } from "react";

interface GemmaView {
  id: string;
  titel: string;
  domein: string;
}

interface DashboardExportBarProps {
  gemeenteId: string;
  gemeenteNaam: string;
  views: GemmaView[];
  selectedViewId: string;
}

type ExportType = "csv" | "ibd" | "ameff";

export default function DashboardExportBar({
  gemeenteId,
  gemeenteNaam,
  views,
  selectedViewId,
}: DashboardExportBarProps) {
  const [exportType, setExportType] = useState<ExportType>("csv");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;

    // AMEFF vereist een geselecteerde view
    if (exportType === "ameff" && !selectedViewId) {
      alert("Selecteer eerst een view in het dropdown links om een AMEFF-export te maken.");
      return;
    }

    setExporting(true);
    try {
      const params = new URLSearchParams({
        type: exportType,
        gemeenteId,
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
      const filename = filenameMatch?.[1] || `export-${gemeenteNaam}.${exportType === "ameff" ? "xml" : "csv"}`;

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
    </>
  );
}
