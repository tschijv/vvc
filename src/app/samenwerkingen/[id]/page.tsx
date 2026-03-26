import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { notFound } from "next/navigation";
import {
  getSamenwerkingById,
  getSamenwerkingPakketten,
  getSamenwerkingKoppelingen,
  getSamenwerkingDashboardStats,
  type SamenwerkingPakketRow,
  type SamenwerkingKoppelingRow,
} from "@/service/samenwerking";
import { tenant } from "@/process/tenant-config";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function SamenwerkingDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = tab || "overzicht";

  const samenwerking = await getSamenwerkingById(id);
  if (!samenwerking) notFound();

  const stats = await getSamenwerkingDashboardStats(id);
  const pakketten =
    activeTab === "pakketten" ? await getSamenwerkingPakketten(id) : [];
  const koppelingen =
    activeTab === "koppelingen" ? await getSamenwerkingKoppelingen(id) : [];

  return (
    <div>
      <Breadcrumbs items={[
        { label: "Samenwerkingen", href: "/samenwerkingen" },
        { label: samenwerking.naam, href: `/samenwerkingen/${id}` },
      ]} />
      {/* Header */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <Link
              href="/samenwerkingen"
              className="text-sm text-[#1a6ca8] hover:underline"
            >
              ← Terug naar samenwerkingen
            </Link>
            <h1 className="text-2xl font-light text-[#1a6ca8] mt-2">
              {samenwerking.naam}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {samenwerking.type && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                  {samenwerking.type}
                </span>
              )}
              <span className="text-sm text-gray-500">
                {samenwerking.organisaties.length} {samenwerking.organisaties.length !== 1 ? tenant.organisatieType.meervoud : tenant.organisatieType.enkelvoud}
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            {samenwerking.contactpersoon && (
              <p className="font-medium">{samenwerking.contactpersoon}</p>
            )}
            {samenwerking.email && (
              <a
                href={`mailto:${samenwerking.email}`}
                className="text-[#1a6ca8] hover:underline block"
              >
                {samenwerking.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <TabLink
          href={`/samenwerkingen/${id}?tab=overzicht`}
          active={activeTab === "overzicht"}
          label="Overzicht"
        />
        <TabLink
          href={`/samenwerkingen/${id}?tab=pakketten`}
          active={activeTab === "pakketten"}
          label="Pakketten"
          count={stats.totaalPakketten}
        />
        <TabLink
          href={`/samenwerkingen/${id}?tab=koppelingen`}
          active={activeTab === "koppelingen"}
          label="Koppelingen"
          count={stats.totaalKoppelingen}
        />
      </div>

      {/* Tab content */}
      {activeTab === "overzicht" && (
        <OverzichtTab
          samenwerking={samenwerking}
          stats={stats}
          id={id}
        />
      )}

      {activeTab === "pakketten" && (
        <PakkettenTab pakketten={pakketten} />
      )}

      {activeTab === "koppelingen" && (
        <KoppelingenTab koppelingen={koppelingen} />
      )}
    </div>
  );
}

function TabLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
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
        <span
          className={`ml-1.5 text-xs px-1.5 py-0.5 rounded ${
            active
              ? "bg-[#1a6ca8] text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function OverzichtTab({
  samenwerking,
  stats,
  id,
}: {
  samenwerking: NonNullable<Awaited<ReturnType<typeof getSamenwerkingById>>>;
  stats: Awaited<ReturnType<typeof getSamenwerkingDashboardStats>>;
  id: string;
}) {
  return (
    <div className="space-y-6">
      {/* Statistieken */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label={tenant.organisatieType.meervoudCapitaal}
          value={stats.organisatieCount}
          color="bg-[#1a6ca8]"
        />
        <StatCard
          label="Pakketten"
          value={stats.totaalPakketten}
          color="bg-[#e35b10]"
          href={`/samenwerkingen/${id}?tab=pakketten`}
        />
        <StatCard
          label="Koppelingen"
          value={stats.totaalKoppelingen}
          color="bg-[#1a6ca8]"
          href={`/samenwerkingen/${id}?tab=koppelingen`}
        />
        <StatCard
          label="Compliant"
          value={stats.compliantCount}
          color="bg-green-600"
        />
      </div>

      {/* Deelnemende gemeenten */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-[#1a6ca8] mb-3">
          Deelnemende {tenant.organisatieType.meervoud} ({samenwerking.organisaties.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {samenwerking.organisaties.map((sg) => (
            <Link
              key={sg.organisatieId}
              href={`/gemeenten/${encodeURIComponent(
                sg.organisatie.naam
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
              )}`}
              className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded px-3 py-2 text-sm transition"
            >
              <span className="text-[#1a6ca8] font-medium">
                {sg.organisatie.naam}
              </span>
              <span className="text-xs text-gray-400">
                {sg.organisatie._count.pakketten} pakketten
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: number;
  color: string;
  href?: string;
}) {
  const content = (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 ${href ? "hover:shadow-sm cursor-pointer" : ""}`}
    >
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded ${color} text-white text-sm font-bold`}
        >
          {value}
        </span>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function PakkettenTab({
  pakketten,
}: {
  pakketten: SamenwerkingPakketRow[];
}) {
  // Group by gemeente
  const byGemeente = new Map<string, SamenwerkingPakketRow[]>();
  for (const p of pakketten) {
    const list = byGemeente.get(p.organisatieNaam) || [];
    list.push(p);
    byGemeente.set(p.organisatieNaam, list);
  }

  const gemeenteNames = Array.from(byGemeente.keys()).sort();

  return (
    <div className="space-y-6">
      {gemeenteNames.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          Geen pakketten geregistreerd bij de deelnemende {tenant.organisatieType.meervoud}.
        </p>
      ) : (
        gemeenteNames.map((naam) => {
          const items = byGemeente.get(naam)!;
          return (
            <div key={naam}>
              <h3 className="text-base font-semibold text-[#1a6ca8] mb-2">
                {naam}{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({items.length} pakketten)
                </span>
              </h3>
              <table className="w-full text-sm border-collapse mb-4">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-left">
                    <th scope="col" className="pb-2 pr-4 font-semibold">Leverancier</th>
                    <th scope="col" className="pb-2 pr-4 font-semibold">
                      Pakketnaam en -versie
                    </th>
                    <th scope="col" className="pb-2 pr-4 font-semibold">Status</th>
                    <th scope="col" className="pb-2 font-semibold">Gebruikt voor</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-gray-50 align-top"
                    >
                      <td className="py-3 pr-4 text-gray-700">
                        {p.leverancier}
                      </td>
                      <td className="py-3 pr-4">
                        <Link
                          href={`/pakketten/${p.pakketSlug}`}
                          className="text-[#1a6ca8] hover:underline"
                        >
                          {p.pakketNaam} {p.versie}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {p.status || "In productie"}
                        {p.datumIngangStatus && (
                          <div className="text-xs text-gray-400">
                            {new Date(
                              p.datumIngangStatus
                            ).toLocaleDateString("nl-NL")}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-gray-600 text-xs leading-relaxed">
                        {p.gebruiktVoor.join(", ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}

function KoppelingenTab({
  koppelingen,
}: {
  koppelingen: SamenwerkingKoppelingRow[];
}) {
  // Group by gemeente
  const byGemeente = new Map<string, SamenwerkingKoppelingRow[]>();
  for (const k of koppelingen) {
    const list = byGemeente.get(k.organisatieNaam) || [];
    list.push(k);
    byGemeente.set(k.organisatieNaam, list);
  }

  const gemeenteNames = Array.from(byGemeente.keys()).sort();

  return (
    <div className="space-y-6">
      {gemeenteNames.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          Geen koppelingen geregistreerd bij de deelnemende {tenant.organisatieType.meervoud}.
        </p>
      ) : (
        gemeenteNames.map((naam) => {
          const items = byGemeente.get(naam)!;
          return (
            <div key={naam}>
              <h3 className="text-base font-semibold text-[#1a6ca8] mb-2">
                {naam}{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({items.length} koppelingen)
                </span>
              </h3>
              <table className="w-full text-sm border-collapse mb-4">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-left">
                    <th scope="col" className="pb-2 pr-4 font-semibold">
                      Pakketversie/Extern
                    </th>
                    <th scope="col" className="pb-2 pr-4 font-semibold text-center">
                      Koppeling
                    </th>
                    <th scope="col" className="pb-2 pr-4 font-semibold">
                      Pakketversie/Extern
                    </th>
                    <th scope="col" className="pb-2 pr-4 font-semibold">Status</th>
                    <th scope="col" className="pb-2 font-semibold">Standaard</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((k, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 pr-4 text-gray-700">{k.bron}</td>
                      <td className="py-3 pr-4 text-center text-lg">
                        {k.richting}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{k.doel}</td>
                      <td className="py-3 pr-4 text-gray-600">
                        {k.status || "—"}
                      </td>
                      <td className="py-3 text-gray-600">
                        {k.standaard || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}
