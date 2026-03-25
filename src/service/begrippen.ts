import { prisma } from "@/data/prisma";

const SKOSMOS_API =
  process.env.SKOSMOS_API_URL ||
  "https://begrippen.noraonline.nl/rest/v1";

const VOCABULARIES = ["basisbegrippen", "gegevensuitwisseling", "toegang"];
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

// ─── Types ──────────────────────────────────────────────────────────────────

interface SkosSearchResult {
  uri: string;
  prefLabel: string;
  altLabel?: string;
  lang: string;
  vocab: string;
  localname?: string;
  type?: string[];
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

export interface SyncResult {
  total: number;
  created: number;
  updated: number;
  errors: string[];
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
    return field
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  if (Array.isArray(field))
    return field.map((f) => (typeof f === "string" ? f : f.value));
  return field.value
    ? field.value
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];
}

// ─── Rate limiting ───────────────────────────────────────────────────────────

/** Max concurrent requests to SKOSMOS to avoid overloading the server */
const CONCURRENT_LIMIT = 5;
/** Delay (ms) between batches of concurrent requests */
const BATCH_DELAY_MS = 200;
/** Delay (ms) between individual search queries (a-z) */
const SEARCH_DELAY_MS = 100;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process items in batches with concurrency limit and delay between batches.
 * Respectful to SKOSMOS performance.
 */
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

// ─── SKOSMOS API calls ──────────────────────────────────────────────────────

/**
 * Search SKOSMOS for all concepts by querying each letter of the alphabet.
 * Returns unique concepts across all vocabularies.
 *
 * Uses sequential requests with a small delay between letters to avoid
 * overloading the SKOSMOS server (~26 requests, ~3s total).
 */
export async function fetchAllConceptUris(): Promise<
  Map<string, { uri: string; prefLabel: string; vocab: string }>
> {
  const concepts = new Map<
    string,
    { uri: string; prefLabel: string; vocab: string }
  >();

  for (const letter of ALPHABET) {
    try {
      const url = `${SKOSMOS_API}/search?query=${letter}*&lang=nl&maxhits=500`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data: SkosSearchResponse = await res.json();
      for (const result of data.results || []) {
        if (!concepts.has(result.uri)) {
          concepts.set(result.uri, {
            uri: result.uri,
            prefLabel: result.prefLabel,
            vocab: result.vocab,
          });
        }
      }
    } catch {
      // Skip failed letter queries
    }

    // Kleine pauze tussen letters om SKOSMOS niet te overbelasten
    await delay(SEARCH_DELAY_MS);
  }

  return concepts;
}

/**
 * Fetch detailed concept data from SKOSMOS.
 */
export async function fetchConceptDetail(
  uri: string,
  vocab: string
): Promise<SkosConceptDetail | null> {
  try {
    const url = `${SKOSMOS_API}/${vocab}/data?uri=${encodeURIComponent(uri)}&format=application/json`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();

    // The SKOSMOS data endpoint returns JSON-LD with context.
    // The concept data is in "graph" (or "@graph") array.
    // We need to find the entry matching our URI.
    const graph = data.graph || data["@graph"];
    if (Array.isArray(graph)) {
      const concept = graph.find(
        (item: SkosConceptDetail) => item.uri === uri || item["@id"] === uri
      );
      if (concept) return concept as SkosConceptDetail;
    }

    // Fallback: direct response object
    if (data.uri || data.prefLabel) return data as SkosConceptDetail;

    return null;
  } catch {
    return null;
  }
}

// ─── Sync ───────────────────────────────────────────────────────────────────

/**
 * Synchronize all begrippen from SKOSMOS to the local database.
 */
export async function syncBegrippen(): Promise<SyncResult> {
  const result: SyncResult = {
    total: 0,
    created: 0,
    updated: 0,
    errors: [],
  };

  // 1. Fetch all concept URIs
  const concepts = await fetchAllConceptUris();
  result.total = concepts.size;

  // 2. Fetch details in batches of 5 with 200ms delay between batches
  //    Dit beperkt de belasting op SKOSMOS: max 5 gelijktijdige requests,
  //    ~90 batches × 200ms = ~18s spread i.p.v. ~444 instant requests.
  const conceptEntries = Array.from(concepts.entries());

  await processBatched(
    conceptEntries,
    async ([uri, { prefLabel, vocab }]) => {
      try {
        const detail = await fetchConceptDetail(uri, vocab);

        // SKOSMOS JSON-LD uses both short names (via @context) and full URIs.
        // We check both: e.g. "prefLabel" and "skos:prefLabel"
        const term = detail
          ? extractValue(detail.prefLabel) || prefLabel
          : prefLabel;
        const definitie = detail
          ? extractValue(detail.definition || (detail["skos:definition"] as string | SkosLangValue | undefined)) ||
            extractValue(detail["rdfs:comment"] as string | SkosLangValue | undefined) ||
            "(geen definitie)"
          : "(geen definitie)";

        // rdfs:comment is vaak identiek aan skos:definition;
        // alleen opslaan als toelichting als het verschilt van de definitie
        const rawComment = detail
          ? extractValue(detail["rdfs:comment"] as string | SkosLangValue | undefined)
          : null;
        const toelichting =
          rawComment && rawComment !== definitie ? rawComment : null;

        const scopeNote = detail
          ? extractValue(detail.scopeNote || (detail["skos:scopeNote"] as string | SkosLangValue | undefined))
          : null;

        // Extract synoniemen from altLabel + hiddenLabel
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

        const existing = await prisma.begrip.findUnique({ where: { uri } });

        await prisma.begrip.upsert({
          where: { uri },
          update: {
            term,
            definitie,
            toelichting,
            scopeNote,
            synoniemen,
            vocab,
          },
          create: {
            term,
            definitie,
            toelichting,
            scopeNote,
            uri,
            synoniemen,
            vocab,
          },
        });

        if (existing) {
          result.updated++;
        } else {
          result.created++;
        }
      } catch (err) {
        result.errors.push(
          `${uri}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    },
    CONCURRENT_LIMIT,
    BATCH_DELAY_MS
  );

  return result;
}

// ─── Query functies ─────────────────────────────────────────────────────────

/**
 * Get all begrippen for the client-side glossary (minimal fields).
 */
export async function getAllBegrippenForGlossary() {
  const begrippen = await prisma.begrip.findMany({
    select: {
      term: true,
      definitie: true,
      synoniemen: true,
      uri: true,
    },
    where: { status: "actief" },
  });
  return begrippen.sort((a, b) =>
    a.term.localeCompare(b.term, "nl", { sensitivity: "base" })
  );
}

/**
 * Get all begrippen with full details.
 */
export async function getBegrippen(options?: { zoek?: string }) {
  const where = options?.zoek
    ? {
        OR: [
          { term: { contains: options.zoek, mode: "insensitive" as const } },
          {
            definitie: {
              contains: options.zoek,
              mode: "insensitive" as const,
            },
          },
          {
            toelichting: {
              contains: options.zoek,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const begrippen = await prisma.begrip.findMany({ where });
  return begrippen.sort((a, b) =>
    a.term.localeCompare(b.term, "nl", { sensitivity: "base" })
  );
}

/**
 * Count begrippen.
 */
export async function getBegrippenCount(options?: { zoek?: string }) {
  const where = options?.zoek
    ? {
        OR: [
          { term: { contains: options.zoek, mode: "insensitive" as const } },
          {
            definitie: {
              contains: options.zoek,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  return prisma.begrip.count({ where });
}
