import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { logAudit } from "./audit";

// ─── Types ──────────────────────────────────────────────────────────────────

export type UploadMode = "merge" | "replace";

export interface RowError {
  row: number;
  field?: string;
  message: string;
}

export interface UploadResult {
  success: boolean;
  mode: UploadMode;
  summary: {
    totalRows: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  errors: RowError[];
}

interface LeverancierRow {
  pakketNaam: string;
  pakketBeschrijving?: string;
  versieNaam: string;
  versieStatus?: string;
  startDistributie?: Date | null;
  startOntwikkeling?: Date | null;
  startTest?: Date | null;
  referentiecomponenten?: string[];
  standaarden?: string[];
  applicatiefuncties?: string[];
  /** Original row number (1-indexed, including header). */
  rowNum: number;
}

interface GemeenteRow {
  pakketNaam: string;
  leverancierNaam: string;
  versieNaam: string;
  status?: string;
  datumIngangStatus?: Date | null;
  technologie?: string;
  pakketversieId?: string;
  rowNum: number;
}

// ─── Shared Upload Request Parsing ──────────────────────────────────────────

/** Parse common fields from upload FormData. Shared by both API routes. */
export async function parseUploadRequest(
  request: Request
): Promise<{
  file: File;
  mode: UploadMode;
  orgId: string | null;
}> {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const mode = (formData.get("mode") as string) || "merge";
  const orgId =
    (formData.get("leverancierId") as string) ||
    (formData.get("gemeenteId") as string) ||
    null;

  if (!file) throw new UploadValidationError("Geen bestand geüpload");
  if (mode !== "merge" && mode !== "replace") {
    throw new UploadValidationError("Ongeldige modus. Gebruik 'merge' of 'replace'.");
  }

  return { file, mode: mode as UploadMode, orgId };
}

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

// ─── File Parsing ───────────────────────────────────────────────────────────

export async function parseUploadFile(
  file: File
): Promise<Record<string, string>[]> {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".json")) {
    const text = buffer.toString("utf-8");
    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed) ? parsed : parsed.data;
    if (!Array.isArray(arr)) {
      throw new Error(
        "JSON moet een array zijn, of een object met een 'data' array"
      );
    }
    return arr.map(normalizeRow);
  }

  if (name.endsWith(".csv") || name.endsWith(".tsv")) {
    const text = buffer.toString("utf-8");
    // Try semicolon first (Dutch standard), fallback to comma
    let rows = parseCsv(text, ";");
    if (rows.length > 0 && Object.keys(rows[0]).length <= 1) {
      rows = parseCsv(text, ",");
    }
    return rows.map(normalizeRow);
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
    return rows.map(normalizeRow);
  }

  throw new Error("Onbekend bestandsformaat. Gebruik .json, .csv of .xlsx");
}

function normalizeRow(row: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      normalizeKey(k),
      v == null ? "" : String(v).trim(),
    ])
  );
}

function parseCsv(text: string, delimiter: string): Record<string, string>[] {
  return parse(text, {
    delimiter,
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    bom: true,
  });
}

function normalizeKey(key: string): string {
  return key
    .trim()
    .replace(/\s+/g, "")
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

// ─── Date Parsing ───────────────────────────────────────────────────────────

function parseDate(s: string | undefined): Date | null {
  if (!s || s.trim() === "") return null;
  const iso = new Date(s.trim());
  if (!isNaN(iso.getTime())) return iso;
  const parts = s.trim().split(/[-/]/);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const year = y.length === 2 ? "20" + y : y;
    const date = new Date(parseInt(year), parseInt(m) - 1, parseInt(d));
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

// ─── Slug Generation ────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Leverancier Upload ─────────────────────────────────────────────────────

export async function processLeverancierUpload(
  rows: Record<string, string>[],
  leverancierId: string,
  mode: UploadMode
): Promise<UploadResult> {
  const errors: RowError[] = [];
  const validRows: LeverancierRow[] = [];

  // Validate rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 for 1-indexed + header row

    const pakketNaam = row.pakketnaam || row.pakketNaam || row.pakket || "";
    const versieNaam = row.versienaam || row.versieNaam || row.versie || "";

    if (!pakketNaam) {
      errors.push({ row: rowNum, field: "pakketNaam", message: "Pakketnaam is verplicht" });
      continue;
    }
    if (!versieNaam) {
      errors.push({ row: rowNum, field: "versieNaam", message: "Versienaam is verplicht" });
      continue;
    }

    validRows.push({
      pakketNaam,
      pakketBeschrijving: row.pakketbeschrijving || row.pakketBeschrijving || row.beschrijving || undefined,
      versieNaam,
      versieStatus: row.versiestatus || row.versieStatus || row.status || "Onbekend",
      startDistributie: parseDate(row.startdistributie || row.startDistributie),
      startOntwikkeling: parseDate(row.startontwikkeling || row.startOntwikkeling),
      startTest: parseDate(row.starttest || row.startTest),
      referentiecomponenten: splitSemicolon(row.referentiecomponenten || ""),
      standaarden: splitSemicolon(row.standaarden || ""),
      applicatiefuncties: splitSemicolon(row.applicatiefuncties || ""),
      rowNum,
    });
  }

  if (validRows.length === 0) {
    return emptyResult(mode, rows.length, errors);
  }

  // Batch-fetch all reference data in parallel
  const [allRefcomps, allStandaardversies, allAppfuncties, slugRows] =
    await Promise.all([
      prisma.referentiecomponent.findMany({ select: { id: true, naam: true } }),
      prisma.standaardversie.findMany({
        select: { id: true, naam: true, standaard: { select: { naam: true } } },
      }),
      prisma.applicatiefunctie.findMany({ select: { id: true, naam: true } }),
      prisma.pakket.findMany({ select: { slug: true } }),
    ]);

  const refcompMap = new Map(allRefcomps.map((r) => [r.naam.toLowerCase(), r.id]));

  const standaardMap = new Map<string, string>();
  for (const sv of allStandaardversies) {
    standaardMap.set(`${sv.standaard.naam.toLowerCase()} - ${sv.naam.toLowerCase()}`, sv.id);
    standaardMap.set(sv.naam.toLowerCase(), sv.id);
  }

  const appfunctieMap = new Map(allAppfuncties.map((a) => [a.naam.toLowerCase(), a.id]));
  const existingSlugs = new Set(slugRows.map((p) => p.slug));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  if (mode === "replace") {
    await prisma.$transaction(async (tx) => {
      const pakketten = await tx.pakket.findMany({
        where: { leverancierId },
        select: { id: true, versies: { select: { id: true } } },
      });
      const pakketIds = pakketten.map((p) => p.id);
      const versieIds = pakketten.flatMap((p) => p.versies.map((v) => v.id));

      if (pakketIds.length > 0) {
        await Promise.all([
          tx.pakketReferentiecomponent.deleteMany({ where: { pakketId: { in: pakketIds } } }),
          tx.pakketStandaard.deleteMany({ where: { pakketId: { in: pakketIds } } }),
          tx.pakketApplicatiefunctie.deleteMany({ where: { pakketId: { in: pakketIds } } }),
          tx.pakketTechnologie.deleteMany({ where: { pakketId: { in: pakketIds } } }),
          ...(versieIds.length > 0 ? [tx.gemeentePakket.deleteMany({ where: { pakketversieId: { in: versieIds } } })] : []),
        ]);
        await tx.pakketversie.deleteMany({
          where: { pakketId: { in: pakketIds } },
        });
      }
      await tx.pakket.deleteMany({ where: { leverancierId } });
    });
    // Refresh slug set after deletion
    existingSlugs.clear();
    const remaining = await prisma.pakket.findMany({ select: { slug: true } });
    remaining.forEach((p) => existingSlugs.add(p.slug));
  }

  // Group rows by pakketNaam
  const byPakket = new Map<string, LeverancierRow[]>();
  for (const row of validRows) {
    const key = row.pakketNaam;
    if (!byPakket.has(key)) byPakket.set(key, []);
    byPakket.get(key)!.push(row);
  }

  // Process each pakket
  for (const [pakketNaam, versieRows] of byPakket) {
    let slug = slugify(pakketNaam) || "pakket";
    let uniqueSlug = slug;
    let counter = 1;
    while (existingSlugs.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${counter++}`;
    }

    // Upsert pakket
    let pakket = await prisma.pakket.findFirst({
      where: { leverancierId, naam: pakketNaam },
    });

    if (pakket) {
      const beschrijving = versieRows[0].pakketBeschrijving;
      if (beschrijving) {
        await prisma.pakket.update({
          where: { id: pakket.id },
          data: { beschrijving },
        });
      }
    } else {
      pakket = await prisma.pakket.create({
        data: {
          naam: pakketNaam,
          slug: uniqueSlug,
          beschrijving: versieRows[0].pakketBeschrijving || null,
          leverancierId,
        },
      });
      existingSlugs.add(uniqueSlug);
    }

    // Process versions — use explicit index instead of indexOf
    for (const vRow of versieRows) {
      try {
        let versie = await prisma.pakketversie.findFirst({
          where: { pakketId: pakket.id, naam: vRow.versieNaam },
        });

        if (versie) {
          await prisma.pakketversie.update({
            where: { id: versie.id },
            data: {
              status: vRow.versieStatus || versie.status,
              startDistributie: vRow.startDistributie ?? versie.startDistributie,
              startOntwikkeling: vRow.startOntwikkeling ?? versie.startOntwikkeling,
              startTest: vRow.startTest ?? versie.startTest,
            },
          });
          updated++;
        } else {
          versie = await prisma.pakketversie.create({
            data: {
              naam: vRow.versieNaam,
              status: vRow.versieStatus || "Onbekend",
              pakketId: pakket.id,
              startDistributie: vRow.startDistributie,
              startOntwikkeling: vRow.startOntwikkeling,
              startTest: vRow.startTest,
            },
          });
          created++;
        }

        // Sync relations
        syncRelationErrors(vRow.referentiecomponenten, refcompMap, vRow.rowNum, "referentiecomponenten", errors);
        syncRelationErrors(vRow.standaarden, standaardMap, vRow.rowNum, "standaarden", errors);
        syncRelationErrors(vRow.applicatiefuncties, appfunctieMap, vRow.rowNum, "applicatiefuncties", errors);

        // Upsert referentiecomponenten (now at pakket level)
        if (vRow.referentiecomponenten?.length) {
          for (const rcNaam of vRow.referentiecomponenten) {
            const rcId = refcompMap.get(rcNaam.toLowerCase());
            if (rcId) {
              await prisma.pakketReferentiecomponent.upsert({
                where: {
                  pakketId_referentiecomponentId_type: {
                    pakketId: pakket.id,
                    referentiecomponentId: rcId,
                    type: "leverancier",
                  },
                },
                update: {},
                create: { pakketId: pakket.id, referentiecomponentId: rcId, type: "leverancier" },
              });
            }
          }
        }

        // Upsert standaarden (now at pakket level)
        if (vRow.standaarden?.length) {
          for (const stNaam of vRow.standaarden) {
            const svId = standaardMap.get(stNaam.toLowerCase());
            if (svId) {
              await prisma.pakketStandaard.upsert({
                where: {
                  pakketId_standaardversieId: {
                    pakketId: pakket.id,
                    standaardversieId: svId,
                  },
                },
                update: {},
                create: { pakketId: pakket.id, standaardversieId: svId },
              });
            }
          }
        }

        // Upsert applicatiefuncties (now at pakket level)
        if (vRow.applicatiefuncties?.length) {
          for (const afNaam of vRow.applicatiefuncties) {
            const afId = appfunctieMap.get(afNaam.toLowerCase());
            if (afId) {
              await prisma.pakketApplicatiefunctie.upsert({
                where: {
                  pakketId_applicatiefunctieId: {
                    pakketId: pakket.id,
                    applicatiefunctieId: afId,
                  },
                },
                update: {},
                create: { pakketId: pakket.id, applicatiefunctieId: afId },
              });
            }
          }
        }
      } catch (err) {
        skipped++;
        errors.push({
          row: vRow.rowNum,
          message: `Fout bij verwerken: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }
  }

  return {
    success: true,
    mode,
    summary: { totalRows: rows.length, created, updated, skipped, errors: errors.length },
    errors,
  };
}

// ─── Gemeente Upload ────────────────────────────────────────────────────────

export async function processGemeenteUpload(
  rows: Record<string, string>[],
  gemeenteId: string,
  mode: UploadMode
): Promise<UploadResult> {
  const errors: RowError[] = [];
  const validRows: GemeenteRow[] = [];

  // Collect mentioned leverancier names to scope the query
  const mentionedLeveranciers = new Set<string>();
  for (const row of rows) {
    const naam = (row.leveranciernaam || row.leverancierNaam || row.leverancier || "").toLowerCase();
    if (naam) mentionedLeveranciers.add(naam);
  }

  // Scoped fetch: only leveranciers mentioned in the upload
  const leveranciers = await prisma.leverancier.findMany({
    where: mentionedLeveranciers.size > 0
      ? { naam: { in: [...mentionedLeveranciers], mode: "insensitive" } }
      : { id: "__none__" }, // no leveranciers mentioned → empty result
    select: {
      naam: true,
      pakketten: {
        select: {
          naam: true,
          versies: { select: { id: true, naam: true } },
        },
      },
    },
  });

  // Build lookup: "leverancierNaam|pakketNaam|versieNaam" → pakketversieId
  const lookupMap = new Map<string, string>();
  for (const lev of leveranciers) {
    for (const pak of lev.pakketten) {
      for (const ver of pak.versies) {
        lookupMap.set(`${lev.naam.toLowerCase()}|${pak.naam.toLowerCase()}|${ver.naam.toLowerCase()}`, ver.id);
      }
    }
  }

  // Validate rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const pakketNaam = row.pakketnaam || row.pakketNaam || row.pakket || "";
    const leverancierNaam = row.leveranciernaam || row.leverancierNaam || row.leverancier || "";
    const versieNaam = row.versienaam || row.versieNaam || row.versie || "";

    if (!pakketNaam) {
      errors.push({ row: rowNum, field: "pakketNaam", message: "Pakketnaam is verplicht" });
      continue;
    }
    if (!leverancierNaam) {
      errors.push({ row: rowNum, field: "leverancierNaam", message: "Leveranciernaam is verplicht" });
      continue;
    }
    if (!versieNaam) {
      errors.push({ row: rowNum, field: "versieNaam", message: "Versienaam is verplicht" });
      continue;
    }

    const lookupKey = `${leverancierNaam.toLowerCase()}|${pakketNaam.toLowerCase()}|${versieNaam.toLowerCase()}`;
    const pakketversieId = lookupMap.get(lookupKey);

    if (!pakketversieId) {
      errors.push({
        row: rowNum,
        message: `Pakketversie niet gevonden: ${leverancierNaam} / ${pakketNaam} / ${versieNaam}`,
      });
      continue;
    }

    validRows.push({
      pakketNaam,
      leverancierNaam,
      versieNaam,
      status: row.status || undefined,
      datumIngangStatus: parseDate(row.datumingangstatus || row.datumIngangStatus),
      technologie: row.technologie || undefined,
      pakketversieId,
      rowNum,
    });
  }

  if (validRows.length === 0) {
    return emptyResult(mode, rows.length, errors);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  if (mode === "replace") {
    const existing = await prisma.gemeentePakket.count({ where: { gemeenteId } });
    await prisma.gemeentePakket.deleteMany({ where: { gemeenteId } });
    if (existing > 0) {
      logAudit({
        actie: "portfolio_replace",
        entiteit: "GemeentePakket",
        entiteitId: gemeenteId,
        details: `Portfolio vervangen: ${existing} pakketten verwijderd voor nieuwe import`,
      });
    }
  }

  // Use upsert instead of findUnique + update/create (1 query instead of 2)
  for (const row of validRows) {
    try {
      const where = {
        gemeenteId_pakketversieId: {
          gemeenteId,
          pakketversieId: row.pakketversieId!,
        },
      };

      const existing = await prisma.gemeentePakket.findUnique({ where });

      if (existing) {
        await prisma.gemeentePakket.update({
          where,
          data: {
            status: row.status || existing.status,
            datumIngangStatus: row.datumIngangStatus ?? existing.datumIngangStatus,
            technologie: row.technologie || existing.technologie,
          },
        });
        updated++;
      } else {
        await prisma.gemeentePakket.create({
          data: {
            gemeenteId,
            pakketversieId: row.pakketversieId!,
            status: row.status || null,
            datumIngangStatus: row.datumIngangStatus,
            technologie: row.technologie || null,
          },
        });
        created++;
      }
    } catch (err) {
      skipped++;
      errors.push({
        row: row.rowNum,
        message: `Fout bij verwerken: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  // Audit log voor portfolio-wijzigingen
  if (created > 0 || updated > 0) {
    const parts: string[] = [];
    if (created > 0) parts.push(`${created} toegevoegd`);
    if (updated > 0) parts.push(`${updated} bijgewerkt`);
    logAudit({
      actie: "portfolio_upload",
      entiteit: "GemeentePakket",
      entiteitId: gemeenteId,
      details: `Portfolio-import (${mode}): ${parts.join(", ")}`,
    });
  }

  return {
    success: true,
    mode,
    summary: { totalRows: rows.length, created, updated, skipped, errors: errors.length },
    errors,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function splitSemicolon(s: string): string[] {
  if (!s) return [];
  return s.split(";").map((item) => item.trim()).filter(Boolean);
}

/** Collect lookup-miss errors for relation fields. */
function syncRelationErrors(
  names: string[] | undefined,
  lookupMap: Map<string, string>,
  rowNum: number,
  field: string,
  errors: RowError[]
) {
  if (!names?.length) return;
  for (const name of names) {
    if (!lookupMap.has(name.toLowerCase())) {
      const label = field === "referentiecomponenten"
        ? "Referentiecomponent"
        : field === "standaarden"
          ? "Standaard"
          : "Applicatiefunctie";
      errors.push({ row: rowNum, field, message: `${label} '${name}' niet gevonden` });
    }
  }
}

function emptyResult(mode: UploadMode, totalRows: number, errors: RowError[]): UploadResult {
  return {
    success: errors.length === 0,
    mode,
    summary: { totalRows, created: 0, updated: 0, skipped: 0, errors: errors.length },
    errors,
  };
}
