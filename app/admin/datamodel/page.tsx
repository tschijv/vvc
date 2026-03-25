import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import Image from "next/image";

const domeinen = [
  {
    naam: "Pakketdomein",
    kleur: "bg-blue-50 border-blue-200",
    objecttypen: [
      { naam: "Leverancier", attrs: "naam, slug, contactpersoon, email, website, convenant, ..." },
      { naam: "Pakket", attrs: "naam, slug, beschrijving, urlProductpagina, aantalGemeenten" },
      { naam: "Pakketversie", attrs: "naam, status, startOntwikkeling/Test/Distributie, aantalGemeenten" },
      { naam: "PakketContact", attrs: "naam, email, telefoon, rol", stereotype: "Gegevensgroeptype" },
      { naam: "ExternPakket", attrs: "naam, leverancierNaam, versie, beschrijving" },
      { naam: "Testrapport", attrs: "naam, status, resultaat, datum, pakketversieId" },
    ],
  },
  {
    naam: "GEMMA-domein",
    kleur: "bg-blue-50 border-blue-200",
    objecttypen: [
      { naam: "Referentiecomponent", attrs: "naam, guid, beschrijving, status" },
      { naam: "Standaard", attrs: "naam, guid, beschrijving" },
      { naam: "Standaardversie", attrs: "naam, guid, status, compliancyMonitor" },
      { naam: "Applicatiefunctie", attrs: "naam, guid, beschrijving" },
      { naam: "GemmaView", attrs: "objectId, titel, domein, laag, modelId, volgorde, actief" },
    ],
  },
  {
    naam: "Organisatiedomein",
    kleur: "bg-green-50 border-green-200",
    objecttypen: [
      { naam: "Organisatie", attrs: "naam, cbsCode, contactpersoon, email, website, voortgang", stereotype: "@@map(\"Gemeente\")" },
      { naam: "Samenwerking", attrs: "naam, type, contactpersoon, email" },
      { naam: "SamenwerkingOrganisatie", attrs: "samenwerkingId, organisatieId", stereotype: "Koppelklasse, @@map(\"SamenwerkingGemeente\")" },
    ],
  },
  {
    naam: "Integratiedomein",
    kleur: "bg-amber-50 border-amber-200",
    objecttypen: [
      { naam: "Koppeling", attrs: "richting, buitengemeentelijk, status, standaard, transportprotocol" },
      { naam: "Addendum", attrs: "naam, beschrijving, url" },
    ],
  },
  {
    naam: "Gebruikersdomein",
    kleur: "bg-purple-50 border-purple-200",
    objecttypen: [
      { naam: "Gebruiker", attrs: "email, naam, actief, rollen[], registratieBron, organisatieType" },
      { naam: "WachtwoordResetToken", attrs: "token, verlooptOp, gebruiktOp", stereotype: "Gegevensgroeptype" },
      { naam: "Notificatie", attrs: "type, titel, bericht, gelezen, userId, link" },
      { naam: "Favoriet", attrs: "userId, entiteitType, entiteitId" },
    ],
  },
  {
    naam: "Contentdomein",
    kleur: "bg-teal-50 border-teal-200",
    objecttypen: [
      { naam: "Pagina", attrs: "slug, titel, inhoud" },
      { naam: "Begrip", attrs: "term, definitie, uri, toelichting, synoniemen[], vocabulaire, status" },
    ],
  },
  {
    naam: "Auditdomein",
    kleur: "bg-gray-50 border-gray-200",
    objecttypen: [
      { naam: "AuditLogRegel", attrs: "actie, entiteit, entiteitId, details, ipAdres" },
    ],
  },
  {
    naam: "Configuratiedomein",
    kleur: "bg-orange-50 border-orange-200",
    objecttypen: [
      { naam: "AppSetting", attrs: "key (PK), value, updatedAt — applicatieconfiguratie (bijv. SKOSMOS vocabulaires)" },
    ],
  },
];

const koppelklassen = [
  { naam: "OrganisatiePakket", tussen: "Organisatie ↔ Pakketversie", attrs: "status, datumIngangStatus, technologie, licentievorm, aantalGebruikers" },
  { naam: "PakketReferentiecomponent", tussen: "Pakket ↔ Referentiecomponent", attrs: "type, aantalGemeenten" },
  { naam: "PakketStandaard", tussen: "Pakket ↔ Standaardversie", attrs: "compliancy, testrapportUrl" },
  { naam: "PakketApplicatiefunctie", tussen: "Pakket ↔ Applicatiefunctie", attrs: "ondersteund" },
  { naam: "PakketTechnologie", tussen: "Pakket ↔ technologie", attrs: "technologie" },
  { naam: "LeverancierAddendum", tussen: "Leverancier ↔ Addendum", attrs: "—" },
];

const enumeraties = [
  { naam: "Rol", waarden: "GEVERIFIEERD, GEMEENTE_RAADPLEGER, GEMEENTE_BEHEERDER, SAMENWERKING_BEHEERDER, LEVERANCIER, REDACTEUR, KING_RAADPLEGER, KING_BEHEERDER, ADMIN, API_USER" },
  { naam: "Koppelrichting", waarden: "heen, weer, beide" },
  { naam: "Versie-status", waarden: "in ontwikkeling, in test, in distributie, uit distributie" },
  { naam: "Begrip-status", waarden: "actief, inactief, concept" },
];

export default async function DatamodelPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Datamodel", href: "/admin/datamodel" },
      ]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logisch Informatiemodel (MIM)</h1>
          <p className="text-sm text-gray-500 mt-1">Conform MIM 1.2 – Niveau 3 (Logisch informatiemodel)</p>
        </div>
      </div>

      {/* MIM Diagram */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">UML-klassendiagram</h2>
        <div className="overflow-auto border border-gray-100 rounded bg-gray-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mim-informatiemodel.svg"
            alt="MIM Logisch Informatiemodel Voorzieningencatalogus"
            className="max-w-none"
            style={{ minWidth: 900 }}
          />
        </div>
        <div className="flex gap-3 mt-3">
          <a href="/mim-informatiemodel.svg" download className="text-sm text-[#1a6ca8] hover:underline">
            ⬇ Download SVG
          </a>
          <a href="/mim-informatiemodel.png" download className="text-sm text-[#1a6ca8] hover:underline">
            ⬇ Download PNG
          </a>
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">MIM-stereotypen</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#CCE5FF] border border-[#2171B5]" />
            <span className="text-sm">«Objecttype»</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#E0F0E0] border border-[#41AB5D]" />
            <span className="text-sm">«Gegevensgroeptype»</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#F0E0FF] border border-[#7A3DB8]" />
            <span className="text-sm">«Koppelklasse»</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#FFF3CD] border border-[#FFA500]" />
            <span className="text-sm">«Enumeratie»</span>
          </div>
        </div>
      </div>

      {/* Domeinen */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Objecttypen per domein</h2>
        {domeinen.map((d) => (
          <div key={d.naam} className={`border rounded-lg p-4 ${d.kleur}`}>
            <h3 className="font-semibold text-gray-800 mb-2">{d.naam}</h3>
            <div className="space-y-1">
              {d.objecttypen.map((ot) => (
                <div key={ot.naam} className="flex items-start gap-2 text-sm">
                  <span className="font-mono font-semibold text-gray-700 whitespace-nowrap min-w-[200px]">
                    {ot.naam}
                    {ot.stereotype && (
                      <span className="text-xs text-gray-400 ml-1">«{ot.stereotype}»</span>
                    )}
                  </span>
                  <span className="text-gray-500">{ot.attrs}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Koppelklassen */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Koppelklassen (relatieobjecten)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th scope="col" className="text-left py-2 pr-4 font-semibold text-gray-700">Koppelklasse</th>
                <th scope="col" className="text-left py-2 pr-4 font-semibold text-gray-700">Relatie</th>
                <th scope="col" className="text-left py-2 font-semibold text-gray-700">Attributen</th>
              </tr>
            </thead>
            <tbody>
              {koppelklassen.map((kk) => (
                <tr key={kk.naam} className="border-b border-gray-50">
                  <td className="py-1.5 pr-4 font-mono text-gray-700">{kk.naam}</td>
                  <td className="py-1.5 pr-4 text-gray-500">{kk.tussen}</td>
                  <td className="py-1.5 text-gray-500">{kk.attrs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enumeraties */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Enumeraties (waardelijsten)</h2>
        <div className="space-y-2">
          {enumeraties.map((e) => (
            <div key={e.naam} className="flex items-start gap-2 text-sm">
              <span className="font-mono font-semibold text-gray-700 min-w-[140px]">{e.naam}</span>
              <span className="text-gray-500">{e.waarden}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kerncijfers */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Kerncijfers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Objecttypen", waarde: "30" },
            { label: "Koppelklassen", waarde: "6" },
            { label: "Enumeraties", waarde: "4" },
            { label: "Attributen", waarde: "~140" },
            { label: "Relaties", waarde: "~30" },
          ].map((k) => (
            <div key={k.label} className="text-center">
              <div className="text-2xl font-bold text-[#1a6ca8]">{k.waarde}</div>
              <div className="text-xs text-gray-500">{k.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
