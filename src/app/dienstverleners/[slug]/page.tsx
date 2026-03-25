import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/data/prisma";
import { getDienstverlenerBySlug } from "@/service/dienstverlener";
import { getSessionUser } from "@/process/auth-helpers";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import ShareButton from "@/ui/components/ShareButton";
import FavorietButton from "@/ui/components/FavorietButton";
import QRCode from "@/ui/components/QRCode";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dv = await prisma.dienstverlener.findUnique({ where: { slug } });
  if (!dv) return {};
  return {
    title: dv.naam,
    description: `${dv.naam} — dienstverlener in de VNG Voorzieningencatalogus`,
    openGraph: {
      title: dv.naam,
      description: `${dv.naam} — dienstverlener in de VNG Voorzieningencatalogus`,
    },
  };
}

export default async function DienstverlenerDetailPage({ params }: Props) {
  const { slug } = await params;
  const dienstverlener = await getDienstverlenerBySlug(slug);
  if (!dienstverlener) notFound();

  const user = await getSessionUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Dienstverleners", href: "/dienstverleners" },
          { label: dienstverlener.naam, href: `/dienstverleners/${slug}` },
        ]}
      />

      {/* Header card */}
      <div className="border rounded p-5 mb-6 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">{dienstverlener.naam}</h1>
          <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {dienstverlener.type}
          </span>
          <ShareButton />
          <FavorietButton entityType="dienstverlener" entityId={dienstverlener.id} />
          <QRCode url={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/dienstverleners/${slug}`} title={dienstverlener.naam} />
          {isAdmin && (
            <Link
              href={`/admin/dienstverleners/${dienstverlener.id}`}
              className="ml-auto text-xs px-3 py-1 border rounded hover:bg-gray-50 text-[#1a6ca8] dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Bewerken
            </Link>
          )}
        </div>

        {dienstverlener.beschrijving && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{dienstverlener.beschrijving}</p>
        )}

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {dienstverlener.contactpersoon && (
            <div><span className="text-gray-500 dark:text-gray-400">Contactpersoon:</span> {dienstverlener.contactpersoon}</div>
          )}
          {dienstverlener.email && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">E-mail:</span>{" "}
              <a href={`mailto:${dienstverlener.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {dienstverlener.email}
              </a>
            </div>
          )}
          {dienstverlener.telefoon && (
            <div><span className="text-gray-500 dark:text-gray-400">Telefoon:</span> {dienstverlener.telefoon}</div>
          )}
          {dienstverlener.website && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Website:</span>{" "}
              <a href={dienstverlener.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                {dienstverlener.website}
              </a>
            </div>
          )}
          {dienstverlener.regio && (
            <div><span className="text-gray-500 dark:text-gray-400">Regio:</span> {dienstverlener.regio}</div>
          )}
        </div>

        {dienstverlener.specialisaties && (
          <div className="mt-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Specialisaties:</span>{" "}
            <div className="flex flex-wrap gap-1 mt-1">
              {dienstverlener.specialisaties.split(",").map((s) => (
                <span key={s.trim()} className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pakketten */}
      <h2 className="text-lg font-semibold mb-3 dark:text-gray-200">
        Pakketten ({dienstverlener.pakketten.length})
      </h2>
      {dienstverlener.pakketten.length > 0 ? (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600 text-left">
                <th scope="col" className="pb-2 pr-4 font-semibold">Pakket</th>
                <th scope="col" className="pb-2 font-semibold">Leverancier</th>
              </tr>
            </thead>
            <tbody>
              {dienstverlener.pakketten.map((dp) => (
                <tr key={dp.pakketId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-2 pr-4">
                    <Link href={`/pakketten/${dp.pakket.slug}`} className="text-blue-700 dark:text-blue-400 hover:underline">
                      {dp.pakket.naam}
                    </Link>
                  </td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">
                    <Link href={`/leveranciers/${dp.pakket.leverancier.slug}`} className="hover:underline">
                      {dp.pakket.leverancier.naam}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Geen pakketten gekoppeld.</p>
      )}

      {/* Klant-organisaties */}
      <h2 className="text-lg font-semibold mb-3 dark:text-gray-200">
        Klant-organisaties ({dienstverlener.organisaties.length})
      </h2>
      {dienstverlener.organisaties.length > 0 ? (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600 text-left">
                <th scope="col" className="pb-2 font-semibold">Organisatie</th>
              </tr>
            </thead>
            <tbody>
              {dienstverlener.organisaties.map((org) => (
                <tr key={org.organisatieId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-2">
                    <Link href={`/gemeenten/${org.organisatieId}`} className="text-blue-700 dark:text-blue-400 hover:underline">
                      {org.organisatie.naam}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">Geen klant-organisaties gekoppeld.</p>
      )}
    </div>
  );
}
