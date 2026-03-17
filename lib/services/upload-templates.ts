import * as XLSX from "xlsx";

// ─── Leverancier Pakketten Template ─────────────────────────────────────────

const LEVERANCIER_HEADERS = [
  "pakketNaam",
  "pakketBeschrijving",
  "versieNaam",
  "versieStatus",
  "startDistributie",
  "referentiecomponenten",
  "standaarden",
  "applicatiefuncties",
];

const LEVERANCIER_EXAMPLES = [
  {
    pakketNaam: "MijnPakket",
    pakketBeschrijving: "Zaaksysteem voor gemeenten",
    versieNaam: "3.0",
    versieStatus: "In distributie",
    startDistributie: "01-01-2025",
    referentiecomponenten: "Zaakregistratiecomponent;Documentcreatiecomponent",
    standaarden: "StUF-ZKN - 3.10;ZGW APIs - 1.0",
    applicatiefuncties: "Zaakafhandeling;Documentbeheer",
  },
  {
    pakketNaam: "MijnPakket",
    pakketBeschrijving: "Zaaksysteem voor gemeenten",
    versieNaam: "2.5",
    versieStatus: "Uit distributie",
    startDistributie: "15-06-2023",
    referentiecomponenten: "Zaakregistratiecomponent",
    standaarden: "StUF-ZKN - 3.10",
    applicatiefuncties: "Zaakafhandeling",
  },
];

// ─── Gemeente Portfolio Template ────────────────────────────────────────────

const GEMEENTE_HEADERS = [
  "pakketNaam",
  "leverancierNaam",
  "versieNaam",
  "status",
  "datumIngangStatus",
  "technologie",
];

const GEMEENTE_EXAMPLES = [
  {
    pakketNaam: "Zaaksysteem Pro",
    leverancierNaam: "SoftwareBedrijf BV",
    versieNaam: "3.0",
    status: "In gebruik",
    datumIngangStatus: "01-03-2025",
    technologie: "SaaS",
  },
  {
    pakketNaam: "Vergunningen Suite",
    leverancierNaam: "GovTech NL",
    versieNaam: "2.1",
    status: "In gebruik",
    datumIngangStatus: "15-09-2024",
    technologie: "On-premise",
  },
];

// ─── Generate Templates ─────────────────────────────────────────────────────

export type TemplateType = "leverancier-pakketten" | "gemeente-portfolio";
export type TemplateFormat = "csv" | "json" | "xlsx";

export function generateTemplate(
  type: TemplateType,
  format: TemplateFormat
): { buffer: Buffer; contentType: string; filename: string } {
  const headers =
    type === "leverancier-pakketten" ? LEVERANCIER_HEADERS : GEMEENTE_HEADERS;
  const examples =
    type === "leverancier-pakketten" ? LEVERANCIER_EXAMPLES : GEMEENTE_EXAMPLES;

  const filename = `template-${type}`;

  switch (format) {
    case "csv":
      return {
        buffer: generateCsv(headers, examples),
        contentType: "text/csv; charset=utf-8",
        filename: `${filename}.csv`,
      };
    case "json":
      return {
        buffer: Buffer.from(JSON.stringify(examples, null, 2), "utf-8"),
        contentType: "application/json; charset=utf-8",
        filename: `${filename}.json`,
      };
    case "xlsx":
      return {
        buffer: generateXlsx(headers, examples),
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename: `${filename}.xlsx`,
      };
    default:
      throw new Error(`Onbekend formaat: ${format}`);
  }
}

function generateCsv(
  headers: string[],
  examples: Record<string, string>[]
): Buffer {
  const BOM = "\uFEFF";
  const lines = [
    headers.join(";"),
    ...examples.map((row) =>
      headers.map((h) => escapeCell(row[h] || "")).join(";")
    ),
  ];
  return Buffer.from(BOM + lines.join("\r\n"), "utf-8");
}

function escapeCell(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generateXlsx(
  headers: string[],
  examples: Record<string, string>[]
): Buffer {
  const wb = XLSX.utils.book_new();
  const data = [headers, ...examples.map((row) => headers.map((h) => row[h] || ""))];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Bold header row
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) {
      ws[addr].s = { font: { bold: true } };
    }
  }

  // Set column widths
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 20) }));

  XLSX.utils.book_append_sheet(wb, ws, "Data");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.from(buf);
}
