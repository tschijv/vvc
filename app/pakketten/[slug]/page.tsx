import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPakketBySlug } from "@/lib/services/pakket";
import GlossaryHighlighter from "@/components/GlossaryHighlighter";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pakket = await prisma.pakket.findUnique({
    where: { slug },
    include: { leverancier: true },
  });
  if (!pakket) return {};
  return {
    title: pakket.naam,
    description: pakket.beschrijving || `${pakket.naam} van ${pakket.leverancier.naam}`,
    openGraph: {
      title: pakket.naam,
      description: pakket.beschrijving || `Software pakket van ${pakket.leverancier.naam}`,
    },
  };
}

const STATUS_COLORS: Record<string, string> = {
  "In gebruik": "bg-green-100 text-green-800",
  "In ontwikkeling": "bg-blue-100 text-blue-800",
  "Einde ondersteuning": "bg-yellow-100 text-yellow-800",
  Teruggetrokken: "bg-red-100 text-red-800",
};

export default async function PakketDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab = "standaarden" } = await searchParams;

  const pakket = await getPakketBySlug(slug);

  if (!pakket) notFound();

  const latestVersie = pakket.versies[0];

  // Aggregate referentiecomponenten per naam (across all versions)
  const refCompMap = new Map<string, { naam: string; aantalGemeenten: number }>();
  for (const versie of pakket.versies) {
    for (const prc of versie.referentiecomponenten) {
      const naam = prc.referentiecomponent.naam;
      const existing = refCompMap.get(naam);
      if (!existing || prc.aantalGemeenten > existing.aantalGemeenten) {
        refCompMap.set(naam, { naam, aantalGemeenten: prc.aantalGemeenten });
      }
    }
  }
  const refComps = Array.from(refCompMap.values());

  return (
    <div>
      {/* Header */}
      <div className="border rounded p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-blue-700 mb-1">{pakket.naam}</h1>
          <Link
            href={`/leveranciers/${pakket.leverancier.slug}`}
            className="text-blue-600 text-sm hover:underline"
          >
            {pakket.leverancier.naam}
          </Link>
          <p className="text-sm text-gray-700 mt-3 leading-relaxed">
            <GlossaryHighlighter>{pakket.beschrijving || ""}</GlossaryHighlighter>
          </p>
        </div>
        <div className="text-sm text-right space-y-1 shrink-0">
          {pakket.leverancier.contactpersoon && (
            <div className="text-gray-800 font-medium">
              {pakket.leverancier.contactpersoon}
            </div>
          )}
          {pakket.leverancier.email && (
            <div>
              <a href={`mailto:${pakket.leverancier.email}`} className="text-blue-600 hover:underline">
                {pakket.leverancier.email}
              </a>
            </div>
          )}
          {pakket.leverancier.telefoon && (
            <div className="text-gray-600">{pakket.leverancier.telefoon}</div>
          )}
          {pakket.leverancier.website && (
            <div>
              <a
                href={pakket.leverancier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website leverancier
              </a>
            </div>
          )}
          {pakket.leverancier.supportPortalUrl && (
            <div>
              <a
                href={pakket.leverancier.supportPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Supportportaal
              </a>
            </div>
          )}
          {pakket.leverancier.addenda.length > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              Ondertekende addenda ({pakket.leverancier.addenda.length})
            </div>
          )}
        </div>
      </div>

      {/* Contactpersonen per pakket (Eis 67) */}
      {pakket.contactpersonen.length > 0 && (
        <div className="border rounded p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Contactpersonen voor dit pakket</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pakket.contactpersonen.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded p-3 text-sm">
                <div className="font-medium text-gray-800">{c.naam}</div>
                {c.rol && <div className="text-xs text-gray-500">{c.rol}</div>}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline text-xs block mt-1">
                    {c.email}
                  </a>
                )}
                {c.telefoon && <div className="text-xs text-gray-600 mt-0.5">{c.telefoon}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Versietabel */}
        <div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="pb-2 pr-3 font-semibold">Pakketversie</th>
                <th className="pb-2 pr-3 font-semibold">Status</th>
                <th className="pb-2 font-semibold">Start distributie</th>
              </tr>
            </thead>
            <tbody>
              {pakket.versies.map((v) => (
                <tr key={v.id} className="border-b border-gray-100">
                  <td className="py-2 pr-3 font-medium text-blue-700">{v.naam}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[v.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-600">
                    {v.startDistributie
                      ? v.startDistributie.toLocaleDateString("nl-NL")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Referentiecomponenten */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Pakket geschikt voor (GEMMA 2) — Ingevuld door {pakket.aantalGemeenten} gemeenten
          </h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {refComps.map((rc) => (
                <tr key={rc.naam} className="border-b border-gray-100">
                  <td className="py-1.5 pr-3">{rc.naam}</td>
                  <td className="py-1.5 text-gray-500">
                    {rc.aantalGemeenten > 0 ? `${rc.aantalGemeenten} gemeenten` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabs */}
      {latestVersie && (
        <div>
          <div className="text-sm font-semibold text-blue-700 border-b mb-4 pb-1">
            Details pakketversie: {pakket.naam} {latestVersie.naam} — Status:{" "}
            <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[latestVersie.status] || ""}`}>
              {latestVersie.status}
            </span>
          </div>

          <div className="flex gap-1 mb-4 overflow-x-auto">
            {["standaarden", "functionaliteit", "technologie"].map((t) => (
              <Link
                key={t}
                href={`/pakketten/${slug}?tab=${t}`}
                className={`px-4 py-2 text-sm rounded-t border ${
                  tab === t
                    ? "bg-white border-b-white font-semibold"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Link>
            ))}
          </div>

          {tab === "standaarden" && (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-left">
                  <th className="pb-2 pr-4 font-semibold">Standaard</th>
                  <th className="pb-2 pr-4 font-semibold">Versie</th>
                  <th className="pb-2 font-semibold">Compliancy</th>
                </tr>
              </thead>
              <tbody>
                {latestVersie.standaarden.map((ps) => (
                  <tr key={ps.standaardversieId} className="border-b border-gray-100">
                    <td className="py-1.5 pr-4">{ps.standaardversie.standaard.naam}</td>
                    <td className="py-1.5 pr-4 text-gray-600">{ps.standaardversie.naam}</td>
                    <td className="py-1.5">
                      {ps.compliancy === true
                        ? "✓ Compliant"
                        : ps.compliancy === false
                        ? "✗ Niet compliant"
                        : "—"}
                    </td>
                  </tr>
                ))}
                {latestVersie.standaarden.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 text-gray-400 italic">
                      Geen standaarden geregistreerd
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "functionaliteit" && (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-left">
                  <th className="pb-2 pr-4 font-semibold">Applicatiefunctie</th>
                  <th className="pb-2 font-semibold">Ondersteund</th>
                </tr>
              </thead>
              <tbody>
                {latestVersie.applicatiefuncties.map((af) => (
                  <tr key={af.applicatiefunctieId} className="border-b border-gray-100">
                    <td className="py-1.5 pr-4">{af.applicatiefunctie.naam}</td>
                    <td className="py-1.5">{af.ondersteund ? "✓" : "✗"}</td>
                  </tr>
                ))}
                {latestVersie.applicatiefuncties.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-3 text-gray-400 italic">
                      Geen applicatiefuncties geregistreerd
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {tab === "technologie" && (
            <div className="text-sm">
              {latestVersie.technologieen.length > 0 ? (
                <ul className="space-y-1">
                  {latestVersie.technologieen.map((t) => (
                    <li key={t.technologie} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      {t.technologie}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 italic">Geen technologieën geregistreerd</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
