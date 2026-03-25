/**
 * Live SKOSMOS begrippen service met in-memory cache.
 * Haalt begrippen direct op van één of meerdere SKOSMOS-endpoints.
 *
 * Vocabulaires worden beheerd via de AppSetting tabel in de database.
 * Elke vocabulaire heeft een naam en een SKOSMOS REST API URL.
 *
 * Ondersteunt NL-SBB begrippenkaders (begrippenXL) van elke SKOSMOS-instantie.
 */
import { prisma } from "@/data/prisma";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VocabulaireConfig {
  naam: string;
  apiUrl: string; // SKOSMOS REST API base URL, bijv. https://begrippen.noraonline.nl/rest/v1/basisbegrippen
}

export interface LiveBegrip {
  term: string;
  definitie: string;
  toelichting: string | null;
  scopeNote: string | null;
  uri: string;
  synoniemen: string[];
  vocab: string; // naam van de vocabulaire
  bronUrl: string; // API URL waar dit begrip vandaan komt
}

interface SkosSearchResult {
  uri: string;
  prefLabel: string;
  vocab: string;
}

interface SkosSearchResponse {
  results: SkosSearchResult[];
}

interface SkosLangValue {
  lang: string;
  value: string;
}

interface SkosConceptDetail {
  uri: string;
  prefLabel: string | SkosLangValue;
  altLabel?: string | SkosLangValue | (string | SkosLangValue)[];
  hiddenLabel?: string | SkosLangValue;
  definition?: string | SkosLangValue;
  comment?: string;
  scopeNote?: string | SkosLangValue;
  [key: string]: unknown;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const NORA_BASE = "https://begrippen.noraonline.nl/rest/v1";

const DEFAULT_VOCABULAIRES: VocabulaireConfig[] = [
  { naam: "basisbegrippen", apiUrl: `${NORA_BASE}/basisbegrippen` },
  { naam: "gegevensuitwisseling", apiUrl: `${NORA_BASE}/gegevensuitwisseling` },
  { naam: "toegang", apiUrl: `${NORA_BASE}/toegang` },
];

const SETTING_KEY = "skosmos_vocabulaires";

// ─── Runtime state ──────────────────────────────────────────────────────────

let _vocabsLoaded = false;
let VOCABULAIRES: VocabulaireConfig[] = [...DEFAULT_VOCABULAIRES];

async function loadVocabulairesFromDb(): Promise<VocabulaireConfig[]> {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: SETTING_KEY },
    });
    if (setting && setting.value) {
      const parsed = JSON.parse(setting.value) as VocabulaireConfig[];
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].apiUrl) {
        return parsed;
      }
    }
  } catch {
    // DB niet bereikbaar — gebruik defaults
  }
  return DEFAULT_VOCABULAIRES;
}

async function ensureVocabsLoaded(): Promise<VocabulaireConfig[]> {
  if (!_vocabsLoaded) {
    VOCABULAIRES = await loadVocabulairesFromDb();
    _vocabsLoaded = true;
  }
  return VOCABULAIRES;
}

/**
 * Update de vocabulaires in de database en invalideer de cache.
 */
export async function setVocabulaires(vocabs: VocabulaireConfig[]) {
  const filtered = vocabs.filter((v) => v.naam && v.apiUrl);
  await prisma.appSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(filtered) },
    create: { key: SETTING_KEY, value: JSON.stringify(filtered) },
  });
  VOCABULAIRES = filtered;
  _vocabsLoaded = true;
  invalidateCache();
}

export async function getVocabulaires(): Promise<VocabulaireConfig[]> {
  return ensureVocabsLoaded();
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractValue(
  field: string | SkosLangValue | (string | SkosLangValue)[] | undefined
): string | null {
  if (!field) return null;
  if (typeof field === "string") return field;
  if (Array.isArray(field)) {
    return field
      .map((f) => (typeof f === "string" ? f : f.value))
      .join(", ");
  }
  return field.value || null;
}

function extractArray(
  field: string | SkosLangValue | (string | SkosLangValue)[] | undefined
): string[] {
  if (!field) return [];
  if (typeof field === "string")
    return field.split(",").map((s) => s.trim()).filter(Boolean);
  if (Array.isArray(field))
    return field.map((f) => (typeof f === "string" ? f : f.value));
  return field.value
    ? field.value.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CONCURRENT_LIMIT = 5;
const BATCH_DELAY_MS = 200;
const SEARCH_DELAY_MS = 100;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

async function processBatched<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = CONCURRENT_LIMIT,
  batchDelay = BATCH_DELAY_MS
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    if (i + concurrency < items.length) {
      await delay(batchDelay);
    }
  }
  return results;
}

// ─── In-memory cache ────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 uur

let cachedBegrippen: LiveBegrip[] | null = null;
let cacheTimestamp: number = 0;
let fetchPromise: Promise<LiveBegrip[]> | null = null;

export async function getCacheInfo() {
  const vocabs = await ensureVocabsLoaded();
  return {
    isCached: cachedBegrippen !== null,
    timestamp: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null,
    count: cachedBegrippen?.length || 0,
    ageMinutes: cacheTimestamp
      ? Math.round((Date.now() - cacheTimestamp) / 60000)
      : null,
    vocabulaires: vocabs,
  };
}

export function invalidateCache() {
  cachedBegrippen = null;
  cacheTimestamp = 0;
  fetchPromise = null;
}

// ─── SKOSMOS fetch per vocabulaire ──────────────────────────────────────────

/**
 * Extraheert de SKOSMOS base URL en vocab-id uit een vocabulaire API URL.
 * bijv. "https://begrippen.noraonline.nl/rest/v1/basisbegrippen"
 *   → base: "https://begrippen.noraonline.nl/rest/v1"
 *   → vocabId: "basisbegrippen"
 */
function parseVocabUrl(apiUrl: string): { baseUrl: string; vocabId: string } {
  const url = apiUrl.replace(/\/+$/, ""); // strip trailing slashes
  const lastSlash = url.lastIndexOf("/");
  return {
    baseUrl: url.substring(0, lastSlash),
    vocabId: url.substring(lastSlash + 1),
  };
}

async function fetchVocabulaire(config: VocabulaireConfig): Promise<LiveBegrip[]> {
  const { baseUrl, vocabId } = parseVocabUrl(config.apiUrl);
  const concepts = new Map<string, { uri: string; prefLabel: string }>();

  // Zoek per letter in deze specifieke vocabulaire
  for (const letter of ALPHABET) {
    try {
      const url = `${baseUrl}/${vocabId}/search?query=${letter}*&lang=nl&maxhits=1000`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data: SkosSearchResponse = await res.json();
      for (const result of data.results || []) {
        if (!concepts.has(result.uri)) {
          concepts.set(result.uri, {
            uri: result.uri,
            prefLabel: result.prefLabel,
          });
        }
      }
    } catch {
      // Skip failed queries
    }
    await delay(SEARCH_DELAY_MS);
  }

  // Haal details op in batches
  const begrippen: LiveBegrip[] = [];
  const conceptEntries = Array.from(concepts.entries());

  await processBatched(
    conceptEntries,
    async ([uri, { prefLabel }]) => {
      try {
        const detailUrl = `${baseUrl}/${vocabId}/data?uri=${encodeURIComponent(uri)}&format=application/json`;
        const res = await fetch(detailUrl);
        if (!res.ok) return;

        const data = await res.json();
        let detail: SkosConceptDetail | null = null;

        const graph = data.graph || data["@graph"];
        if (Array.isArray(graph)) {
          detail = graph.find(
            (item: SkosConceptDetail) => item.uri === uri || item["@id"] === uri
          ) as SkosConceptDetail | null;
        }
        if (!detail && (data.uri || data.prefLabel)) {
          detail = data as SkosConceptDetail;
        }

        const term = detail
          ? extractValue(detail.prefLabel) || prefLabel
          : prefLabel;

        const definitie = detail
          ? extractValue(detail.definition || (detail["skos:definition"] as string | SkosLangValue | undefined)) ||
            extractValue(detail["rdfs:comment"] as string | SkosLangValue | undefined) ||
            "(geen definitie)"
          : "(geen definitie)";

        const rawComment = detail
          ? extractValue(detail["rdfs:comment"] as string | SkosLangValue | undefined)
          : null;
        const toelichting =
          rawComment && rawComment !== definitie ? rawComment : null;

        const scopeNote = detail
          ? extractValue(detail.scopeNote || (detail["skos:scopeNote"] as string | SkosLangValue | undefined))
          : null;

        const synoniemen: string[] = [];
        if (detail) {
          synoniemen.push(...extractArray(detail.altLabel));
          const hidden = extractArray(detail.hiddenLabel);
          for (const h of hidden) {
            for (const s of h.split(",").map((x) => x.trim())) {
              if (s && !synoniemen.includes(s)) synoniemen.push(s);
            }
          }
        }

        begrippen.push({
          term,
          definitie,
          toelichting,
          scopeNote,
          uri,
          synoniemen,
          vocab: config.naam,
          bronUrl: config.apiUrl,
        });
      } catch {
        // Skip failed concepts
      }
    },
    CONCURRENT_LIMIT,
    BATCH_DELAY_MS
  );

  return begrippen;
}

async function fetchAllVocabulaires(): Promise<LiveBegrip[]> {
  const vocabs = await ensureVocabsLoaded();
  const allBegrippen: LiveBegrip[] = [];

  // Fetch elke vocabulaire sequentieel (om SKOSMOS niet te overbelasten)
  for (const vocab of vocabs) {
    try {
      const begrippen = await fetchVocabulaire(vocab);
      allBegrippen.push(...begrippen);
    } catch (err) {
      console.error(`Fout bij ophalen vocabulaire ${vocab.naam}:`, err);
    }
  }

  // Deduplicate op URI (eerste wint)
  const seen = new Set<string>();
  const unique = allBegrippen.filter((b) => {
    if (seen.has(b.uri)) return false;
    seen.add(b.uri);
    return true;
  });

  // Sorteer op term
  unique.sort((a, b) =>
    a.term.localeCompare(b.term, "nl", { sensitivity: "base" })
  );

  return unique;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Haal alle begrippen op. Gebruikt in-memory cache (1 uur TTL).
 */
export async function getLiveBegrippen(): Promise<LiveBegrip[]> {
  if (cachedBegrippen && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedBegrippen;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = fetchAllVocabulaires()
    .then((begrippen) => {
      cachedBegrippen = begrippen;
      cacheTimestamp = Date.now();
      fetchPromise = null;
      return begrippen;
    })
    .catch((err) => {
      fetchPromise = null;
      if (cachedBegrippen) return cachedBegrippen;
      console.error("SKOSMOS fetch failed:", err);
      return [];
    });

  return fetchPromise;
}

/**
 * Haal begrippen op voor de glossary (minimale velden).
 */
export async function getLiveBegrippenForGlossary() {
  const begrippen = await getLiveBegrippen();
  return begrippen.map((b) => ({
    term: b.term,
    definitie: b.definitie,
    synoniemen: b.synoniemen,
    uri: b.uri,
  }));
}

/**
 * Zoek in begrippen (case-insensitive).
 */
export async function searchLiveBegrippen(zoek?: string) {
  const begrippen = await getLiveBegrippen();
  if (!zoek) return begrippen;

  const q = zoek.toLowerCase();
  return begrippen.filter(
    (b) =>
      b.term.toLowerCase().includes(q) ||
      b.definitie.toLowerCase().includes(q) ||
      (b.toelichting && b.toelichting.toLowerCase().includes(q))
  );
}

// ─── Pre-fetch bij module load ──────────────────────────────────────────────

if (typeof globalThis !== "undefined") {
  const g = globalThis as unknown as { __begrippenPreFetched?: boolean };
  if (!g.__begrippenPreFetched) {
    g.__begrippenPreFetched = true;
    getLiveBegrippen().catch(() => {
      // Stille fout bij pre-fetch
    });
  }
}
