import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/process/auth-helpers";
import { getPendingRegistrationCount } from "@/service/user";
import { computePveStats } from "./pve-analyse/pve-data";
import GemmaSyncPanel from "./GemmaSyncPanel";
import BegrippenSyncPanel from "./BegrippenSyncPanel";
import ApiDocPanel from "./ApiDocPanel";
import DeployPanel from "./DeployPanel";
import TestRunnerPanel from "./TestRunnerPanel";
import AnonymizePanel from "./AnonymizePanel";
import NpmHealthPanel from "./NpmHealthPanel";

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-3 first:mt-0">
      {title}
    </h2>
  );
}

function AdminRow({
  label,
  description,
  href,
  linkText = "Bekijken →",
  badge,
  badgeColor = "blue",
}: {
  label: string;
  description: string;
  href: string;
  linkText?: string;
  badge?: string;
  badgeColor?: "blue" | "green" | "orange";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-4 min-w-0">
        <span className="font-semibold text-gray-800 whitespace-nowrap">{label}</span>
        <span className="text-sm text-gray-500 truncate hidden sm:inline">{description}</span>
        {badge && (
          <span className={`${colors[badgeColor]} px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap`}>
            {badge}
          </span>
        )}
      </div>
      <Link
        href={href}
        className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap ml-4"
      >
        {linkText}
      </Link>
    </div>
  );
}

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const pendingCount = await getPendingRegistrationCount();
  const pveStats = computePveStats();

  return (
    <div>
      <Breadcrumbs items={[{ label: "Beheer", href: "/admin" }]} />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Beheer</h1>
      <p className="text-sm text-gray-500 mb-6">Beheerdashboard voor de Voorzieningencatalogus</p>

      {/* ─── Gebruikers & Toegang ─── */}
      <SectionHeader title="Gebruikers & Toegang" />
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        <AdminRow
          label="Gebruikersbeheer"
          description="Beheer accounts, rollen en autorisaties"
          href="/admin/gebruikers"
          linkText="Beheren →"
        />
        <AdminRow
          label="Registraties"
          description="Beoordeel aanmeldingen van nieuwe leveranciers en gemeenten"
          href="/admin/registraties"
          badge={pendingCount > 0 ? `${pendingCount} wachtend` : undefined}
          badgeColor="orange"
        />
        <AdminRow
          label="Audit log"
          description="Logging van alle gebruikersactiviteiten"
          href="/admin/auditlog"
        />
      </div>

      {/* ─── Data & Synchronisatie ─── */}
      <SectionHeader title="Data & Synchronisatie" />
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 mb-4">
        <AdminRow
          label="Data importeren"
          description="Upload CSV, JSON of Excel om pakketten te synchroniseren"
          href="/upload"
          linkText="Importeren →"
        />
        <AdminRow
          label="Gemeente samenvoegen"
          description="Voeg gemeenten samen bij een herindeling"
          href="/admin/gemeenten/samenvoegen"
          linkText="Samenvoegen →"
        />
      </div>
      <div className="space-y-4">
        <GemmaSyncPanel />
        <BegrippenSyncPanel />
        <AnonymizePanel />
      </div>

      {/* ─── Analyse & Documentatie ─── */}
      <SectionHeader title="Analyse & Documentatie" />
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        <AdminRow
          label="PvE-analyse"
          description={`${pveStats.total} eisen en wensen geanalyseerd`}
          href="/admin/pve-analyse"
          badge={`${pveStats.coveragePercent}% afgedekt`}
          badgeColor="green"
        />
        <AdminRow
          label="Datamodel (MIM)"
          description="Logisch informatiemodel conform MIM 1.2"
          href="/admin/datamodel"
          badge="30 modellen"
          badgeColor="blue"
        />
        <AdminRow
          label="Datamigratie"
          description="Mapping van Drupal CSV-exports naar Prisma-schema"
          href="/admin/migratie"
          badge="6 bronbestanden"
          badgeColor="blue"
        />
        <AdminRow
          label="Demo draaiboek"
          description="Stapsgewijs draaiboek met links voor een live demo"
          href="/admin/demo"
          badge="22 onderdelen"
          badgeColor="orange"
        />
        <AdminRow
          label="Linked Data (RDF)"
          description="Publiceer en verken data als JSON-LD, Turtle en RDF/XML"
          href="/admin/linked-data"
          badge="3 formaten"
          badgeColor="blue"
        />
        <AdminRow
          label="Regeneratie-prompt"
          description="Prompt om de applicatie opnieuw te genereren met AI"
          href="/admin/prompt"
        />
        <AdminRow
          label="Technische handleiding"
          description="Architectuur, deployment, beveiliging en troubleshooting"
          href="/admin/handleiding"
          badge="15 onderwerpen"
          badgeColor="blue"
        />
      </div>

      {/* ─── Systeem ─── */}
      <SectionHeader title="Systeem" />
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          <AdminRow
            label="Statistieken"
            description="Platformbrede gebruiksstatistieken"
            href="/admin/statistieken"
          />
        </div>
        <ApiDocPanel />
        <NpmHealthPanel />
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 mt-4">
          <AdminRow
            label="Dependency-analyse"
            description="Overzicht van alle npm packages: veiligheid, licenties, doel en grootte"
            href="/admin/dependencies"
            linkText="Analyseren →"
          />
        </div>
        {process.env.NODE_ENV === "development" && <DeployPanel />}
        {process.env.NODE_ENV === "development" && <TestRunnerPanel />}
      </div>
    </div>
  );
}
