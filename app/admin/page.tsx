import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import { getPendingRegistrationCount } from "@/lib/services/user";
import GemmaSyncPanel from "./GemmaSyncPanel";
import BegrippenSyncPanel from "./BegrippenSyncPanel";
import ApiDocPanel from "./ApiDocPanel";
import DeployPanel from "./DeployPanel";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const pendingCount = await getPendingRegistrationCount();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Beheer</h1>

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {/* Gebruikersbeheer */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold text-gray-800 whitespace-nowrap">Gebruikersbeheer</span>
            <span className="text-sm text-gray-500 truncate hidden sm:inline">Beheer accounts, rollen en autorisaties</span>
          </div>
          <Link
            href="/admin/gebruikers"
            className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap ml-4"
          >
            Beheren →
          </Link>
        </div>

        {/* Registraties */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold text-gray-800 whitespace-nowrap">Registraties</span>
            <span className="text-sm text-gray-500 truncate hidden sm:inline">Beoordeel aanmeldingen van nieuwe leveranciers en gemeenten</span>
            {pendingCount > 0 && (
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                {pendingCount} wachtend
              </span>
            )}
          </div>
          <Link
            href="/admin/registraties"
            className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap ml-4"
          >
            Bekijken →
          </Link>
        </div>

        {/* Data importeren */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold text-gray-800 whitespace-nowrap">Data importeren</span>
            <span className="text-sm text-gray-500 truncate hidden sm:inline">Upload CSV, JSON of Excel om pakketten te synchroniseren</span>
          </div>
          <Link
            href="/upload"
            className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap ml-4"
          >
            Importeren →
          </Link>
        </div>

        {/* Gemeente samenvoegen */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold text-gray-800 whitespace-nowrap">Gemeente samenvoegen</span>
            <span className="text-sm text-gray-500 truncate hidden sm:inline">Voeg gemeenten samen bij een herindeling</span>
          </div>
          <Link
            href="/admin/gemeenten/samenvoegen"
            className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap ml-4"
          >
            Samenvoegen →
          </Link>
        </div>

        {/* Audit log */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold text-gray-800 dark:text-slate-200 whitespace-nowrap">Audit log</span>
            <span className="text-sm text-gray-500 truncate hidden sm:inline">Logging van alle gebruikersactiviteiten</span>
          </div>
          <Link
            href="/admin/auditlog"
            className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap ml-4"
          >
            Bekijken →
          </Link>
        </div>

        {/* Statistieken */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold text-gray-800 dark:text-slate-200 whitespace-nowrap">Statistieken</span>
            <span className="text-sm text-gray-500 truncate hidden sm:inline">Platformbrede gebruiksstatistieken</span>
          </div>
          <Link
            href="/admin/statistieken"
            className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap ml-4"
          >
            Bekijken →
          </Link>
        </div>

        {/* Regeneratie-prompt */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold text-gray-800 whitespace-nowrap">Regeneratie-prompt</span>
            <span className="text-sm text-gray-500 truncate hidden sm:inline">Prompt om de applicatie opnieuw te genereren met AI</span>
          </div>
          <Link
            href="/admin/prompt"
            className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap ml-4"
          >
            Bekijken →
          </Link>
        </div>

        {/* Datamodel (MIM) */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold text-gray-800 whitespace-nowrap">Datamodel (MIM)</span>
            <span className="text-sm text-gray-500 truncate hidden sm:inline">Logisch informatiemodel conform MIM 1.2</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
              20 objecttypen
            </span>
          </div>
          <Link
            href="/admin/datamodel"
            className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap ml-4"
          >
            Bekijken →
          </Link>
        </div>

        {/* Datamigratie-mapping */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold text-gray-800 whitespace-nowrap">Datamigratie</span>
            <span className="text-sm text-gray-500 truncate hidden sm:inline">Mapping van Drupal CSV-exports naar Prisma-schema</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
              6 bronbestanden
            </span>
          </div>
          <Link
            href="/admin/migratie"
            className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap ml-4"
          >
            Bekijken →
          </Link>
        </div>

        {/* PvE-analyse */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-semibold text-gray-800 whitespace-nowrap">PvE-analyse</span>
            <span className="text-sm text-gray-500 truncate hidden sm:inline">104 eisen en wensen geanalyseerd</span>
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
              64% afgedekt
            </span>
          </div>
          <Link
            href="/admin/pve-analyse"
            className="text-sm text-[#1a6ca8] hover:underline font-medium whitespace-nowrap ml-4"
          >
            Bekijken →
          </Link>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <GemmaSyncPanel />
        <BegrippenSyncPanel />
        <ApiDocPanel />
        {process.env.NODE_ENV === "development" && <DeployPanel />}
      </div>
    </div>
  );
}
