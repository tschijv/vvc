import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/data/prisma";
import {
  getGemeenteById,
  getSimilarGemeenten,
  getGemeenteForDashboard,
  getGemeentenForAdmin,
  getGemeenteDashboardStats,
  getStandaardFilters,
  getGemeenteKoppelingen,
} from "@/service/gemeente";
import {
  getSessionUser,
  canViewGemeentePortfolio,
  canViewGemeenteContact,
  canEditGemeentePortfolio,
} from "@/process/auth-helpers";
import AIAdviseur from "./AIAdviseur";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import ShareButton from "@/ui/components/ShareButton";
import FavorietButton from "@/ui/components/FavorietButton";
import QRCode from "@/ui/components/QRCode";
import GemeenteEditButton from "./GemeenteEditButton";
import OrganisatieSelector from "@/ui/components/OrganisatieSelector";
import HelpLink from "@/ui/components/HelpLink";
import { sterren, loadPakketRows, loadSuggesties } from "./helpers";
import TabLink from "./TabLink";
import DashboardTab from "./DashboardTab";
import PakkettenTab from "./PakkettenTab";
import KoppelingenTab from "./KoppelingenTab";
import SuggestiesTab from "./SuggestiesTab";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; compliancy?: string; standaard?: string; testrapport?: string; bron?: string; buitengemeentelijk?: string }>;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const gemeente = await prisma.organisatie.findUnique({ where: { id: slug } });
  if (!gemeente) return {};
  return {
    title: gemeente.naam,
    description: `${gemeente.naam} \u2014 gemeente in de VNG Voorzieningencatalogus`,
    openGraph: {
      title: gemeente.naam,
      description: `Applicatieportfolio en voortgang van ${gemeente.naam}`,
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function GemeenteDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const user = await getSessionUser();

  const gemeente = await getGemeenteById(slug);
  if (!gemeente) notFound();

  const showContact = canViewGemeenteContact(user);
  const showPortfolio = canViewGemeentePortfolio(user);
  const isAuth = !!user && (user.role === "ADMIN" || user.role === "GEMEENTE");
  const isAdmin = user?.role === "ADMIN";
  const isLeverancier = user?.role === "LEVERANCIER";
  const canEdit = canEditGemeentePortfolio(user, slug);

  const activeTab = sp.tab || "dashboard";

  // Admin gemeente selector data + dashboard data in parallel
  const [organisaties, dashboardGemeente] = await Promise.all([
    isAdmin ? getGemeentenForAdmin() : Promise.resolve([]),
    isAuth ? getGemeenteForDashboard(slug) : Promise.resolve(null),
  ]);
  const pakketCount = dashboardGemeente?._count.pakketten ?? 0;
  const koppelingCount = dashboardGemeente?._count.koppelingen ?? 0;

  // ─── Tab-specific data loading ─────────────────────────────────────────────

  // Dashboard tab — parallel stats + similar gemeenten
  const [dashboardStats, similarResult] = activeTab === "dashboard" && isAuth
    ? await Promise.all([
        getGemeenteDashboardStats(slug),
        getSimilarGemeenten(slug),
      ])
    : [null, { organisaties: [], totalCount: 0 }];
  const similarOrganisaties = similarResult?.organisaties ?? [];
  const similarTotalCount = similarResult.totalCount;

  // Pakketten tab — parallel pakketRows + standaardFilters
  const [pakketRows, standaardFilters] = activeTab === "pakketten" && isAuth
    ? await Promise.all([
        loadPakketRows(slug, { compliancy: sp.compliancy, standaard: sp.standaard, testrapport: sp.testrapport }),
        getStandaardFilters(slug),
      ])
    : [[], []];

  // Koppelingen tab
  const koppelingen = activeTab === "koppelingen" && isAuth ? await getGemeenteKoppelingen(slug) : [];

  // Suggesties tab
  const suggesties = activeTab === "suggesties" && isAuth ? await loadSuggesties(slug) : null;
  const suggestieCount = suggesties
    ? suggesties.nieuwePakketten.length + suggesties.nieuweVersies.length + suggesties.buitenOrganisatieKoppelingen.length
    : (dashboardStats?.suggestieCount || 0);

  // Views for kaart bar (pakketten and koppelingen tabs)
  const views = (activeTab === "pakketten" || activeTab === "koppelingen") && isAuth
    ? await prisma.gemmaView.findMany({
        where: { actief: true },
        select: { id: true, titel: true, domein: true },
        orderBy: [{ domein: "asc" }, { volgorde: "asc" }],
      })
    : [];

  // Tab definitions — Dashboard is het hoofd-tab
  const tabs = [
    { key: "dashboard", label: "Dashboard", show: isAuth },
    { key: "pakketten", label: "Pakketten", show: isAuth, count: pakketCount },
    { key: "koppelingen", label: "Koppelingen", show: isAuth, count: koppelingCount },
    { key: "suggesties", label: "Suggesties", show: isAuth, count: suggestieCount },
    { key: "ai-adviseur", label: "Voortgang verbeteren (AI)", show: isAuth },
  ];

  return (
    <div>
      {/* Admin gemeente selector */}
      {isAdmin && organisaties.length > 1 && (
        <OrganisatieSelector organisaties={organisaties} selectedId={slug} currentTab={activeTab} />
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Gemeenten", href: "/gemeenten" },
          { label: gemeente.naam, href: `/gemeenten/${slug}` },
        ]}
      />

      {/* Header */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded flex items-center justify-center text-gray-400 text-xs font-medium">
              {gemeente.naam.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-light text-[#1a6ca8]">{gemeente.naam}</h1>
                <ShareButton />
                <FavorietButton entityType="gemeente" entityId={slug} />
                <QRCode url={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/gemeenten/${slug}`} title={gemeente.naam} />
              </div>
              {gemeente.cbsCode && (
                <p className="text-xs text-gray-500 mt-0.5">CBS-code: {gemeente.cbsCode}</p>
              )}
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
                <div className="w-24 bg-gray-200 rounded-full h-2 ml-2">
                  <div
                    className="bg-[#1a6ca8] h-2 rounded-full"
                    style={{ width: `${Math.min(gemeente.progress, 100)}%` }}
                  />
                </div>
                <span className="text-gray-500 text-xs">{gemeente.progress}%</span>
                {showPortfolio && (
                  <Link href={`/gemeenten/vergelijk?a=${slug}`} className="text-[#1a6ca8] hover:underline text-xs ml-2">
                    Vergelijk
                  </Link>
                )}
                <Link href="/kaart" className="text-[#1a6ca8] hover:underline text-xs ml-2">
                  Applicatielandschap
                </Link>
              </div>
            </div>
          </div>
          {/* Contact details */}
          {showContact && (
            <div className="text-right text-sm text-gray-600">
              <div className="flex items-center justify-end gap-2">
                <p className="font-medium">{gemeente.contactpersoon || "\u2014"}</p>
                {canEdit && (
                  <GemeenteEditButton
                    organisatieId={gemeente.id}
                    contactpersoon={gemeente.contactpersoon || ""}
                    email={gemeente.email || ""}
                    telefoon={gemeente.telefoon || ""}
                    website={gemeente.website || ""}
                  />
                )}
              </div>
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
                <p className="text-xs text-gray-500 mt-1">
                  Laatst gewijzigd: {new Date(gemeente.lastActivity).toLocaleDateString("nl-NL", {
                    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.filter((t) => t.show).map((t) => (
          <TabLink
            key={t.key}
            href={`/gemeenten/${slug}?tab=${t.key}`}
            active={activeTab === t.key}
            label={t.label}
            count={(t as { count?: number }).count}
          />
        ))}
      </div>

      {/* ─── Tab content ───────────────────────────────────────────────────────── */}

      {activeTab === "dashboard" && isAuth && dashboardStats && (
        <DashboardTab
          stats={dashboardStats}
          organisatieId={slug}
          similarOrganisaties={similarOrganisaties}
          similarTotalCount={similarTotalCount}
          samenwerkingen={gemeente.samenwerkingen}
        />
      )}

      {activeTab === "pakketten" && isAuth && (
        <PakkettenTab
          pakketten={pakketRows}
          totalPakketCount={pakketCount}
          compliancyFilter={sp.compliancy}
          standaardFilter={sp.standaard}
          testrapportFilter={sp.testrapport}
          standaardFilters={standaardFilters}
          views={views}
          organisatieId={slug}
          organisatieNaam={gemeente.naam}
          canEdit={canEdit}
        />
      )}

      {activeTab === "koppelingen" && isAuth && (
        <KoppelingenTab
          koppelingen={koppelingen}
          views={views}
          organisatieId={slug}
          organisatieNaam={gemeente.naam}
          filterStandaard={sp.standaard}
          filterBron={sp.bron}
          filterBuitenOrganisatie={sp.buitengemeentelijk}
          canEdit={canEdit}
        />
      )}

      {activeTab === "suggesties" && isAuth && suggesties && (
        <SuggestiesTab suggesties={suggesties} />
      )}

      {activeTab === "ai-adviseur" && isAuth && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpLink section="ai-adviseur" label="Help over de AI-adviseur" />
          </div>
          <AIAdviseur organisatieId={slug} organisatieNaam={gemeente.naam} />
        </div>
      )}

      {/* Auth gate when not logged in */}
      {!isAuth && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm">
          <p className="text-yellow-800">
            <span className="font-semibold">Inloggen vereist.</span>{" "}
            <Link href={`/auth/login?callbackUrl=/gemeenten/${slug}?tab=${activeTab}`} className="text-[#1a6ca8] hover:underline">
              Log in
            </Link>{" "}
            om dit tabblad te bekijken.
          </p>
        </div>
      )}
    </div>
  );
}
