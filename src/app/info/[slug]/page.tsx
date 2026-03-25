import type { Metadata } from "next";
import { prisma } from "@/data/prisma";
import { getSessionUser, canEditPagina } from "@/process/auth-helpers";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import GlossaryHighlighter from "@/ui/components/GlossaryHighlighter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pagina = await prisma.pagina.findUnique({ where: { slug } });
  if (!pagina) return {};
  return {
    title: pagina.titel,
    description: `${pagina.titel} — VNG Voorzieningencatalogus`,
    openGraph: {
      title: pagina.titel,
    },
  };
}

export default async function InfoPagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const pagina = await prisma.pagina.findUnique({
    where: { slug },
  });

  if (!pagina) {
    notFound();
  }

  const user = await getSessionUser();
  const magBewerken = canEditPagina(user);

  return (
    <div className="max-w-4xl">
      <Breadcrumbs items={[
        { label: "Informatie", href: "/info" },
        { label: pagina.titel, href: `/info/${slug}` },
      ]} />
      {magBewerken && (
        <div className="flex gap-2 mb-4">
          <Link
            href={`/info/${slug}/bewerken`}
            className="inline-flex items-center gap-1.5 text-sm bg-[#e35b10] text-white px-4 py-2 rounded hover:bg-[#c94d0c]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Bewerken
          </Link>
        </div>
      )}

      <h1 className="text-2xl font-bold text-[#1a6ca8] mb-6">{pagina.titel}</h1>

      <div className="cms-content text-gray-700">
        <GlossaryHighlighter html={pagina.inhoud} />
      </div>
    </div>
  );
}
