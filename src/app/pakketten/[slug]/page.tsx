import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/data/prisma";
import { getPakketBySlug } from "@/service/pakket";
import { getReviewsForPakket, getReviewStats, getMyReview } from "@/service/review";
import { getSessionUser, canEditLeverancierPakket } from "@/process/auth-helpers";
import GlossaryHighlighter from "@/ui/components/GlossaryHighlighter";
import { tenant } from "@/process/tenant-config";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import ShareButton from "@/ui/components/ShareButton";
import FavorietButton from "@/ui/components/FavorietButton";
import QRCode from "@/ui/components/QRCode";
import ReviewStats from "@/ui/components/ReviewStats";
import RadarChart from "@/ui/components/RadarChart";
import ReviewList from "@/ui/components/ReviewList";
import PakketEditSection from "./PakketEditSection";
import PakketversieEditModal from "./PakketversieEditModal";
import PakketContactEditModal from "./PakketContactEditModal";
import { AddVersieButton, VersieRowActions, AddContactButton, ContactRowActions } from "./PakketActions";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pakket = await prisma.pakket.findUnique({
    where: { slug },
    include: { leverancier: true },
  });
  if (!pakket) return {};
  return {
    title: pakket.naam,
    description: pakket.beschrijving || `${pakket.naam} van ${pakket.leverancier.naam}`,
    openGraph: {
      title: pakket.naam,
      description: pakket.beschrijving || `Software pakket van ${pakket.leverancier.naam}`,
    },
  };
}

const STATUS_COLORS: Record<string, string> = {
  "In gebruik": "bg-green-100 text-green-800",
  "In ontwikkeling": "bg-blue-100 text-blue-800",
  "Einde ondersteuning": "bg-yellow-100 text-yellow-800",
  Teruggetrokken: "bg-red-100 text-red-800",
};

export default async function PakketDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab = "standaarden" } = await searchParams;

  const pakket = await getPakketBySlug(slug);

  if (!pakket) notFound();

  const user = await getSessionUser();
  const canEdit = canEditLeverancierPakket(user, pakket.leverancierId);

  const latestVersie = pakket.versies[0];

  // Fetch audit log entries for this pakket and its versies
  const pakketversieIds = pakket.versies.map((v) => v.id);
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { entiteit: "Pakket", entiteitId: pakket.id },
        { entiteit: "Pakketversie", entiteitId: { in: pakketversieIds } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Build timeline events from audit logs, or fall back to pakketversies
  type TimelineEvent = {
    id: string;
    datum: Date;
    type: "create" | "update" | "delete" | "versie";
    beschrijving: string;
    detail?: string;
  };

  let timelineEvents: TimelineEvent[] = [];

  if (auditLogs.length > 0) {
    timelineEvents = auditLogs.map((log) => ({
      id: log.id,
      datum: log.createdAt,
      type: (log.actie === "create"
        ? "create"
        : log.actie === "delete"
        ? "delete"
        : "update") as TimelineEvent["type"],
      beschrijving:
        log.actie === "create"
          ? `${log.entiteit} aangemaakt`
          : log.actie === "update"
          ? `${log.entiteit} bijgewerkt`
          : log.actie === "delete"
          ? `${log.entiteit} verwijderd`
          : `${log.entiteit}: ${log.actie}`,
      detail: log.details || undefined,
    }));
  } else {
    // Fallback: show pakketversies as timeline
    timelineEvents = pakket.versies
      .map((v) => ({
        id: v.id,
        datum: v.createdAt,
        type: "versie" as const,
        beschrijving: `Versie ${v.naam} toegevoegd`,
        detail: `Status: ${v.status}`,
      }))
      .sort((a, b) => b.datum.getTime() - a.datum.getTime());
  }

  // Referentiecomponenten are now directly on pakket
  const refComps = pakket.referentiecomponenten.map((prc) => ({
    naam: prc.referentiecomponent.naam,
    aantalOrganisaties: prc.aantalOrganisaties,
  }));

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Pakketten", href: "/pakketten" },
          { label: pakket.naam, href: `/pakketten/${slug}` },
        ]}
      />
      {/* Header */}
      <div className="border rounded p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-blue-700">{pakket.naam}</h1>
            {canEdit && (
              <PakketEditSection
                pakketId={pakket.id}
                naam={pakket.naam}
                beschrijving={pakket.beschrijving || ""}
              />
            )}
            <ShareButton />
            <FavorietButton entityType="pakket" entityId={pakket.id} />
            <QRCode url={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/pakketten/${slug}`} title={pakket.naam} />
          </div>
          <Link
            href={`/leveranciers/${pakket.leverancier.slug}`}
            className="text-blue-600 text-sm hover:underline"
          >
            {pakket.leverancier.naam}
          </Link>
          <p className="text-sm text-gray-700 mt-3 leading-relaxed">
            <GlossaryHighlighter>{pakket.beschrijving || ""}</GlossaryHighlighter>
          </p>
        </div>
        <div className="text-sm text-right space-y-1 shrink-0">
          {pakket.leverancier.contactpersoon && (
            <div className="text-gray-800 font-medium">
              {pakket.leverancier.contactpersoon}
            </div>
          )}
          {pakket.leverancier.email && (
            <div>
              <a href={`mailto:${pakket.leverancier.email}`} className="text-blue-600 hover:underline">
                {pakket.leverancier.email}
              </a>
            </div>
          )}
          {pakket.leverancier.telefoon && (
            <div className="text-gray-600">{pakket.leverancier.telefoon}</div>
          )}
          {pakket.leverancier.website && (
            <div>
              <a
                href={pakket.leverancier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website leverancier
              </a>
            </div>
          )}
          {pakket.leverancier.supportPortalUrl && (
            <div>
              <a
                href={pakket.leverancier.supportPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Supportportaal
              </a>
            </div>
          )}
          {pakket.leverancier.addenda.length > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              Ondertekende addenda ({pakket.leverancier.addenda.length})
            </div>
          )}
        </div>
      </div>

      {/* Contactpersonen per pakket (Eis 67) */}
      {(pakket.contactpersonen.length > 0 || canEdit) && (
        <div className="border rounded p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Contactpersonen voor dit pakket</h2>
            {canEdit && <AddContactButton pakketId={pakket.id} />}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pakket.contactpersonen.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded p-3 text-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{c.naam}</div>
                    {c.rol && <div className="text-xs text-gray-500">{c.rol}</div>}
                  </div>
                  {canEdit && (
                    <ContactRowActions
                      pakketId={pakket.id}
                      contact={{
                        id: c.id,
                        naam: c.naam,
                        email: c.email,
                        telefoon: c.telefoon,
                        rol: c.rol,
                      }}
                    />
                  )}
                </div>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline text-xs block mt-1">
                    {c.email}
                  </a>
                )}
                {c.telefoon && <div className="text-xs text-gray-600 mt-0.5">{c.telefoon}</div>}
              </div>
            ))}
          </div>
          {pakket.contactpersonen.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Nog geen contactpersonen toegevoegd.</p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Versietabel */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Versies</h3>
            {canEdit && <AddVersieButton pakketId={pakket.id} />}
          </div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th scope="col" className="pb-2 pr-3 font-semibold">Pakketversie</th>
                <th scope="col" className="pb-2 pr-3 font-semibold">Status</th>
                <th scope="col" className="pb-2 font-semibold">Start distributie</th>
                {canEdit && <th scope="col" className="pb-2 w-16"></th>}
              </tr>
            </thead>
            <tbody>
              {pakket.versies.map((v) => (
                <tr key={v.id} className="border-b border-gray-100">
                  <td className="py-2 pr-3 font-medium text-blue-700">{v.naam}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[v.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-600">
                    {v.startDistributie
                      ? v.startDistributie.toLocaleDateString("nl-NL")
                      : "—"}
                  </td>
                  {canEdit && (
                    <td className="py-2">
                      <VersieRowActions
                        pakketId={pakket.id}
                        versie={{
                          id: v.id,
                          naam: v.naam,
                          status: v.status,
                          beschrijving: v.beschrijving,
                          startOntwikkeling: v.startOntwikkeling?.toISOString().split("T")[0] || null,
                          startTest: v.startTest?.toISOString().split("T")[0] || null,
                          startDistributie: v.startDistributie?.toISOString().split("T")[0] || null,
                        }}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Referentiecomponenten */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Pakket geschikt voor ({tenant.architectuur.naam} 2) — Ingevuld door {pakket.aantalOrganisaties} {tenant.organisatieType.meervoud}
          </h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {refComps.map((rc) => (
                <tr key={rc.naam} className="border-b border-gray-100">
                  <td className="py-1.5 pr-3">{rc.naam}</td>
                  <td className="py-1.5 text-gray-500">
                    {rc.aantalOrganisaties > 0 ? `${rc.aantalOrganisaties} ${tenant.organisatieType.meervoud}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabs */}
      {latestVersie && (
        <div>
          <div className="text-sm font-semibold text-blue-700 border-b mb-4 pb-1">
            Details pakket: {pakket.naam} — Laatste versie: {latestVersie.naam} — Status:{" "}
            <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[latestVersie.status] || ""}`}>
              {latestVersie.status}
            </span>
          </div>

          <div className="flex gap-1 mb-4 overflow-x-auto">
            {["standaarden", "functionaliteit", "technologie", "testrapporten", ...(user ? ["reviews"] : [])].map((t) => (
              <Link
                key={t}
                href={`/pakketten/${slug}?tab=${t}`}
                scroll={false}
                className={`px-4 py-2 text-sm rounded-t border ${
                  tab === t
                    ? "bg-white border-b-white font-semibold"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Link>
            ))}
          </div>

          {tab === "standaarden" && (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-left">
                  <th scope="col" className="pb-2 pr-4 font-semibold">Standaard</th>
                  <th scope="col" className="pb-2 pr-4 font-semibold">Versie</th>
                  <th scope="col" className="pb-2 font-semibold">Compliancy</th>
                </tr>
              </thead>
              <tbody>
                {pakket.standaarden.map((ps) => (
                  <tr key={ps.standaardversieId} className="border-b border-gray-100">
                    <td className="py-1.5 pr-4">{ps.standaardversie.standaard.naam}</td>
                    <td className="py-1.5 pr-4 text-gray-600">{ps.standaardversie.naam}</td>
                    <td className="py-1.5">
                      {ps.compliancy === true
                        ? "✓ Compliant"
                        : ps.compliancy === false
                        ? "✗ Niet compliant"
                        : "—"}
                    </td>
                  </tr>
                ))}
                {pakket.standaarden.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 text-gray-500 italic">
                      Geen standaarden geregistreerd
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "functionaliteit" && (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-left">
                  <th scope="col" className="pb-2 pr-4 font-semibold">Applicatiefunctie</th>
                  <th scope="col" className="pb-2 font-semibold">Ondersteund</th>
                </tr>
              </thead>
              <tbody>
                {pakket.applicatiefuncties.map((af) => (
                  <tr key={af.applicatiefunctieId} className="border-b border-gray-100">
                    <td className="py-1.5 pr-4">{af.applicatiefunctie.naam}</td>
                    <td className="py-1.5">{af.ondersteund ? "✓" : "✗"}</td>
                  </tr>
                ))}
                {pakket.applicatiefuncties.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-3 text-gray-500 italic">
                      Geen applicatiefuncties geregistreerd
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "technologie" && (
            <div className="text-sm">
              {pakket.technologieen.length > 0 ? (
                <ul className="space-y-1">
                  {pakket.technologieen.map((t) => (
                    <li key={t.technologie} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      {t.technologie}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Geen technologieën geregistreerd</p>
              )}
            </div>
          )}

          {tab === "testrapporten" && (
            <div className="space-y-6">
              {pakket.versies.map((versie) => {
                const rapporten = versie.testrapporten;
                if (rapporten.length === 0) return null;
                return (
                  <div key={versie.id}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Versie: {versie.naam}
                    </h4>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300 text-left">
                          <th scope="col" className="pb-2 pr-4 font-semibold">Standaard</th>
                          <th scope="col" className="pb-2 pr-4 font-semibold">Status</th>
                          <th scope="col" className="pb-2 pr-4 font-semibold">Datum</th>
                          <th scope="col" className="pb-2 font-semibold">Rapport</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rapporten.map((tr) => (
                          <tr key={tr.id} className="border-b border-gray-100">
                            <td className="py-1.5 pr-4">{tr.standaard.naam}</td>
                            <td className="py-1.5 pr-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                  tr.status === "Voldoet"
                                    ? "bg-green-100 text-green-800"
                                    : tr.status === "Voldoet niet"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {tr.status}
                              </span>
                            </td>
                            <td className="py-1.5 pr-4 text-gray-600">
                              {tr.datumTest
                                ? tr.datumTest.toLocaleDateString("nl-NL")
                                : "—"}
                            </td>
                            <td className="py-1.5">
                              {tr.rapportUrl ? (
                                <a
                                  href={tr.rapportUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Bekijk rapport
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
              {pakket.versies.every((v) => v.testrapporten.length === 0) && (
                <p className="text-gray-500 italic text-sm">
                  Geen testrapporten beschikbaar
                </p>
              )}
            </div>
          )}

          {tab === "reviews" && user && (
            <ReviewsSection pakketId={pakket.id} user={user} />
          )}
        </div>
      )}

      {/* Geschiedenis timeline */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-blue-700 mb-4 border-b pb-2">
          Geschiedenis
        </h2>
        {timelineEvents.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            Geen wijzigingshistorie beschikbaar
          </p>
        ) : (
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-slate-700" />

            <div className="space-y-4">
              {timelineEvents.map((event) => (
                <div key={event.id} className="relative flex gap-3">
                  {/* Dot with icon */}
                  <div
                    className={`absolute -left-6 top-1 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      event.type === "create" || event.type === "versie"
                        ? "bg-green-100 border-green-400 text-green-600"
                        : event.type === "delete"
                        ? "bg-red-100 border-red-400 text-red-600"
                        : "bg-blue-100 border-blue-400 text-blue-600"
                    }`}
                  >
                    {event.type === "create" || event.type === "versie"
                      ? "+"
                      : event.type === "delete"
                      ? "-"
                      : "\u2191"}
                  </div>

                  {/* Content */}
                  <div className="pb-1">
                    <div className="text-sm font-medium text-gray-800 dark:text-slate-200">
                      {event.beschrijving}
                    </div>
                    {event.detail && (
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {event.detail}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                      {event.datum.toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Async server component for the reviews tab content.
 * Fetches review data and renders stats, radar chart, and review list.
 */
async function ReviewsSection({
  pakketId,
  user,
}: {
  pakketId: string;
  user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;
}) {
  const [reviews, stats, myReview] = await Promise.all([
    getReviewsForPakket(pakketId),
    getReviewStats(pakketId),
    user.organisatieId ? getMyReview(pakketId, user.organisatieId) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-8">
      {/* Stats + Radar chart */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ReviewStats
            avg={stats.avg}
            count={stats.count}
            avgGebruiksgemak={stats.avgGebruiksgemak}
            avgOndersteuning={stats.avgOndersteuning}
            avgPrijsKwaliteit={stats.avgPrijsKwaliteit}
            avgStandaardenSupport={stats.avgStandaardenSupport}
            distribution={stats.distribution}
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Overzicht deelscores
          </h4>
          <RadarChart
            gebruiksgemak={stats.avgGebruiksgemak}
            ondersteuning={stats.avgOndersteuning}
            prijsKwaliteit={stats.avgPrijsKwaliteit}
            standaardenSupport={stats.avgStandaardenSupport}
          />
        </div>
      </div>

      {/* Review list */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-t pt-4 dark:border-gray-700">
          Alle reviews ({stats.count})
        </h4>
        <ReviewList
          reviews={reviews.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          }))}
          pakketId={pakketId}
          userOrganisatieId={user.organisatieId}
          isLoggedIn={true}
          myReview={myReview}
        />
      </div>
    </div>
  );
}
