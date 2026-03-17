import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canEditPagina } from "@/lib/auth-helpers";
import GlossaryHighlighter from "@/components/GlossaryHighlighter";

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

export default async function HomePage() {
  const [aantalPakketten, aantalLeveranciers, aantalGemeenten, aantalStandaarden, aantalRefComps, gemeentenVoortgang, nieuwsPagina, doelPagina, user] = await Promise.all([
    prisma.pakket.count(),
    prisma.leverancier.count(),
    prisma.gemeente.count(),
    prisma.standaard.count(),
    prisma.referentiecomponent.count(),
    prisma.gemeente.findMany({ select: { progress: true } }),
    prisma.pagina.findUnique({ where: { slug: "homepage-nieuws" } }),
    prisma.pagina.findUnique({ where: { slug: "homepage-doel" } }),
    getSessionUser(),
  ]);

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
    { jaar: 2025, n: aantalGemeenten },
    { jaar: 2024, n: Math.round(aantalGemeenten * 0.97) },
    { jaar: 2023, n: Math.round(aantalGemeenten * 0.93) },
  ];

  return (
    <div className="-mt-6">
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
              <span className="text-xs font-semibold text-[#e35b10] leading-tight whitespace-pre-line">
                {tile.label}
              </span>
            </Link>
          ))}
          {/* Blue tiles */}
          {[
            { href: "/pakketten", label: "Pakketten", count: aantalPakketten, Icon: IconPakketten },
            { href: "/leveranciers", label: "Leveranciers", count: aantalLeveranciers, Icon: IconLeveranciers },
            { href: "/gemeenten", label: "Gemeenten", count: aantalGemeenten, Icon: IconGemeenten },
            { href: "/standaarden", label: "Standaarden", count: aantalStandaarden, Icon: IconStandaarden },
            { href: "/referentiecomponenten", label: "Referentie\ncomponenten", count: aantalRefComps, Icon: IconReferentie },
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
              <span className="text-xs font-semibold text-[#059669] leading-tight whitespace-pre-line">
                {tile.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Three columns */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl">
        {/* Nieuws */}
        <div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
            <h2 className="text-base font-bold text-[#e35b10]">Nieuws</h2>
            {magBewerken && (
              <Link href="/info/homepage-nieuws/bewerken" className="text-gray-400 hover:text-[#e35b10]" title="Bewerken">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <h2 className="text-base font-bold text-[#e35b10]">Doel van de voorzieningencatalogus</h2>
            {magBewerken && (
              <Link href="/info/homepage-doel/bewerken" className="text-gray-400 hover:text-[#e35b10]" title="Bewerken">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <h2 className="text-base font-bold text-[#e35b10]">Voortgang gemeenten</h2>
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
    </div>
  );
}
