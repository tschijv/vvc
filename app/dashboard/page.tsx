import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth-helpers";
import { sterrenDisplay } from "@/lib/progress";
import {
  getGemeenteForDashboard,
  getGemeentenForAdmin,
  getGemeentePakketten,
  getGemeenteDashboardStats,
  getStandaardFilters,
  getGemeenteKoppelingen,
  type DashboardStats,
  type KoppelingRow,
} from "@/lib/services/gemeente";
import { prisma } from "@/lib/prisma";
import DashboardKaartBar from "@/components/DashboardKaartBar";
import GemeenteSelector from "@/components/GemeenteSelector";

interface Props {
  searchParams: Promise<{ tab?: string; filter?: string; compliancy?: string; gemeenteId?: string }>;
}

function sterren(progress: number): string[] {
  return sterrenDisplay(progress).map((s) => (s === "★" ? "filled" : "empty"));
}

function richtingPijl(richting: string): string {
  switch (richting) {
    case "heen": return "→";
    case "weer": return "←";
    default: return "↔";
  }
}

export default async function DashboardPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login?callbackUrl=/dashboard");

  const params = await searchParams;
  const activeTab = params.tab || "pakketten";

  // Find gemeente(s) for this user
  let gemeente = null;
  let gemeenten: { id: string; naam: string }[] = [];

  if (user.role === "ADMIN") {
    gemeenten = await getGemeentenForAdmin();
    // Admin can pick a gemeente via query param, or sees the first
    const selectedId = params.gemeenteId || (gemeenten.length > 0 ? gemeenten[0].id : null);
    if (selectedId) {
      gemeente = await getGemeenteForDashboard(selectedId);
    }
  } else if (user.role === "GEMEENTE" && user.gemeenteId) {
    gemeente = await getGemeenteForDashboard(user.gemeenteId);
  } else if (user.role === "LEVERANCIER") {
    redirect("/leveranciers");
  } else {
    redirect("/");
  }

  if (!gemeente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Geen gemeente gekoppeld aan uw account.</p>
        <Link href="/" className="text-[#1a6ca8] hover:underline mt-2 inline-block">
          Terug naar home
        </Link>
      </div>
    );
  }

  // Load tab-specific data
  const pakketten = activeTab === "pakketten" ? await loadPakketRows(gemeente.id, params.compliancy) : [];
  const standaardFilters = activeTab === "pakketten" ? await getStandaardFilters(gemeente.id) : [];
  const koppelingen = activeTab === "koppelingen" ? await getGemeenteKoppelingen(gemeente.id) : [];
  const dashboardStats = activeTab === "dashboard" ? await getGemeenteDashboardStats(gemeente.id) : null;

  // Load views for kaart (on pakketten and koppelingen tabs)
  const views = (activeTab === "pakketten" || activeTab === "koppelingen")
    ? await prisma.gemmaView.findMany({
        where: { actief: true },
        select: { id: true, titel: true, domein: true },
        orderBy: [{ domein: "asc" }, { volgorde: "asc" }],
      })
    : [];

  const pakketCount = gemeente._count.pakketten;
  const koppelingCount = gemeente._count.koppelingen;
  const suggestieCount = dashboardStats?.suggestieCount || 27;

  // Build query string helper to preserve gemeenteId in tab links
  const gParam = user.role === "ADMIN" ? `&gemeenteId=${gemeente.id}` : "";

  return (
    <div>
      {/* Gemeente selector for admin */}
      {user.role === "ADMIN" && gemeenten.length > 1 && (
        <GemeenteSelector gemeenten={gemeenten} selectedId={gemeente.id} />
      )}

      {/* Header with gemeente info */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded flex items-center justify-center text-gray-400 text-xs font-medium">
              {gemeente.naam.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-light text-[#1a6ca8]">
                Pakket- en koppelingenoverzicht {gemeente.naam}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm">
                <span className="text-gray-600">Voortgang:</span>
                <div className="flex items-center gap-0.5">
                  {sterren(gemeente.progress).map((s, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${s === "filled" ? "text-[#e35b10]" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <Link href="#" className="text-[#1a6ca8] hover:underline text-xs ml-2">
                  Voortgang verbeteren
                </Link>
                <Link href="/kaart" className="text-[#1a6ca8] hover:underline text-xs ml-2">
                  Applicatielandschap
                </Link>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-medium">{gemeente.contactpersoon || "—"}</p>
            {gemeente.email && (
              <a href={`mailto:${gemeente.email}`} className="text-[#1a6ca8] hover:underline block">
                {gemeente.email}
              </a>
            )}
            {gemeente.website && (
              <a href={gemeente.website} target="_blank" rel="noopener" className="text-[#1a6ca8] hover:underline block">
                {gemeente.website}
              </a>
            )}
            {gemeente.telefoon && <p>{gemeente.telefoon}</p>}
            {gemeente.lastActivity && (
              <p className="text-xs text-gray-400 mt-1">
                Laatst gewijzigd: {new Date(gemeente.lastActivity).toLocaleDateString("nl-NL", {
                  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <TabLink href={`/dashboard?tab=dashboard${gParam}`} active={activeTab === "dashboard"} label="Dashboard" />
        <TabLink href={`/dashboard?tab=pakketten${gParam}`} active={activeTab === "pakketten"} label="Pakketten" count={pakketCount} />
        <TabLink href={`/dashboard?tab=koppelingen${gParam}`} active={activeTab === "koppelingen"} label="Koppelingen" count={koppelingCount} />
        <TabLink href={`/dashboard?tab=suggesties${gParam}`} active={activeTab === "suggesties"} label="Suggesties" count={suggestieCount} />
      </div>

      {/* Tab content */}
      {activeTab === "dashboard" && dashboardStats && (
        <DashboardTab stats={dashboardStats} />
      )}

      {activeTab === "pakketten" && (
        <PakkettenTab pakketten={pakketten} compliancyFilter={params.compliancy} standaardFilters={standaardFilters} views={views} gemeenteId={gemeente.id} gemeenteNaam={gemeente.naam} />
      )}

      {activeTab === "koppelingen" && (
        <KoppelingenTab koppelingen={koppelingen} views={views} gemeenteId={gemeente.id} gemeenteNaam={gemeente.naam} />
      )}

      {activeTab === "suggesties" && (
        <SuggestiesTab />
      )}
    </div>
  );
}

function TabLink({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
        active
          ? "border-[#1a6ca8] text-[#1a6ca8]"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded ${active ? "bg-[#1a6ca8] text-white" : "bg-gray-200 text-gray-600"}`}>
          {count}
        </span>
      )}
    </Link>
  );
}

function DashboardTab({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: "Compliant pakketversies",
      hasInfo: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      count: stats.compliantCount,
      countLabel: "Pakketten",
      buttonLabel: "Toon compliant pakketversies",
      href: "/dashboard?tab=pakketten&compliancy=wel",
    },
    {
      title: "Einde ondersteuning leverancier",
      hasInfo: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      count: stats.eindeOndersteuningCount,
      countLabel: "Pakketten",
      buttonLabel: "Toon pakketten zonder ondersteuning",
      href: "/dashboard?tab=pakketten",
    },
    {
      title: "SaaS alternatieven",
      hasInfo: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      count: stats.saasAlternatievenCount,
      countLabel: "Pakketten met SaaS alternatieven",
      buttonLabel: "Toon pakketten met SaaS alternatieven",
      href: "/dashboard?tab=pakketten",
    },
    {
      title: "Inkoopondersteuning",
      hasInfo: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: null,
      countLabel: null,
      description: "U gaat vanuit hier naar de algemene pagina voor inkoopondersteuning.",
      buttonLabel: "Inkoopondersteuning",
      href: "/info/voor-gemeenten",
    },
    {
      title: "Pakketten met meer mogelijkheden",
      hasInfo: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      count: stats.pakkettenMeerMogelijkheden,
      countLabel: "Referentiecomponenten",
      buttonLabel: "Toon referentiecomponenten",
      href: "/referentiecomponenten",
    },
    {
      title: "Referentiecomponenten met meerdere pakketten",
      hasInfo: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      count: stats.refcompMetMeerderePakketten,
      countLabel: "Referentiecomponenten",
      buttonLabel: "Toon referentiecomponenten",
      href: "/referentiecomponenten",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-5">
      {cards.map((card, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Card header */}
          <div className="flex items-start justify-between p-4 pb-2">
            <h3 className="text-[#e35b10] font-semibold text-base leading-tight pr-2">
              {card.title}
              {card.hasInfo && (
                <span className="inline-block ml-1.5 w-4 h-4 rounded-full bg-[#1a6ca8] text-white text-[10px] text-center leading-4 align-middle cursor-help" title="Meer informatie">
                  i
                </span>
              )}
            </h3>
            <div className="w-10 h-10 rounded bg-[#c44b0a] flex items-center justify-center flex-shrink-0">
              {card.icon}
            </div>
          </div>

          {/* Card body */}
          <div className="px-4 pb-2">
            {card.count !== null ? (
              <div className="flex items-center gap-2 my-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-green-600 text-white text-sm font-bold">
                  {card.count}
                </span>
                <span className="text-sm text-gray-700">{card.countLabel}</span>
              </div>
            ) : card.description ? (
              <p className="text-sm text-gray-600 my-3">{card.description}</p>
            ) : null}
          </div>

          {/* Card footer */}
          <div className="px-4 pb-4">
            <Link
              href={card.href}
              className="inline-block border border-[#1a6ca8] text-[#1a6ca8] text-sm px-3 py-1.5 rounded hover:bg-[#1a6ca8] hover:text-white transition-colors"
            >
              {card.buttonLabel}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function PakkettenTab({
  pakketten,
  compliancyFilter,
  standaardFilters,
  views,
  gemeenteId,
  gemeenteNaam,
}: {
  pakketten: PakketRow[];
  compliancyFilter?: string;
  standaardFilters?: { naam: string; count: number }[];
  views: { id: string; titel: string; domein: string }[];
  gemeenteId: string;
  gemeenteNaam: string;
}) {
  const nietCompliant = pakketten.filter((p) => !p.hasCompliancy).length;
  const welCompliant = pakketten.filter((p) => p.hasCompliancy).length;

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center justify-end gap-3 mb-5">
        <DashboardKaartBar views={views} gemeenteId={gemeenteId} gemeenteNaam={gemeenteNaam} />
      </div>

      <div className="flex gap-8">
        {/* Filters */}
        <div className="w-72 flex-shrink-0 space-y-6">
          {/* Compliancy filter */}
          <div>
            <h3 className="font-bold text-sm mb-2">Pakketversie is compliant</h3>
            <div className="space-y-1.5 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" readOnly checked={compliancyFilter === "niet"} className="rounded border-gray-300" />
                <Link href={`/dashboard?tab=pakketten${compliancyFilter === "niet" ? "" : "&compliancy=niet"}`} className="hover:underline">
                  Niet compliant met een standaard ({nietCompliant})
                </Link>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" readOnly checked={compliancyFilter === "wel"} className="rounded border-gray-300" />
                <Link href={`/dashboard?tab=pakketten${compliancyFilter === "wel" ? "" : "&compliancy=wel"}`} className="hover:underline">
                  Compliant met een testrapport ({welCompliant})
                </Link>
              </label>
            </div>
          </div>

          {/* Standaard met testrapport */}
          {standaardFilters && standaardFilters.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2">Standaard met testrapport</h3>
              <div className="space-y-1.5 text-sm max-h-48 overflow-y-auto">
                {standaardFilters.filter(s => s.count > 0).slice(0, 10).map((s) => (
                  <label key={s.naam} className="flex items-center gap-2">
                    <input type="checkbox" readOnly className="rounded border-gray-300" />
                    <span className="text-gray-700">Met testrapport {s.naam} ({s.count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Standaard */}
          {standaardFilters && standaardFilters.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2">Standaard</h3>
              <div className="space-y-1.5 text-sm max-h-48 overflow-y-auto">
                {standaardFilters.slice(0, 10).map((s) => (
                  <label key={s.naam} className="flex items-center gap-2">
                    <input type="checkbox" readOnly className="rounded border-gray-300" />
                    <span className="text-gray-700">{s.naam} ({s.count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left">
                <th className="pb-2 pr-4 font-semibold">Leverancier</th>
                <th className="pb-2 pr-4 font-semibold">Pakketnaam en -versie</th>
                <th className="pb-2 pr-4 font-semibold">Status</th>
                <th className="pb-2 font-semibold">Gebruikt voor</th>
              </tr>
            </thead>
            <tbody>
              {pakketten.map((p, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                  <td className="py-3 pr-4 text-gray-700">{p.leverancier}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/pakketten/${p.pakketSlug}`} className="text-[#1a6ca8] hover:underline">
                      {p.pakketNaam} {p.versie}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {p.status || "In productie"}
                    {p.datumIngangStatus && (
                      <div className="text-xs text-gray-400">
                        {new Date(p.datumIngangStatus).toLocaleDateString("nl-NL")}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-gray-600 text-xs leading-relaxed">
                    {p.gebruiktVoor.join(", ") || "—"}
                  </td>
                </tr>
              ))}
              {pakketten.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Geen pakketten gevonden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KoppelingenTab({
  koppelingen,
  views,
  gemeenteId,
  gemeenteNaam,
}: {
  koppelingen: KoppelingRow[];
  views: { id: string; titel: string; domein: string }[];
  gemeenteId: string;
  gemeenteNaam: string;
}) {
  // Compute filter counts
  const buitengemeentelijkCount = koppelingen.filter((k) => k.buitengemeentelijk).length;

  // Standaard counts
  const standaardCounts: Record<string, number> = {};
  koppelingen.forEach((k) => {
    if (k.standaard) {
      standaardCounts[k.standaard] = (standaardCounts[k.standaard] || 0) + 1;
    }
  });
  const standaardEntries = Object.entries(standaardCounts).sort((a, b) => b[1] - a[1]);

  // Pakketversie/buitengemeentelijk koppelvlak counts
  const pakketversieCounts: Record<string, number> = {};
  koppelingen.forEach((k) => {
    if (k.bron && k.bron !== "—") {
      pakketversieCounts[k.bron] = (pakketversieCounts[k.bron] || 0) + 1;
    }
  });
  const pakketversieEntries = Object.entries(pakketversieCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      {/* Action bar with export */}
      <div className="flex items-center justify-end gap-3 mb-5">
        <DashboardKaartBar views={views} gemeenteId={gemeenteId} gemeenteNaam={gemeenteNaam} />
      </div>

      <div className="flex gap-8">
        {/* Filter sidebar */}
        <div className="w-72 flex-shrink-0 space-y-6">
          {/* Soort koppelingen */}
          <div>
            <h3 className="font-bold text-sm mb-2">Soort koppelingen</h3>
            <div className="space-y-1.5 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" readOnly className="rounded border-gray-300" />
                <span className="text-gray-700">Buitengemeentelijk ({buitengemeentelijkCount})</span>
              </label>
            </div>
          </div>

          {/* Standaard */}
          {standaardEntries.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2">Standaard</h3>
              <div className="space-y-1.5 text-sm max-h-48 overflow-y-auto">
                {standaardEntries.map(([naam, count]) => (
                  <label key={naam} className="flex items-center gap-2">
                    <input type="checkbox" readOnly className="rounded border-gray-300" />
                    <span className="text-gray-700">{naam} ({count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Pakketversie/buitengemeentelijk koppelvlak */}
          {pakketversieEntries.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2">Pakketversie/buitengemeentelijk koppelvlak</h3>
              <div className="space-y-1.5 text-sm max-h-64 overflow-y-auto">
                {pakketversieEntries.slice(0, 15).map(([naam, count]) => (
                  <label key={naam} className="flex items-center gap-2">
                    <input type="checkbox" readOnly className="rounded border-gray-300" />
                    <span className="text-gray-700 truncate" title={naam}>{naam} ({count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1">
          {koppelingen.length > 0 ? (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left">
                  <th className="pb-2 pr-4 font-semibold text-[#1a6ca8]">Pakketversie/Extern</th>
                  <th className="pb-2 pr-4 font-semibold text-center">Koppeling</th>
                  <th className="pb-2 pr-4 font-semibold text-[#1a6ca8]">Pakketversie/Extern/Buitengemeentelijk</th>
                  <th className="pb-2 pr-4 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-[#1a6ca8]">Standaard</th>
                </tr>
              </thead>
              <tbody>
                {koppelingen.map((k, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4 text-[#1a6ca8]">{k.bron}</td>
                    <td className="py-3 pr-4 text-center text-lg">{k.richting}</td>
                    <td className="py-3 pr-4 text-[#1a6ca8]">{k.doel}</td>
                    <td className="py-3 pr-4 text-gray-600">{k.status || "—"}</td>
                    <td className="py-3 text-gray-600">{k.standaard || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">Geen koppelingen geregistreerd.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SuggestiesTab() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 text-sm">
        Suggesties worden gegenereerd op basis van vergelijking met andere gemeenten.
      </p>
    </div>
  );
}

// --- Data loading ---

type PakketRow = {
  leverancier: string;
  pakketNaam: string;
  pakketSlug: string;
  versie: string;
  status: string | null;
  datumIngangStatus: Date | null;
  gebruiktVoor: string[];
  hasCompliancy: boolean;
};

async function loadPakketRows(gemeenteId: string, compliancy?: string): Promise<PakketRow[]> {
  const gps = await getGemeentePakketten(gemeenteId);

  let filtered = gps;
  if (compliancy === "niet") {
    filtered = gps.filter((gp) => !gp.pakketversie.standaarden.some((s) => s.compliancy));
  } else if (compliancy === "wel") {
    filtered = gps.filter((gp) => gp.pakketversie.standaarden.some((s) => s.compliancy));
  }

  return filtered.map((gp) => ({
    leverancier: gp.pakketversie.pakket.leverancier.naam,
    pakketNaam: gp.pakketversie.pakket.naam,
    pakketSlug: gp.pakketversie.pakket.slug,
    versie: gp.pakketversie.naam,
    status: gp.status,
    datumIngangStatus: gp.datumIngangStatus,
    gebruiktVoor: gp.pakketversie.referentiecomponenten.map((r) => r.referentiecomponent.naam),
    hasCompliancy: gp.pakketversie.standaarden.some((s) => s.compliancy === true),
  }));
}
