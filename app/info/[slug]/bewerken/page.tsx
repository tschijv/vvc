import { prisma } from "@/lib/prisma";
import { getSessionUser, canEditPagina } from "@/lib/auth-helpers";
import { notFound, redirect } from "next/navigation";
import PaginaEditor from "./PaginaEditor";

export default async function BewerkPagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await getSessionUser();
  if (!canEditPagina(user)) {
    redirect(`/info/${slug}`);
  }

  const pagina = await prisma.pagina.findUnique({
    where: { slug },
  });

  if (!pagina) {
    notFound();
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a6ca8]">
          Pagina bewerken
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Slug: /info/{slug}
        </p>
      </div>

      <PaginaEditor
        slug={pagina.slug}
        titel={pagina.titel}
        inhoud={pagina.inhoud}
      />
    </div>
  );
}
