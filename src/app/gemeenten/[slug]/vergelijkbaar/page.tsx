import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/data/prisma";
import { getSimilarGemeenten } from "@/service/gemeente";
import { getSessionUser } from "@/process/auth-helpers";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import SortableTable from "./SortableTable";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const gemeente = await prisma.organisatie.findUnique({ where: { id: slug }, select: { naam: true } });
  if (!gemeente) return {};
  return {
    title: `Vergelijkbare gemeenten met ${gemeente.naam}`,
    description: `Overzicht van alle gemeenten met overlap in applicatielandschap met ${gemeente.naam}`,
  };
}

export default async function VergelijkbaarPage({ params }: Props) {
  const { slug } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  const gemeente = await prisma.organisatie.findUnique({ where: { id: slug }, select: { id: true, naam: true } });
  if (!gemeente) notFound();

  const { organisaties: similarOrganisaties, totalCount } = await getSimilarGemeenten(slug, 500);

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <Breadcrumbs
        items={[
          { label: "Gemeenten", href: "/gemeenten" },
          { label: gemeente.naam, href: `/gemeenten/${gemeente.id}` },
          { label: "Vergelijkbare gemeenten", href: `/gemeenten/${gemeente.id}/vergelijkbaar` },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Vergelijkbare gemeenten met {gemeente.naam}
        </h1>
        <p className="mt-2 text-sm text-gray-600 flex items-start gap-1.5">
          <span
            className="inline-flex items-center justify-center flex-shrink-0 w-4 h-4 rounded-full bg-[#1a6ca8] text-white text-[10px] text-center leading-4 mt-0.5 cursor-help"
            title="Jaccard-similariteit: overlap = gedeelde pakketten / totaal unieke pakketten van beide gemeenten samen."
          >
            i
          </span>
          <span>
            Overlap is berekend met Jaccard-similariteit: het aantal gedeelde pakketten gedeeld door het totaal aantal unieke pakketten van beide gemeenten samen. Hoe hoger het percentage, hoe meer overeenkomst in het applicatielandschap.
          </span>
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-green-600 text-white text-sm font-bold">
          {totalCount}
        </span>
        <span className="text-sm text-gray-700">gemeenten met minimaal 1 gedeeld pakket</span>
      </div>

      {similarOrganisaties.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          Geen vergelijkbare gemeenten gevonden.
        </div>
      ) : (
        <SortableTable gemeenten={similarOrganisaties} currentGemeenteId={gemeente.id} />
      )}
    </main>
  );
}
