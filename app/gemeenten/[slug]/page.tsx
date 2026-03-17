import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGemeenteById, getGemeenteHistorie } from "@/lib/services/gemeente";
import {
  getSessionUser,
  canViewGemeentePortfolio,
  canViewGemeenteContact,
  filterGemeentePakketten,
} from "@/lib/auth-helpers";
import AIAdviseur from "./AIAdviseur";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const gemeente = await prisma.gemeente.findUnique({ where: { id: slug } });
  if (!gemeente) return {};
  return {
    title: gemeente.naam,
    description: `${gemeente.naam} — gemeente in de VNG Voorzieningencatalogus`,
    openGraph: {
      title: gemeente.naam,
      description: `Applicatieportfolio en voortgang van ${gemeente.naam}`,
    },
  };
}

export default async function GemeenteDetailPage({ params }: Props) {
  const { slug } = await params;
  const user = await getSessionUser();

  const gemeente = await getGemeenteById(slug);

  if (!gemeente) notFound();

  const showContact = canViewGemeenteContact(user);
  const showPortfolio = canViewGemeentePortfolio(user);
  const visiblePakketten = showPortfolio
    ? filterGemeentePakketten(user, gemeente.pakketten)
    : [];

  const isLeverancier = user?.role === "LEVERANCIER";

  const historie = showPortfolio ? await getGemeenteHistorie(slug) : [];

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Link href="/gemeenten" className="text-sm text-blue-600 hover:underline">
            ← Terug naar gemeenten
          </Link>
          {showPortfolio && (
            <Link
              href={`/gemeenten/vergelijk?a=${slug}`}
              className="text-sm text-[#1a6ca8] border border-[#1a6ca8] rounded px-3 py-1 hover:bg-blue-50"
            >
              Vergelijk →
            </Link>
          )}
        </div>
        <h1 className="text-2xl font-bold text-[#1a6ca8] mt-2">{gemeente.naam}</h1>
        {gemeente.cbsCode && (
          <p className="text-sm text-gray-500 mt-0.5">CBS-code: {gemeente.cbsCode}</p>
        )}
      </div>

      {/* Contactgegevens */}
      {showContact && (
        <div className="bg-gray-50 rounded p-4 mb-6 text-sm">
          <h2 className="font-semibold text-gray-800 mb-2">Contactgegevens</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
            <dt className="text-gray-500">Contactpersoon</dt>
            <dd>{gemeente.contactpersoon || "—"}</dd>
            <dt className="text-gray-500">E-mail</dt>
            <dd>
              {gemeente.email ? (
                <a href={`mailto:${gemeente.email}`} className="text-blue-600 hover:underline">
                  {gemeente.email}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </dl>
        </div>
      )}

      {/* Voortgang */}
      <div className="bg-gray-50 rounded p-4 mb-6 text-sm">
        <h2 className="font-semibold text-gray-800 mb-2">Voortgang</h2>
        <div className="flex items-center gap-2">
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#1a6ca8] h-2 rounded-full"
              style={{ width: `${Math.min(gemeente.progress, 100)}%` }}
            />
          </div>
          <span className="text-gray-700">{gemeente.progress}%</span>
        </div>
        {gemeente.lastActivity && (
          <p className="text-gray-500 mt-1">
            Laatste activiteit: {new Date(gemeente.lastActivity).toLocaleDateString("nl-NL")}
          </p>
        )}
      </div>

      {/* Applicatieportfolio */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Applicatieportfolio
          {showPortfolio && ` (${visiblePakketten.length})`}
        </h2>

        {!showPortfolio ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm">
            <p className="text-yellow-800">
              <span className="font-semibold">Inloggen vereist.</span>{" "}
              <Link href={`/auth/login?callbackUrl=/gemeenten/${slug}`} className="text-[#1a6ca8] hover:underline">
                Log in
              </Link>{" "}
              om het applicatieportfolio te bekijken.
            </p>
          </div>
        ) : visiblePakketten.length > 0 ? (
          <>
            {isLeverancier && (
              <p className="text-sm text-gray-500 mb-2 italic">
                U ziet alleen de pakketten van uw eigen organisatie.
              </p>
            )}
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-left">
                  <th className="pb-2 pr-4 font-semibold">Pakket</th>
                  <th className="pb-2 pr-4 font-semibold">Leverancier</th>
                  <th className="pb-2 pr-4 font-semibold hidden sm:table-cell">Versie</th>
                  <th className="pb-2 pr-4 font-semibold hidden sm:table-cell">Status</th>
                  <th className="pb-2 pr-4 font-semibold hidden lg:table-cell">Verantwoordelijke</th>
                  <th className="pb-2 pr-4 font-semibold hidden lg:table-cell">Licentievorm</th>
                  <th className="pb-2 pr-4 font-semibold hidden lg:table-cell">Maatwerk</th>
                  <th className="pb-2 font-semibold hidden lg:table-cell">Gebruikers</th>
                </tr>
              </thead>
              <tbody>
                {visiblePakketten.map((gp) => (
                  <tr key={gp.pakketversieId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/pakketten/${gp.pakketversie.pakket.slug}`}
                        className="text-[#1a6ca8] hover:underline"
                      >
                        {gp.pakketversie.pakket.naam}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {gp.pakketversie.pakket.leverancier.naam}
                    </td>
                    <td className="py-2 pr-4 text-gray-600 hidden sm:table-cell">{gp.pakketversie.naam}</td>
                    <td className="py-2 pr-4 text-gray-600 hidden sm:table-cell">{gp.status || "—"}</td>
                    <td className="py-2 pr-4 text-gray-600 hidden lg:table-cell">{gp.verantwoordelijke || "—"}</td>
                    <td className="py-2 pr-4 text-gray-600 hidden lg:table-cell">{gp.licentievorm || "—"}</td>
                    <td className="py-2 pr-4 text-gray-600 hidden lg:table-cell">{gp.maatwerk || "—"}</td>
                    <td className="py-2 text-gray-600 hidden lg:table-cell">{gp.aantalGebruikers ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            {isLeverancier
              ? "Geen van uw pakketten is bij deze gemeente in gebruik."
              : "Geen pakketten geregistreerd."}
          </p>
        )}
      </div>

      {/* AI-adviseur */}
      {showPortfolio && (
        <div className="mb-6">
          <AIAdviseur gemeenteId={slug} gemeenteNaam={gemeente.naam} />
        </div>
      )}

      {/* Wijzigingshistorie */}
      {historie.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Wijzigingshistorie
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-800">
            <ul className="text-sm space-y-2">
              {historie.map((log) => (
                <li key={log.id} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                    {new Date(log.createdAt).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="flex-1">
                    {log.details || log.actie}
                    {log.userEmail && (
                      <span className="text-xs text-gray-400 ml-1">— {log.userEmail}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Samenwerkingen */}
      {gemeente.samenwerkingen.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Samenwerkingsverbanden ({gemeente.samenwerkingen.length})
          </h2>
          <ul className="text-sm space-y-1">
            {gemeente.samenwerkingen.map((sg) => (
              <li key={sg.samenwerkingId} className="flex items-center gap-2">
                <span className="text-gray-700">{sg.samenwerking.naam}</span>
                {sg.samenwerking.type && (
                  <span className="text-xs text-gray-500">({sg.samenwerking.type})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
