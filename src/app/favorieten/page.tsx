import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/process/auth-helpers";
import { prisma } from "@/data/prisma";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { tenant } from "@/process/tenant-config";

export const metadata: Metadata = {
  title: "Mijn favorieten",
};

export default async function FavorietenPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login?callbackUrl=/favorieten");

  const favorieten = await prisma.favoriet.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Resolve names for each favoriet
  const items: { id: string; type: string; naam: string; href: string; createdAt: Date }[] = [];

  const pakketIds = favorieten.filter((f) => f.entityType === "pakket").map((f) => f.entityId);
  const organisatieIds = favorieten.filter((f) => f.entityType === "gemeente").map((f) => f.entityId);
  const leverancierIds = favorieten.filter((f) => f.entityType === "leverancier").map((f) => f.entityId);

  const [pakketten, gemeenten, leveranciers] = await Promise.all([
    pakketIds.length > 0
      ? prisma.pakket.findMany({ where: { id: { in: pakketIds } }, select: { id: true, naam: true, slug: true } })
      : [],
    organisatieIds.length > 0
      ? prisma.organisatie.findMany({ where: { id: { in: organisatieIds } }, select: { id: true, naam: true } })
      : [],
    leverancierIds.length > 0
      ? prisma.leverancier.findMany({ where: { id: { in: leverancierIds } }, select: { id: true, naam: true, slug: true } })
      : [],
  ]);

  const pakketMap = new Map(pakketten.map((p) => [p.id, p]));
  const gemeenteMap = new Map(gemeenten.map((g) => [g.id, g]));
  const leverancierMap = new Map(leveranciers.map((l) => [l.id, l]));

  for (const f of favorieten) {
    if (f.entityType === "pakket") {
      const p = pakketMap.get(f.entityId);
      if (p) items.push({ id: f.id, type: "Pakket", naam: p.naam, href: `/pakketten/${p.slug}`, createdAt: f.createdAt });
    } else if (f.entityType === "gemeente") {
      const g = gemeenteMap.get(f.entityId);
      if (g) items.push({ id: f.id, type: tenant.organisatieType.capitaal, naam: g.naam, href: `/gemeenten/${g.id}`, createdAt: f.createdAt });
    } else if (f.entityType === "leverancier") {
      const l = leverancierMap.get(f.entityId);
      if (l) items.push({ id: f.id, type: "Leverancier", naam: l.naam, href: `/leveranciers/${l.slug}`, createdAt: f.createdAt });
    }
  }

  const typeLabels: Record<string, string> = {
    Pakket: "bg-blue-100 text-blue-800",
    [tenant.organisatieType.capitaal]: "bg-green-100 text-green-800",
    Leverancier: "bg-purple-100 text-purple-800",
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Mijn favorieten", href: "/favorieten" }]} />
      <h1 className="text-2xl font-bold text-[#1a6ca8] dark:text-blue-400 mb-4">Mijn favorieten</h1>

      {items.length === 0 ? (
        <div className="border rounded p-6 text-center text-gray-500 dark:text-gray-400">
          <p>Je hebt nog geen favorieten.</p>
          <p className="text-sm mt-1">
            Klik op het hartje bij een pakket, {tenant.organisatieType.enkelvoud} of leverancier om deze als favoriet op te slaan.
          </p>
        </div>
      ) : (
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left bg-gray-50">
                <th scope="col" className="px-4 py-2 font-semibold">Naam</th>
                <th scope="col" className="px-4 py-2 font-semibold">Type</th>
                <th scope="col" className="px-4 py-2 font-semibold hidden sm:table-cell">Toegevoegd</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link href={item.href} className="text-blue-700 hover:underline">
                      {item.naam}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeLabels[item.type] || ""}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 hidden sm:table-cell">
                    {item.createdAt.toLocaleDateString("nl-NL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
