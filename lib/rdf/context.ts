/**
 * JSON-LD @context voor de VNG Voorzieningencatalogus.
 */
import { BASE_URI, PREFIXES } from "./namespaces";

export const JSONLD_CONTEXT = {
  "@base": BASE_URI,
  schema: PREFIXES.schema,
  dcat: PREFIXES.dcat,
  dct: PREFIXES.dct,
  skos: PREFIXES.skos,
  org: PREFIXES.org,
  foaf: PREFIXES.foaf,
  xsd: PREFIXES.xsd,
  vvc: PREFIXES.vvc,
  naam: "schema:name",
  beschrijving: "schema:description",
  website: { "@id": "schema:url", "@type": "@id" },
  email: "schema:email",
  identificatie: "schema:identifier",
  versie: "schema:version",
  status: "vvc:status",
  leverancier: { "@id": "schema:provider", "@type": "@id" },
  pakketversies: { "@id": "schema:hasPart", "@type": "@id", "@container": "@set" },
  implementeert: { "@id": "vvc:implementeert", "@type": "@id", "@container": "@set" },
  voldoetAan: { "@id": "dct:conformsTo", "@type": "@id", "@container": "@set" },
  isVersieVan: { "@id": "dct:isVersionOf", "@type": "@id" },
  heeftVersie: { "@id": "dct:hasVersion", "@type": "@id", "@container": "@set" },
  gewijzigd: { "@id": "dct:modified", "@type": "xsd:dateTime" },
  aangemaakt: { "@id": "dct:created", "@type": "xsd:dateTime" },
};
