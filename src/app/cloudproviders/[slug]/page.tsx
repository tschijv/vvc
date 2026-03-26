import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/data/prisma";
import { getCloudproviderBySlug } from "@/service/cloudprovider";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import ShareButton from "@/ui/components/ShareButton";
import FavorietButton from "@/ui/components/FavorietButton";
import QRCode from "@/ui/components/QRCode";
import { tenant } from "@/process/tenant-config";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Color mapping for certification badges */
function certBadgeClass(cert: string): string {
  const c = cert.trim().toLowerCase();
  if (c.includes("bio") || c.includes("nen 7510")) {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }
  if (c.includes("iso")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cp = await prisma.cloudprovider.findUnique({ where: { slug } });
  if (!cp) return {};
  return {
    title: cp.naam,
    description: `${cp.naam} — cloud-provider in de ${tenant.naam}`,
    openGraph: {
      title: cp.naam,
      description: `${cp.naam} — cloud-provider in de ${tenant.naam}`,
    },
  };
}

export default async function CloudproviderDetailPage({ params }: Props) {
  const { slug } = await params;
  const cloudprovider = await getCloudproviderBySlug(slug);
  if (!cloudprovider) notFound();

  const certificeringen = cloudprovider.certificeringen
    ? cloudprovider.certificeringen.split(",").map((c) => c.trim())
    : [];

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Cloud-providers", href: "/cloudproviders" },
          { label: cloudprovider.naam, href: `/cloudproviders/${slug}` },
        ]}
      />

      {/* Header card */}
      <div className="border rounded p-5 mb-6 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">{cloudprovider.naam}</h1>
          <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {cloudprovider.type}
          </span>
          <ShareButton />
          <FavorietButton entityType="cloudprovider" entityId={cloudprovider.id} />
          <QRCode url={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/cloudproviders/${slug}`} title={cloudprovider.naam} />
        </div>

        {cloudprovider.beschrijving && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{cloudprovider.beschrijving}</p>
        )}

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {cloudprovider.contactpersoon && (
            <div><span className="text-gray-500 dark:text-gray-400">Contactpersoon:</span> {cloudprovider.contactpersoon}</div>
          )}
          {cloudprovider.email && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">E-mail:</span>{" "}
              <a href={`mailto:${cloudprovider.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {cloudprovider.email}
              </a>
            </div>
          )}
          {cloudprovider.telefoon && (
            <div><span className="text-gray-500 dark:text-gray-400">Telefoon:</span> {cloudprovider.telefoon}</div>
          )}
          {cloudprovider.website && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Website:</span>{" "}
              <a href={cloudprovider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                {cloudprovider.website}
              </a>
            </div>
          )}
          {cloudprovider.datacenterLocatie && (
            <div><span className="text-gray-500 dark:text-gray-400">Datacenter locatie:</span> {cloudprovider.datacenterLocatie}</div>
          )}
        </div>

        {/* Certificeringen badges */}
        {certificeringen.length > 0 && (
          <div className="mt-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Certificeringen:</span>{" "}
            <div className="flex flex-wrap gap-1 mt-1">
              {certificeringen.map((c) => (
                <span key={c} className={`inline-block text-xs px-2 py-0.5 rounded-full ${certBadgeClass(c)}`}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pakketten */}
      <h2 className="text-lg font-semibold mb-3 dark:text-gray-200">
        Pakketten ({cloudprovider.pakketten.length})
      </h2>
      {cloudprovider.pakketten.length > 0 ? (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600 text-left">
                <th scope="col" className="pb-2 pr-4 font-semibold">Pakket</th>
                <th scope="col" className="pb-2 font-semibold">Leverancier</th>
              </tr>
            </thead>
            <tbody>
              {cloudprovider.pakketten.map((cp) => (
                <tr key={cp.pakketId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-2 pr-4">
                    <Link href={`/pakketten/${cp.pakket.slug}`} className="text-blue-700 dark:text-blue-400 hover:underline">
                      {cp.pakket.naam}
                    </Link>
                  </td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">
                    <Link href={`/leveranciers/${cp.pakket.leverancier.slug}`} className="hover:underline">
                      {cp.pakket.leverancier.naam}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">Geen pakketten gekoppeld.</p>
      )}
    </div>
  );
}
