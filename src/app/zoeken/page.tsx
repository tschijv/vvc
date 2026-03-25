import { prisma } from "@/data/prisma";
import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";

export const revalidate = 3600; // ISR: regenerate every hour

interface Props {
  searchParams: Promise<{ q?: string; type?: string }>;
}

type ElementType = "pakket" | "leverancier" | "gemeente" | "standaard" | "referentiecomponent" | "begrip";

interface ZoekResultaat {
  type: ElementType;
  naam: string;
  subtitel?: string;
  href: string;
  score: number;
}

const TYPE_CONFIG: Record<
  ElementType,
  { label: string; bg: string; text: string; bgActive: string; textActive: string }
> = {
  pakket: { label: "Pakket", bg: "bg-blue-50", text: "text-blue-700", bgActive: "bg-blue-600", textActive: "text-white" },
  leverancier: { label: "Leverancier", bg: "bg-orange-50", text: "text-orange-700", bgActive: "bg-orange-500", textActive: "text-white" },
  gemeente: { label: "Gemeente", bg: "bg-green-50", text: "text-green-700", bgActive: "bg-green-600", textActive: "text-white" },
  standaard: { label: "Standaard", bg: "bg-purple-50", text: "text-purple-700", bgActive: "bg-purple-600", textActive: "text-white" },
  referentiecomponent: { label: "Ref.component", bg: "bg-teal-50", text: "text-teal-700", bgActive: "bg-teal-600", textActive: "text-white" },
  begrip: { label: "Begrip", bg: "bg-amber-50", text: "text-amber-700", bgActive: "bg-amber-500", textActive: "text-white" },
};

const ALL_TYPES: ElementType[] = ["pakket", "leverancier", "gemeente", "standaard", "referentiecomponent", "begrip"];

/** Parse comma-separated type param into array of valid types */
function parseTypes(typeParam: string | undefined): ElementType[] {
  if (!typeParam) return ALL_TYPES;
  const types = typeParam.split(",").filter((t) => ALL_TYPES.includes(t as ElementType)) as ElementType[];
  return types.length > 0 ? types : ALL_TYPES;
}

/** Build URL toggling a type in/out of the active set (multi-select) */
function buildFilterUrl(q: string, activeTypes: ElementType[], toggleType: ElementType): string {
  const isActive = activeTypes.includes(toggleType);
  const isAll = activeTypes.length === ALL_TYPES.length;

  let newTypes: ElementType[];
  if (isAll) {
    // From "all" → deselect this one (keep the rest)
    newTypes = ALL_TYPES.filter((t) => t !== toggleType);
  } else if (isActive && activeTypes.length === 1) {
    // Deselecting the last one → back to all
    newTypes = ALL_TYPES;
  } else if (isActive) {
    // Remove this type
    newTypes = activeTypes.filter((t) => t !== toggleType);
  } else {
    // Add this type
    newTypes = [...activeTypes, toggleType];
  }

  const isAllSelected = newTypes.length === ALL_TYPES.length;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (!isAllSelected) params.set("type", newTypes.join(","));
  const qs = params.toString();
  return `/zoeken${qs ? `?${qs}` : ""}`;
}

// Fuzzy search helper using pg_trgm similarity
async function fuzzySearch(q: string, typesToSearch: ElementType[]): Promise<ZoekResultaat[]> {
  const resultaten: ZoekResultaat[] = [];

  try {
    await prisma.$queryRaw`SELECT similarity('test', 'test')`;

    const searches = await Promise.all([
      typesToSearch.includes("pakket")
        ? prisma.$queryRaw<{ naam: string; slug: string; leverancier_naam: string; score: number }[]>`
            SELECT p.naam, p.slug, l.naam as leverancier_naam,
              GREATEST(similarity(p.naam, ${q}), similarity(COALESCE(p.beschrijving, ''), ${q}) * 0.7) as score
            FROM "Pakket" p
            JOIN "Leverancier" l ON p."leverancierId" = l.id
            WHERE similarity(p.naam, ${q}) > 0.2
               OR similarity(COALESCE(p.beschrijving, ''), ${q}) > 0.25
               OR p.naam ILIKE ${'%' + q + '%'}
            ORDER BY score DESC
            LIMIT 20`
        : Promise.resolve([]),

      typesToSearch.includes("leverancier")
        ? prisma.$queryRaw<{ naam: string; slug: string; score: number }[]>`
            SELECT naam, slug,
              similarity(naam, ${q}) as score
            FROM "Leverancier"
            WHERE similarity(naam, ${q}) > 0.2 OR naam ILIKE ${'%' + q + '%'}
            ORDER BY score DESC
            LIMIT 10`
        : Promise.resolve([]),

      typesToSearch.includes("gemeente")
        ? prisma.$queryRaw<{ id: string; naam: string; cbs_code: string | null; score: number }[]>`
            SELECT id, naam, "cbsCode" as cbs_code,
              similarity(naam, ${q}) as score
            FROM "Gemeente"
            WHERE similarity(naam, ${q}) > 0.2 OR naam ILIKE ${'%' + q + '%'}
            ORDER BY score DESC
            LIMIT 10`
        : Promise.resolve([]),

      typesToSearch.includes("standaard")
        ? prisma.$queryRaw<{ naam: string; score: number }[]>`
            SELECT naam,
              similarity(naam, ${q}) as score
            FROM "Standaard"
            WHERE similarity(naam, ${q}) > 0.2 OR naam ILIKE ${'%' + q + '%'}
            ORDER BY score DESC
            LIMIT 10`
        : Promise.resolve([]),

      typesToSearch.includes("referentiecomponent")
        ? prisma.$queryRaw<{ naam: string; score: number }[]>`
            SELECT naam,
              similarity(naam, ${q}) as score
            FROM "Referentiecomponent"
            WHERE similarity(naam, ${q}) > 0.2 OR naam ILIKE ${'%' + q + '%'}
            ORDER BY score DESC
            LIMIT 10`
        : Promise.resolve([]),

      typesToSearch.includes("begrip")
        ? prisma.$queryRaw<{ term: string; definitie: string; score: number }[]>`
            SELECT term, definitie,
              GREATEST(similarity(term, ${q}), similarity(COALESCE(definitie, ''), ${q}) * 0.7) as score
            FROM "Begrip"
            WHERE similarity(term, ${q}) > 0.2
               OR similarity(COALESCE(definitie, ''), ${q}) > 0.25
               OR term ILIKE ${'%' + q + '%'}
            ORDER BY score DESC
            LIMIT 10`
        : Promise.resolve([]),
    ]);

    const [pakketten, leveranciers, gemeenten, standaarden, refcomps, begrippen] = searches;

    for (const p of pakketten) {
      resultaten.push({ type: "pakket", naam: p.naam, subtitel: p.leverancier_naam, href: `/pakketten/${p.slug}`, score: Number(p.score) });
    }
    for (const l of leveranciers) {
      resultaten.push({ type: "leverancier", naam: l.naam, href: `/leveranciers/${l.slug}`, score: Number(l.score) });
    }
    for (const g of gemeenten) {
      resultaten.push({ type: "gemeente", naam: g.naam, subtitel: g.cbs_code ? `CBS ${g.cbs_code}` : undefined, href: `/gemeenten/${g.id}`, score: Number(g.score) });
    }
    for (const s of standaarden) {
      resultaten.push({ type: "standaard", naam: s.naam, href: `/standaarden`, score: Number(s.score) });
    }
    for (const r of refcomps) {
      resultaten.push({ type: "referentiecomponent", naam: r.naam, href: `/referentiecomponenten`, score: Number(r.score) });
    }
    for (const b of begrippen) {
      resultaten.push({
        type: "begrip",
        naam: b.term,
        subtitel: b.definitie.length > 80 ? b.definitie.slice(0, 80) + "…" : b.definitie,
        href: `/begrippen?zoek=${encodeURIComponent(b.term)}`,
        score: Number(b.score),
      });
    }

    resultaten.sort((a, b) => b.score - a.score);

  } catch {
    return fallbackSearch(q, typesToSearch);
  }

  return resultaten;
}

// Fallback: ILIKE-based search
async function fallbackSearch(q: string, typesToSearch: ElementType[]): Promise<ZoekResultaat[]> {
  const resultaten: ZoekResultaat[] = [];

  const searches = await Promise.all([
    typesToSearch.includes("pakket")
      ? prisma.pakket.findMany({
          where: { OR: [{ naam: { contains: q, mode: "insensitive" } }, { beschrijving: { contains: q, mode: "insensitive" } }] },
          include: { leverancier: true },
          take: 20,
          orderBy: { naam: "asc" },
        })
      : [],
    typesToSearch.includes("leverancier")
      ? prisma.leverancier.findMany({ where: { naam: { contains: q, mode: "insensitive" } }, take: 10, orderBy: { naam: "asc" } })
      : [],
    typesToSearch.includes("gemeente")
      ? prisma.organisatie.findMany({ where: { naam: { contains: q, mode: "insensitive" } }, take: 10, orderBy: { naam: "asc" } })
      : [],
    typesToSearch.includes("standaard")
      ? prisma.standaard.findMany({ where: { naam: { contains: q, mode: "insensitive" } }, take: 10, orderBy: { naam: "asc" } })
      : [],
    typesToSearch.includes("referentiecomponent")
      ? prisma.referentiecomponent.findMany({ where: { naam: { contains: q, mode: "insensitive" } }, take: 10, orderBy: { naam: "asc" } })
      : [],
    typesToSearch.includes("begrip")
      ? prisma.begrip.findMany({
          where: { OR: [{ term: { contains: q, mode: "insensitive" } }, { definitie: { contains: q, mode: "insensitive" } }] },
          take: 10,
          orderBy: { term: "asc" },
        })
      : [],
  ]);

  const [pakketten, leveranciers, gemeenten, standaarden, refcomps, begrippen] = searches;

  for (const p of pakketten as any[]) {
    resultaten.push({ type: "pakket", naam: p.naam, subtitel: p.leverancier.naam, href: `/pakketten/${p.slug}`, score: 1 });
  }
  for (const l of leveranciers as any[]) {
    resultaten.push({ type: "leverancier", naam: l.naam, href: `/leveranciers/${l.slug}`, score: 1 });
  }
  for (const g of gemeenten as any[]) {
    resultaten.push({ type: "gemeente", naam: g.naam, subtitel: g.cbsCode ? `CBS ${g.cbsCode}` : undefined, href: `/gemeenten/${g.id}`, score: 1 });
  }
  for (const s of standaarden as any[]) {
    resultaten.push({ type: "standaard", naam: s.naam, href: `/standaarden`, score: 1 });
  }
  for (const r of refcomps as any[]) {
    resultaten.push({ type: "referentiecomponent", naam: r.naam, href: `/referentiecomponenten`, score: 1 });
  }
  for (const b of begrippen as any[]) {
    resultaten.push({
      type: "begrip",
      naam: b.term,
      subtitel: b.definitie.length > 80 ? b.definitie.slice(0, 80) + "…" : b.definitie,
      href: `/begrippen?zoek=${encodeURIComponent(b.term)}`,
      score: 1,
    });
  }

  return resultaten;
}

export default async function ZoekenPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const activeTypes = parseTypes(params.type);
  const isAllSelected = activeTypes.length === ALL_TYPES.length;

  // Always search all types for counts, then filter for display
  const alleResultaten = q ? await fuzzySearch(q, ALL_TYPES) : [];

  // Count per type for badges (from all results)
  const countPerType: Partial<Record<ElementType, number>> = {};
  for (const r of alleResultaten) {
    countPerType[r.type] = (countPerType[r.type] || 0) + 1;
  }

  // Filter for display
  const resultaten = isAllSelected
    ? alleResultaten
    : alleResultaten.filter((r) => activeTypes.includes(r.type));

  return (
    <div className="max-w-3xl">
      <Breadcrumbs items={[{ label: "Zoeken", href: "/zoeken" }]} />
      <h1 className="text-2xl font-bold text-[#1a6ca8] mb-4">Zoeken</h1>

      <form role="search" method="GET" action="/zoeken" className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Zoek in pakketten, leveranciers, gemeenten, standaarden, begrippen..."
            autoFocus
            className="border rounded px-3 py-2 text-sm flex-1"
          />
          {!isAllSelected && <input type="hidden" name="type" value={activeTypes.join(",")} />}
          <button
            type="submit"
            className="bg-[#1a6ca8] text-white text-sm px-5 py-2 rounded hover:bg-[#155a8a]"
          >
            Zoeken
          </button>
        </div>
        {q && (
          <p className="text-xs text-gray-500 mt-1">
            Fuzzy search: ook resultaten bij typefouten
          </p>
        )}
      </form>

      {/* Type filter chips — multi-select */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <Link
          href={`/zoeken${q ? `?q=${encodeURIComponent(q)}` : ""}`}
          className={`text-xs font-medium px-3 py-1 rounded-full border transition ${
            isAllSelected
              ? "bg-[#1a6ca8] text-white border-[#1a6ca8]"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
          }`}
        >
          Alles
        </Link>
        {ALL_TYPES.map((t) => {
          const config = TYPE_CONFIG[t];
          const isActive = activeTypes.includes(t);
          const count = countPerType[t];
          return (
            <Link
              key={t}
              href={buildFilterUrl(q, activeTypes, t)}
              className={`text-xs font-medium px-3 py-1 rounded-full border transition inline-flex items-center gap-1 ${
                isActive
                  ? `${config.bgActive} ${config.textActive} border-transparent`
                  : `${config.bg} ${config.text} border-gray-200 hover:border-gray-400`
              }`}
            >
              {config.label}
              {q && count !== undefined && (
                <span className={`text-[10px] font-normal ${isActive ? "opacity-80" : "opacity-60"}`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {q && (
        <p className="text-sm text-gray-500 mb-4">
          {resultaten.length} resultaten voor &ldquo;{q}&rdquo;
          {!isAllSelected && (
            <span>
              {" "}
              (filter: <strong>{activeTypes.map((t) => TYPE_CONFIG[t]?.label).join(", ")}</strong>)
            </span>
          )}
        </p>
      )}

      {resultaten.length > 0 && (
        <div className="space-y-1">
          {resultaten.map((r, i) => {
            const config = TYPE_CONFIG[r.type];
            return (
              <div
                key={`${r.type}-${i}`}
                className="flex items-center gap-3 border-b border-gray-100 py-2.5 hover:bg-gray-50 px-2 -mx-2 rounded"
              >
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${config.bg} ${config.text} whitespace-nowrap min-w-[90px] text-center`}
                >
                  {config.label}
                </span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={r.href}
                    className="text-[#1a6ca8] hover:underline font-medium text-sm"
                  >
                    {r.naam}
                  </Link>
                  {r.subtitel && (
                    <span className="text-gray-500 text-sm ml-2">
                      — {r.subtitel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {q && resultaten.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Geen resultaten gevonden.
        </p>
      )}
    </div>
  );
}
