// Shared datamodel data — used by datamodel page, handleiding, and regeneratie-prompt

export interface Objecttype {
  naam: string;
  attrs: string;
  stereotype?: string;
}

export interface Domein {
  naam: string;
  kleur: string;
  objecttypen: Objecttype[];
}

export interface Koppelklasse {
  naam: string;
  tussen: string;
  attrs: string;
}

export interface Enumeratie {
  naam: string;
  waarden: string;
}

export const domeinen: Domein[] = [
  {
    naam: "Pakketdomein",
    kleur: "bg-blue-50 border-blue-200",
    objecttypen: [
      { naam: "Leverancier", attrs: "naam, slug, contactpersoon, email, website, convenant, ..." },
      { naam: "Pakket", attrs: "naam, slug, beschrijving, urlProductpagina, aantalOrganisaties" },
      { naam: "Pakketversie", attrs: "naam, status, startOntwikkeling/Test/Distributie, aantalOrganisaties" },
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

export const koppelklassen: Koppelklasse[] = [
  { naam: "OrganisatiePakket", tussen: "Organisatie ↔ Pakketversie", attrs: "status, datumIngangStatus, technologie, licentievorm, aantalGebruikers" },
  { naam: "PakketReferentiecomponent", tussen: "Pakket ↔ Referentiecomponent", attrs: "type, aantalOrganisaties" },
  { naam: "PakketStandaard", tussen: "Pakket ↔ Standaardversie", attrs: "compliancy, testrapportUrl" },
  { naam: "PakketApplicatiefunctie", tussen: "Pakket ↔ Applicatiefunctie", attrs: "ondersteund" },
  { naam: "PakketTechnologie", tussen: "Pakket ↔ technologie", attrs: "technologie" },
  { naam: "LeverancierAddendum", tussen: "Leverancier ↔ Addendum", attrs: "—" },
];

export const enumeraties: Enumeratie[] = [
  { naam: "Rol", waarden: "GEVERIFIEERD, GEMEENTE_RAADPLEGER, GEMEENTE_BEHEERDER, SAMENWERKING_BEHEERDER, LEVERANCIER, REDACTEUR, KING_RAADPLEGER, KING_BEHEERDER, ADMIN, API_USER" },
  { naam: "Koppelrichting", waarden: "heen, weer, beide" },
  { naam: "Versie-status", waarden: "in ontwikkeling, in test, in distributie, uit distributie" },
  { naam: "Begrip-status", waarden: "actief, inactief, concept" },
];

// Computed counts

/** Total number of objecttypen across all domeinen */
export const aantalObjecttypen = domeinen.reduce(
  (sum, d) => sum + d.objecttypen.length,
  0
);

/** Total number of koppelklassen */
export const aantalKoppelklassen = koppelklassen.length;

/** Total number of enumeraties */
export const aantalEnumeraties = enumeraties.length;

/** Count all comma-separated attrs across objecttypen and koppelklassen */
function countAttrs(attrString: string): number {
  // Split on commas, filter out empty strings from trailing commas or "..."
  return attrString
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== "...").length;
}

export const aantalAttributen = [
  ...domeinen.flatMap((d) => d.objecttypen),
  ...koppelklassen,
].reduce((sum, item) => sum + countAttrs(item.attrs), 0);

/** Relaties: each koppelklasse represents 2 relations (connects two entities) */
export const aantalRelaties = koppelklassen.length * 2;

/** Total entity count (objecttypen + koppelklassen) for use in handleiding/prompt */
export const aantalEntiteiten = aantalObjecttypen + aantalKoppelklassen;
