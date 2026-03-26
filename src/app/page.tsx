import Link from "next/link";
import { prisma } from "@/data/prisma";
import { getSessionUser, canEditPagina } from "@/process/auth-helpers";
import GlossaryHighlighter from "@/ui/components/GlossaryHighlighter";
import { unstable_cache } from "next/cache";

export const revalidate = 3600; // ISR: regenerate every hour

const getHomepageStats = unstable_cache(
  async () => {
    const [aantalPakketten, aantalPakketversies, aantalLeveranciers, aantalOrganisaties, aantalStandaarden, aantalRefComps, aantalAddenda, aantalAppFuncties, gemeentenVoortgang] = await Promise.all([
      prisma.pakket.count(),
      prisma.pakketversie.count(),
      prisma.leverancier.count(),
      prisma.organisatie.count(),
      prisma.standaard.count(),
      prisma.referentiecomponent.count(),
      prisma.leverancierAddendum.count(),
      prisma.applicatiefunctie.count(),
      prisma.organisatie.findMany({ select: { progress: true } }),
    ]);
    return { aantalPakketten, aantalPakketversies, aantalLeveranciers, aantalOrganisaties, aantalStandaarden, aantalRefComps, aantalAddenda, aantalAppFuncties, gemeentenVoortgang };
  },
  ["homepage-stats"],
  { revalidate: 300 }, // 5 minutes
);

// SVG icons matching the live voorzieningencatalogus
function IconMijnCatalogus() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <circle cx="25" cy="25" r="22" stroke="#e35b10" strokeWidth="2" />
      <path d="M15 35 Q25 10 35 35" stroke="#e35b10" strokeWidth="2.5" fill="none" />
      <circle cx="25" cy="28" r="4" fill="#e35b10" />
    </svg>
  );
}
function IconInkoop() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <rect x="10" y="8" width="30" height="36" rx="2" stroke="#e35b10" strokeWidth="2" />
      <line x1="16" y1="18" x2="34" y2="18" stroke="#e35b10" strokeWidth="2" />
      <line x1="16" y1="25" x2="34" y2="25" stroke="#e35b10" strokeWidth="2" />
      <line x1="16" y1="32" x2="26" y2="32" stroke="#e35b10" strokeWidth="2" />
    </svg>
  );
}
function IconCompliancy() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <circle cx="25" cy="25" r="20" stroke="#e35b10" strokeWidth="2" />
      <path d="M14 25 L22 33 L36 17" stroke="#e35b10" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPakketten() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <rect x="10" y="16" width="30" height="24" rx="2" stroke="#1a6ca8" strokeWidth="2" />
      <path d="M10 24 L25 30 L40 24" stroke="#1a6ca8" strokeWidth="2" />
      <path d="M25 16 L25 44" stroke="#1a6ca8" strokeWidth="2" />
      <path d="M18 12 L25 16 L32 12" stroke="#1a6ca8" strokeWidth="2" />
    </svg>
  );
}
function IconPakketversies() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <rect x="10" y="16" width="30" height="24" rx="2" stroke="#1a6ca8" strokeWidth="2" />
      <path d="M10 24 L25 30 L40 24" stroke="#1a6ca8" strokeWidth="2" />
      <path d="M25 16 L25 44" stroke="#1a6ca8" strokeWidth="2" />
      <path d="M18 12 L25 16 L32 12" stroke="#1a6ca8" strokeWidth="2" />
      <circle cx="38" cy="12" r="6" fill="#1a6ca8" />
      <text x="38" y="15" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">V</text>
    </svg>
  );
}
function IconLeveranciers() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <rect x="4" y="18" width="28" height="20" rx="2" stroke="#1a6ca8" strokeWidth="2" />
      <path d="M32 24 L46 24 L46 38 L32 38" stroke="#1a6ca8" strokeWidth="2" />
      <circle cx="13" cy="40" r="4" stroke="#1a6ca8" strokeWidth="2" />
      <circle cx="37" cy="40" r="4" stroke="#1a6ca8" strokeWidth="2" />
      <path d="M32 28 L40 28" stroke="#1a6ca8" strokeWidth="2" />
    </svg>
  );
}
function IconGemeenten() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <rect x="14" y="20" width="22" height="22" stroke="#1a6ca8" strokeWidth="2" />
      <path d="M8 24 L25 10 L42 24" stroke="#1a6ca8" strokeWidth="2" />
      <rect x="20" y="32" width="10" height="10" stroke="#1a6ca8" strokeWidth="1.5" />
    </svg>
  );
}
function IconStandaarden() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <circle cx="25" cy="25" r="10" stroke="#1a6ca8" strokeWidth="2" />
      <circle cx="25" cy="25" r="20" stroke="#1a6ca8" strokeWidth="2" />
      <line x1="25" y1="5" x2="25" y2="15" stroke="#1a6ca8" strokeWidth="2" />
      <line x1="25" y1="35" x2="25" y2="45" stroke="#1a6ca8" strokeWidth="2" />
      <line x1="5" y1="25" x2="15" y2="25" stroke="#1a6ca8" strokeWidth="2" />
      <line x1="35" y1="25" x2="45" y2="25" stroke="#1a6ca8" strokeWidth="2" />
    </svg>
  );
}
function IconReferentie() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <rect x="20" y="4" width="10" height="10" rx="1" stroke="#1a6ca8" strokeWidth="2" />
      <rect x="4" y="36" width="10" height="10" rx="1" stroke="#1a6ca8" strokeWidth="2" />
      <rect x="20" y="36" width="10" height="10" rx="1" stroke="#1a6ca8" strokeWidth="2" />
      <rect x="36" y="36" width="10" height="10" rx="1" stroke="#1a6ca8" strokeWidth="2" />
      <line x1="25" y1="14" x2="25" y2="30" stroke="#1a6ca8" strokeWidth="2" />
      <line x1="9" y1="30" x2="41" y2="30" stroke="#1a6ca8" strokeWidth="2" />
      <line x1="9" y1="30" x2="9" y2="36" stroke="#1a6ca8" strokeWidth="2" />
      <line x1="41" y1="30" x2="41" y2="36" stroke="#1a6ca8" strokeWidth="2" />
    </svg>
  );
}
function IconApplicatiefuncties() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <rect x="8" y="8" width="34" height="34" rx="3" stroke="#1a6ca8" strokeWidth="2" />
      <path d="M16 18 L22 24 L16 30" stroke="#1a6ca8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="26" y1="30" x2="36" y2="30" stroke="#1a6ca8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconAddenda() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <rect x="8" y="6" width="24" height="32" rx="2" stroke="#1a6ca8" strokeWidth="2" />
      <rect x="18" y="12" width="24" height="32" rx="2" stroke="#1a6ca8" strokeWidth="2" />
      <line x1="24" y1="22" x2="36" y2="22" stroke="#1a6ca8" strokeWidth="2" />
      <line x1="24" y1="28" x2="36" y2="28" stroke="#1a6ca8" strokeWidth="2" />
      <line x1="24" y1="34" x2="32" y2="34" stroke="#1a6ca8" strokeWidth="2" />
    </svg>
  );
}
function IconZoeken() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <circle cx="22" cy="22" r="14" stroke="#1a6ca8" strokeWidth="2.5" />
      <line x1="32" y1="32" x2="44" y2="44" stroke="#1a6ca8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
function IconDienstverleners() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <circle cx="20" cy="16" r="6" stroke="#059669" strokeWidth="2" />
      <path d="M10 34 C10 28 14 24 20 24 C26 24 30 28 30 34" stroke="#059669" strokeWidth="2" />
      <circle cx="35" cy="18" r="5" stroke="#059669" strokeWidth="2" />
      <path d="M28 34 C28 29 31 26 35 26 C39 26 42 29 42 34" stroke="#059669" strokeWidth="2" />
    </svg>
  );
}
function IconCloudProviders() {
  return (
    <svg viewBox="0 0 50 50" className="w-10 h-10" fill="none">
      <path d="M14 34 C6 34 6 24 14 22 C14 14 24 10 30 16 C36 12 46 16 44 24 C50 26 50 34 44 34 Z" stroke="#059669" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 28 L25 32 L32 24" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-5 h-5 ${i <= count ? "text-[#1a6ca8]" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function tijdGeleden(date: Date): string {
  const nu = new Date();
  const diff = nu.getTime() - date.getTime();
  const seconden = Math.floor(diff / 1000);
  const minuten = Math.floor(seconden / 60);
  const uren = Math.floor(minuten / 60);
  const dagen = Math.floor(uren / 24);
  const weken = Math.floor(dagen / 7);

  if (seconden < 60) return "zojuist";
  if (minuten < 60) return `${minuten} ${minuten === 1 ? "minuut" : "minuten"} geleden`;
  if (uren < 24) return `${uren} ${uren === 1 ? "uur" : "uur"} geleden`;
  if (dagen < 7) return `${dagen} ${dagen === 1 ? "dag" : "dagen"} geleden`;
  if (weken < 5) return `${weken} ${weken === 1 ? "week" : "weken"} geleden`;
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function actieIcon(actie: string) {
  switch (actie) {
    case "create":
      return (
        <span className="text-green-600 dark:text-green-400 flex-shrink-0" title="Aangemaakt">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </span>
      );
    case "update":
      return (
        <span className="text-blue-600 dark:text-blue-400 flex-shrink-0" title="Gewijzigd">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </span>
      );
    case "delete":
      return (
        <span className="text-red-600 dark:text-red-400 flex-shrink-0" title="Verwijderd">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </span>
      );
    case "sync":
      return (
        <span className="text-purple-600 dark:text-purple-400 flex-shrink-0" title="Gesynchroniseerd">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </span>
      );
    default:
      return (
        <span className="text-gray-400 dark:text-gray-500 flex-shrink-0" title={actie}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </span>
      );
  }
}

export default async function HomePage() {
  const [stats, nieuwsPagina, doelPagina, user, recenteWijzigingen] = await Promise.all([
    getHomepageStats(),
    prisma.pagina.findUnique({ where: { slug: "homepage-nieuws" } }),
    prisma.pagina.findUnique({ where: { slug: "homepage-doel" } }),
    getSessionUser(),
    prisma.auditLog.findMany({
      where: { actie: { in: ["create", "update", "delete", "sync", "merge"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  const { aantalPakketten, aantalPakketversies, aantalLeveranciers, aantalOrganisaties, aantalStandaarden, aantalRefComps, aantalAddenda, aantalAppFuncties, gemeentenVoortgang } = stats;

  const magBewerken = canEditPagina(user);

  const sterVerdeling = [5, 4, 3, 2, 1, 0].map((ster) => {
    const min = (ster - 1) * 20 + 1;
    const max = ster * 20;
    const count = gemeentenVoortgang.filter(
      (g) => ster === 0 ? g.progress === 0 : g.progress >= min && g.progress <= max
    ).length;
    return { ster, count };
  });

  const ingelogdPerJaar = [
    { jaar: 2026, n: 69 },
    { jaar: 2025, n: aantalOrganisaties },
    { jaar: 2024, n: Math.round(aantalOrganisaties * 0.97) },
    { jaar: 2023, n: Math.round(aantalOrganisaties * 0.93) },
  ];

  return (
    <div className="-mt-6">
      <h1 className="sr-only">VNG Voorzieningencatalogus</h1>
      {/* Orange tile navigation */}
      <div className="bg-[#e35b10] -mx-4 px-2 sm:px-6 py-5 mb-8">
        <div className="flex flex-wrap gap-0 justify-center max-w-5xl mx-auto">
          {/* Orange tiles */}
          {[
            { href: "/dashboard", label: "Mijn\nVoorzieningencatalogus", Icon: IconMijnCatalogus, orange: true },
            { href: "/inkoop", label: "Inkoop\nondersteuning", Icon: IconInkoop, orange: true },
            { href: "/compliancy", label: "Compliancy\nmonitor", Icon: IconCompliancy, orange: true },
          ].map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="bg-white rounded shadow hover:shadow-md transition w-[calc(33.33%-8px)] sm:w-[140px] py-3 sm:py-4 px-1 sm:px-2 flex flex-col items-center gap-1.5 sm:gap-2 text-center m-1"
            >
              <tile.Icon />
              <span className="text-xs font-semibold text-[#c44b0a] leading-tight whitespace-pre-line">
                {tile.label}
              </span>
            </Link>
          ))}
          {/* Blue tiles */}
          {[
            { href: "/pakketten", label: "Pakketten", count: aantalPakketten, Icon: IconPakketten },
            { href: "/pakketversies", label: "Pakket\nversies", count: aantalPakketversies, Icon: IconPakketversies },
            { href: "/leveranciers", label: "Leveranciers", count: aantalLeveranciers, Icon: IconLeveranciers },
            { href: "/addenda", label: "Addenda", count: aantalAddenda, Icon: IconAddenda },
            { href: "/gemeenten", label: "Gemeenten", count: aantalOrganisaties, Icon: IconGemeenten },
            { href: "/standaarden", label: "Standaarden", count: aantalStandaarden, Icon: IconStandaarden },
            { href: "/referentiecomponenten", label: "Referentie\ncomponenten", count: aantalRefComps, Icon: IconReferentie },
            { href: "/applicatiefuncties", label: "Applicatie\nfuncties", count: aantalAppFuncties, Icon: IconApplicatiefuncties },
            { href: "/zoeken", label: "Zoeken", count: null, Icon: IconZoeken },
          ].map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="bg-white rounded shadow hover:shadow-md transition w-[calc(33.33%-8px)] sm:w-[140px] py-3 sm:py-4 px-1 sm:px-2 flex flex-col items-center gap-1.5 sm:gap-2 text-center m-1"
            >
              <tile.Icon />
              <span className="text-xs font-semibold text-[#1a6ca8] leading-tight whitespace-pre-line">
                {tile.label}
              </span>
            </Link>
          ))}
          {/* Green tiles */}
          {[
            { href: "/dienstverleners", label: "Dienstverleners", Icon: IconDienstverleners },
            { href: "/cloudproviders", label: "Cloud-\nproviders", Icon: IconCloudProviders },
          ].map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="bg-white rounded shadow hover:shadow-md transition w-[calc(33.33%-8px)] sm:w-[140px] py-3 sm:py-4 px-1 sm:px-2 flex flex-col items-center gap-1.5 sm:gap-2 text-center m-1"
            >
              <tile.Icon />
              <span className="text-xs font-semibold text-[#047857] leading-tight whitespace-pre-line">
                {tile.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick search */}
      <form action="/zoeken" method="get" className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            name="q"
            placeholder="Zoek in pakketten, leveranciers, gemeenten..."
            className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 pl-11 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1a6ca8] focus:border-transparent shadow-sm"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </form>

      {/* Three columns */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl">
        {/* Nieuws */}
        <div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
            <h2 className="text-base font-bold text-[#c44b0a]">Nieuws</h2>
            {magBewerken && (
              <Link href="/info/homepage-nieuws/bewerken" className="text-gray-400 hover:text-[#e35b10]" title="Bewerken">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            )}
          </div>
          {nieuwsPagina ? (
            <div className="cms-content text-sm text-gray-700">
              <GlossaryHighlighter html={nieuwsPagina.inhoud} />
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nieuws-content niet gevonden.</p>
          )}
        </div>

        {/* Doel */}
        <div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
            <h2 className="text-base font-bold text-[#c44b0a]">Doel van de voorzieningencatalogus</h2>
            {magBewerken && (
              <Link href="/info/homepage-doel/bewerken" className="text-gray-400 hover:text-[#e35b10]" title="Bewerken">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            )}
          </div>
          {doelPagina ? (
            <div className="cms-content text-sm text-gray-700">
              <GlossaryHighlighter html={doelPagina.inhoud} />
            </div>
          ) : (
            <p className="text-sm text-gray-400">Doel-content niet gevonden.</p>
          )}
        </div>

        {/* Voortgang gemeenten */}
        <div>
          <div className="flex items-center border-b border-gray-200 pb-2 mb-3">
            <h2 className="text-base font-bold text-[#c44b0a]">Voortgang gemeenten</h2>
          </div>
          <div className="space-y-2 mb-4">
            {sterVerdeling.map(({ ster, count }) => (
              <div key={ster} className="flex items-center gap-3 text-sm">
                <Stars count={ster} />
                <span className="text-gray-700 font-medium w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
          <Link href="/gemeenten" className="text-sm text-[#1a6ca8] hover:underline block mb-3">
            Uitleg over de voortgang categorieën
          </Link>
          <div className="text-sm text-gray-700 space-y-1">
            {ingelogdPerJaar.map(({ jaar, n }) => (
              <div key={jaar}>
                Aantal ingelogde gemeenten in {jaar}: <strong>{n}</strong>
              </div>
            ))}
          </div>
          <Link href="/gemeenten" className="mt-3 inline-block text-sm text-[#1a6ca8] hover:underline">
            Volledige rapportage →
          </Link>
        </div>
      </div>

      {/* Laatste wijzigingen */}
      {recenteWijzigingen.length > 0 && (
        <div className="mt-10 max-w-7xl">
          <div className="border-b border-gray-200 pb-2 mb-4">
            <h2 className="text-base font-bold text-[#c44b0a]">Laatste wijzigingen</h2>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-slate-700">
            {recenteWijzigingen.map((log) => (
              <li key={log.id} className="flex items-start gap-3 py-2.5">
                {actieIcon(log.actie)}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    <span className="font-medium">{log.entiteit}</span>
                    {log.details ? ` — ${log.details}` : ` ${log.actie}`}
                  </span>
                </div>
                <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                  {tijdGeleden(log.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
