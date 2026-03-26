import { redirect } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { getSessionUser } from "@/process/auth-helpers";
import { prisma } from "@/data/prisma";
import type { Metadata } from "next";
import { tenant } from "@/process/tenant-config";

export const metadata: Metadata = {
  title: "Statistieken",
};

export default async function StatistiekenPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  const [
    aantalOrganisaties,
    aantalLeveranciers,
    aantalPakketten,
    aantalPakketversies,
    aantalReferentiecomponenten,
    aantalStandaarden,
    aantalKoppelingen,
    aantalSamenwerkingen,
    aantalGebruikers,
    topPakketten,
    topLeveranciers,
    recenteActiviteit,
  ] = await Promise.all([
    prisma.organisatie.count(),
    prisma.leverancier.count(),
    prisma.pakket.count(),
    prisma.pakketversie.count(),
    prisma.referentiecomponent.count(),
    prisma.standaard.count(),
    prisma.koppeling.count(),
    prisma.samenwerking.count(),
    prisma.user.count({ where: { actief: true } }),
    prisma.pakket.findMany({
      select: { naam: true, slug: true, aantalOrganisaties: true, leverancier: { select: { naam: true } } },
      orderBy: { aantalOrganisaties: "desc" },
      take: 10,
    }),
    prisma.leverancier.findMany({
      select: { naam: true, slug: true, _count: { select: { pakketten: true } } },
      orderBy: { pakketten: { _count: "desc" } },
      take: 10,
    }),
    prisma.organisatie.findMany({
      where: { lastActivity: { not: null } },
      select: { naam: true, id: true, lastActivity: true },
      orderBy: { lastActivity: "desc" },
      take: 10,
    }),
  ]);

  const stats = [
    { label: tenant.organisatieType.meervoudCapitaal, value: aantalOrganisaties },
    { label: "Leveranciers", value: aantalLeveranciers },
    { label: "Pakketten", value: aantalPakketten },
    { label: "Pakketversies", value: aantalPakketversies },
    { label: "Referentiecomponenten", value: aantalReferentiecomponenten },
    { label: "Standaarden", value: aantalStandaarden },
    { label: "Koppelingen", value: aantalKoppelingen },
    { label: "Samenwerkingen", value: aantalSamenwerkingen },
    { label: "Actieve gebruikers", value: aantalGebruikers },
  ];

  return (
    <div className="max-w-5xl">
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Statistieken", href: "/admin/statistieken" },
      ]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#1a6ca8]">Platformstatistieken</h1>
      </div>

      {/* Overview grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[#1a6ca8]">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top pakketten */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 mb-3">Top 10 meest gebruikte pakketten</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-600 text-left">
                <th scope="col" className="pb-1.5 font-medium text-gray-500 dark:text-slate-400">#</th>
                <th scope="col" className="pb-1.5 font-medium text-gray-500 dark:text-slate-400">Pakket</th>
                <th scope="col" className="pb-1.5 font-medium text-gray-500 dark:text-slate-400">Leverancier</th>
                <th scope="col" className="pb-1.5 font-medium text-gray-500 dark:text-slate-400 text-right">{tenant.organisatieType.meervoudCapitaal}</th>
              </tr>
            </thead>
            <tbody>
              {topPakketten.map((p, i) => (
                <tr key={p.slug} className="border-b border-gray-50 dark:border-slate-700">
                  <td className="py-1.5 text-gray-400">{i + 1}</td>
                  <td className="py-1.5">
                    <Link href={`/pakketten/${p.slug}`} className="text-[#1a6ca8] hover:underline">{p.naam}</Link>
                  </td>
                  <td className="py-1.5 text-gray-600 dark:text-slate-400">{p.leverancier.naam}</td>
                  <td className="py-1.5 text-right font-medium">{p.aantalOrganisaties}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top leveranciers */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 mb-3">Top 10 leveranciers (meeste pakketten)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-600 text-left">
                <th scope="col" className="pb-1.5 font-medium text-gray-500 dark:text-slate-400">#</th>
                <th scope="col" className="pb-1.5 font-medium text-gray-500 dark:text-slate-400">Leverancier</th>
                <th scope="col" className="pb-1.5 font-medium text-gray-500 dark:text-slate-400 text-right">Pakketten</th>
              </tr>
            </thead>
            <tbody>
              {topLeveranciers.map((l, i) => (
                <tr key={l.slug} className="border-b border-gray-50 dark:border-slate-700">
                  <td className="py-1.5 text-gray-400">{i + 1}</td>
                  <td className="py-1.5">
                    <Link href={`/leveranciers/${l.slug}`} className="text-[#1a6ca8] hover:underline">{l.naam}</Link>
                  </td>
                  <td className="py-1.5 text-right font-medium">{l._count.pakketten}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recente activiteit */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 md:col-span-2">
          <h2 className="font-semibold text-gray-800 dark:text-slate-200 mb-3">Recente activiteit {tenant.organisatieType.meervoud}</h2>
          {recenteActiviteit.length === 0 ? (
            <p className="text-sm text-gray-500">Geen activiteit geregistreerd.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {recenteActiviteit.map((g) => (
                <div key={g.id} className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-700">
                  <Link href={`/gemeenten/${g.id}`} className="text-[#1a6ca8] hover:underline">{g.naam}</Link>
                  <span className="text-gray-500 dark:text-slate-400">{g.lastActivity!.toLocaleDateString("nl-NL")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
