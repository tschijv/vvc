import { prisma } from "@/data/prisma";

const GEMMA_API = "https://www.gemmaonline.nl/api.php";
const GEMMA_MODEL_ID = "2b2b88ba-8efe-46d3-8b40-47af290bc418";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface SmwResult {
  printouts: {
    Label?: string[];
    "Object ID"?: string[];
    Documentation?: string[];
  };
  displaytitle?: string;
}

export interface GemmaItem {
  label: string;
  guid: string;
  beschrijving: string | null;
}

export interface SyncResult {
  type: string;
  gemmaCount: number;
  dbCount: number;
  matched: number;
  alreadyHadGuid: number;
  notFound: number;
  unmatchedNames: string[];
}

interface SwcViewItem {
  name: string;
  guid: string;
  "architecture layer"?: string;
  domain?: string;
  theme?: string;
}

export interface ViewSyncResult {
  type: string;
  gemmaCount: number;
  synced: number;
  created: number;
  updated: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

export async function smwQuery(
  query: string,
  limit = 500
): Promise<Record<string, SmwResult>> {
  const allResults: Record<string, SmwResult> = {};
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      action: "ask",
      query: `${query}|limit=${limit}|offset=${offset}`,
      format: "json",
    });

    const res = await fetch(`${GEMMA_API}?${params}`);
    if (!res.ok) {
      throw new Error(`GEMMA API fout: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const results = data?.query?.results || {};

    for (const [key, value] of Object.entries(results)) {
      allResults[key] = value as SmwResult;
    }

    const continueOffset = data?.["query-continue-offset"];
    if (continueOffset && Object.keys(results).length > 0) {
      offset = continueOffset;
    } else {
      break;
    }
  }

  return allResults;
}

export function extractFromResults(
  results: Record<string, SmwResult>
): GemmaItem[] {
  const items: GemmaItem[] = [];
  for (const [pageName, data] of Object.entries(results)) {
    const printouts = data.printouts || {};
    const label =
      printouts.Label?.[0] || data.displaytitle || pageName.split("/").pop();
    const objectId = printouts["Object ID"]?.[0] || null;
    const documentation = printouts.Documentation?.[0] || null;

    if (label && objectId) {
      items.push({
        label: typeof label === "string" ? label : String(label),
        guid: objectId,
        beschrijving:
          typeof documentation === "string" ? documentation : null,
      });
    }
  }
  return items;
}

export function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9àáâãäåæçèéêëìíîïðñòóôõöùúûüýþÿ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Sync logic ─────────────────────────────────────────────────────────────────

export async function syncReferentiecomponenten(
  gemmaItems: GemmaItem[]
): Promise<SyncResult> {
  const dbRecords = await prisma.referentiecomponent.findMany({
    select: { id: true, naam: true, guid: true, beschrijving: true },
  });

  const gemmaByNorm = new Map<string, GemmaItem>();
  for (const item of gemmaItems) {
    gemmaByNorm.set(normalize(item.label), item);
  }

  let matched = 0;
  let alreadyHadGuid = 0;
  const unmatchedNames: string[] = [];

  for (const rec of dbRecords) {
    if (rec.guid) {
      alreadyHadGuid++;
      continue;
    }
    const gemma = gemmaByNorm.get(normalize(rec.naam));
    if (gemma) {
      await prisma.referentiecomponent.update({
        where: { id: rec.id },
        data: {
          guid: gemma.guid,
          ...(gemma.beschrijving && !rec.beschrijving
            ? { beschrijving: gemma.beschrijving }
            : {}),
        },
      });
      matched++;
    } else {
      unmatchedNames.push(rec.naam);
    }
  }

  return {
    type: "Referentiecomponenten",
    gemmaCount: gemmaItems.length,
    dbCount: dbRecords.length,
    matched,
    alreadyHadGuid,
    notFound: unmatchedNames.length,
    unmatchedNames,
  };
}

export async function syncApplicatiefuncties(
  gemmaItems: GemmaItem[]
): Promise<SyncResult> {
  const dbRecords = await prisma.applicatiefunctie.findMany({
    select: { id: true, naam: true, guid: true, beschrijving: true },
  });

  const gemmaByNorm = new Map<string, GemmaItem>();
  for (const item of gemmaItems) {
    gemmaByNorm.set(normalize(item.label), item);
  }

  let matched = 0;
  let alreadyHadGuid = 0;
  const unmatchedNames: string[] = [];

  for (const rec of dbRecords) {
    if (rec.guid) {
      alreadyHadGuid++;
      continue;
    }
    const gemma = gemmaByNorm.get(normalize(rec.naam));
    if (gemma) {
      await prisma.applicatiefunctie.update({
        where: { id: rec.id },
        data: {
          guid: gemma.guid,
          ...(gemma.beschrijving && !rec.beschrijving
            ? { beschrijving: gemma.beschrijving }
            : {}),
        },
      });
      matched++;
    } else {
      unmatchedNames.push(rec.naam);
    }
  }

  return {
    type: "Applicatiefuncties",
    gemmaCount: gemmaItems.length,
    dbCount: dbRecords.length,
    matched,
    alreadyHadGuid,
    notFound: unmatchedNames.length,
    unmatchedNames,
  };
}

export async function syncStandaarden(
  gemmaItems: GemmaItem[]
): Promise<SyncResult> {
  const dbRecords = await prisma.standaard.findMany({
    select: { id: true, naam: true, guid: true, beschrijving: true },
  });

  const gemmaByNorm = new Map<string, GemmaItem>();
  for (const item of gemmaItems) {
    gemmaByNorm.set(normalize(item.label), item);
  }

  let matched = 0;
  let alreadyHadGuid = 0;
  const unmatchedNames: string[] = [];

  for (const rec of dbRecords) {
    if (rec.guid) {
      alreadyHadGuid++;
      continue;
    }
    const gemma = gemmaByNorm.get(normalize(rec.naam));
    if (gemma) {
      await prisma.standaard.update({
        where: { id: rec.id },
        data: {
          guid: gemma.guid,
          ...(gemma.beschrijving && !rec.beschrijving
            ? { beschrijving: gemma.beschrijving }
            : {}),
        },
      });
      matched++;
    } else {
      unmatchedNames.push(rec.naam);
    }
  }

  return {
    type: "Standaarden",
    gemmaCount: gemmaItems.length,
    dbCount: dbRecords.length,
    matched,
    alreadyHadGuid,
    notFound: unmatchedNames.length,
    unmatchedNames,
  };
}

// ─── Views sync ─────────────────────────────────────────────────────────────────

export async function syncViews(): Promise<ViewSyncResult> {
  const params = new URLSearchParams({
    action: "swcquery",
    output: "list",
    listtopic: "views",
    modelid: GEMMA_MODEL_ID,
    format: "json",
  });

  const res = await fetch(`${GEMMA_API}?${params}`);
  if (!res.ok) {
    throw new Error(
      `GEMMA swcquery API fout: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  const items: SwcViewItem[] =
    data?.views?.item ||
    data?.views ||
    (Array.isArray(data) ? data : []);

  const viewItems = Array.isArray(items) ? items : [items];

  let created = 0;
  let updated = 0;

  for (let i = 0; i < viewItems.length; i++) {
    const view = viewItems[i];
    if (!view.guid || !view.name) continue;

    const existing = await prisma.gemmaView.findUnique({
      where: { objectId: view.guid },
    });

    if (existing) {
      await prisma.gemmaView.update({
        where: { objectId: view.guid },
        data: {
          titel: view.name,
          domein: view.domain || "",
          laag: view["architecture layer"] || "",
          modelId: GEMMA_MODEL_ID,
          volgorde: i,
        },
      });
      updated++;
    } else {
      await prisma.gemmaView.create({
        data: {
          objectId: view.guid,
          titel: view.name,
          domein: view.domain || "",
          laag: view["architecture layer"] || "",
          modelId: GEMMA_MODEL_ID,
          volgorde: i,
          actief: true,
        },
      });
      created++;
    }
  }

  return {
    type: "Views",
    gemmaCount: viewItems.filter((v) => v.guid && v.name).length,
    synced: created + updated,
    created,
    updated,
  };
}

// ─── Full sync ──────────────────────────────────────────────────────────────────

export async function runFullSync(): Promise<{
  results: SyncResult[];
  viewSync: ViewSyncResult;
}> {
  const [rcResults, afResults, asResults, stResults] = await Promise.all([
    smwQuery(
      "[[Categorie:Referentiecomponenten]]|?Label|?Object_ID|?Documentation"
    ),
    smwQuery(
      "[[Categorie:ApplicationFunctions]]|?Label|?Object_ID|?Documentation"
    ),
    smwQuery(
      "[[Categorie:ApplicationServices]]|?Label|?Object_ID|?Documentation"
    ),
    smwQuery(
      "[[Categorie:Standaarden]]|?Label|?Object_ID|?Documentation"
    ),
  ]);

  const rcItems = extractFromResults(rcResults);
  const afItems = extractFromResults(afResults);
  const asItems = extractFromResults(asResults);
  const seenGuids = new Set(afItems.map((i) => i.guid));
  for (const item of asItems) {
    if (!seenGuids.has(item.guid)) {
      afItems.push(item);
      seenGuids.add(item.guid);
    }
  }
  const stItems = extractFromResults(stResults);

  const [rcSync, afSync, stSync, viewSync] = await Promise.all([
    syncReferentiecomponenten(rcItems),
    syncApplicatiefuncties(afItems),
    syncStandaarden(stItems),
    syncViews(),
  ]);

  return {
    results: [rcSync, afSync, stSync],
    viewSync,
  };
}
