import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLeverancierBySlug } from "@/lib/services/leverancier";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const leverancier = await prisma.leverancier.findUnique({ where: { slug } });
  if (!leverancier) return {};
  return {
    title: leverancier.naam,
    description: `${leverancier.naam} — leverancier in de VNG Voorzieningencatalogus`,
    openGraph: {
      title: leverancier.naam,
      description: `${leverancier.naam} — leverancier in de VNG Voorzieningencatalogus`,
    },
  };
}

export default async function LeverancierDetailPage({ params }: Props) {
  const { slug } = await params;

  const leverancier = await getLeverancierBySlug(slug);

  if (!leverancier) notFound();

  return (
    <div>
      <div className="border rounded p-5 mb-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-3">{leverancier.naam}</h1>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {leverancier.contactpersoon && (
            <div><span className="text-gray-500">Contactpersoon:</span> {leverancier.contactpersoon}</div>
          )}
          {leverancier.email && (
            <div>
              <span className="text-gray-500">E-mail:</span>{" "}
              <a href={`mailto:${leverancier.email}`} className="text-blue-600 hover:underline">
                {leverancier.email}
              </a>
            </div>
          )}
          {leverancier.telefoon && (
            <div><span className="text-gray-500">Telefoon:</span> {leverancier.telefoon}</div>
          )}
          {leverancier.website && (
            <div>
              <span className="text-gray-500">Website:</span>{" "}
              <a href={leverancier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {leverancier.website}
              </a>
            </div>
          )}
        </div>
        {(leverancier.supportPortalUrl || leverancier.documentatieUrl || leverancier.kennisbankUrl) && (
          <div className="grid sm:grid-cols-2 gap-4 text-sm mt-3">
            {leverancier.supportPortalUrl && (
              <div>
                <span className="text-gray-500">Supportportaal:</span>{" "}
                <a href={leverancier.supportPortalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Openen
                </a>
              </div>
            )}
            {leverancier.documentatieUrl && (
              <div>
                <span className="text-gray-500">Documentatie:</span>{" "}
                <a href={leverancier.documentatieUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Openen
                </a>
              </div>
            )}
            {leverancier.kennisbankUrl && (
              <div>
                <span className="text-gray-500">Kennisbank:</span>{" "}
                <a href={leverancier.kennisbankUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Openen
                </a>
              </div>
            )}
          </div>
        )}
        {leverancier.beschrijvingDiensten && (
          <div className="mt-3 text-sm">
            <span className="text-gray-500">Diensten:</span>{" "}
            <span className="text-gray-700">{leverancier.beschrijvingDiensten}</span>
          </div>
        )}
        {leverancier.addenda.length > 0 && (
          <div className="mt-3 text-sm">
            <span className="text-gray-500">Ondertekende addenda:</span>{" "}
            {leverancier.addenda.map((a) => a.addendum.naam).join(", ")}
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-3">
        Pakketten ({leverancier.pakketten.length})
      </h2>
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="pb-2 pr-4 font-semibold">Pakket</th>
              <th className="pb-2 font-semibold">Laatste versie / status</th>
            </tr>
          </thead>
          <tbody>
            {leverancier.pakketten.map((p) => {
              const latest = p.versies[0];
              return (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-4">
                    <Link href={`/pakketten/${p.slug}`} className="text-blue-700 hover:underline">
                      {p.naam}
                    </Link>
                  </td>
                  <td className="py-2 text-gray-600">
                    {latest ? `${latest.naam} — ${latest.status}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
