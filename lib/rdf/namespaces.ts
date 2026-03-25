/**
 * RDF Namespace definities en URI builders voor de VNG Voorzieningencatalogus.
 */
import { DataFactory } from "n3";

const { namedNode } = DataFactory;

// ─── Base URI ────────────────────────────────────────────────────────────────

export const BASE_URI = "https://data.vng.nl/vc/";

// ─── Namespace prefixen ──────────────────────────────────────────────────────

export const PREFIXES = {
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  dcat: "http://www.w3.org/ns/dcat#",
  dct: "http://purl.org/dc/terms/",
  schema: "https://schema.org/",
  skos: "http://www.w3.org/2004/02/skos/core#",
  org: "http://www.w3.org/ns/org#",
  foaf: "http://xmlns.com/foaf/0.1/",
  vcard: "http://www.w3.org/2006/vcard/ns#",
  vvc: `${BASE_URI}def/`,
} as const;

// ─── Veelgebruikte termen ────────────────────────────────────────────────────

export const RDF = {
  type: namedNode(`${PREFIXES.rdf}type`),
};

export const RDFS = {
  label: namedNode(`${PREFIXES.rdfs}label`),
  comment: namedNode(`${PREFIXES.rdfs}comment`),
};

export const DCT = {
  title: namedNode(`${PREFIXES.dct}title`),
  description: namedNode(`${PREFIXES.dct}description`),
  identifier: namedNode(`${PREFIXES.dct}identifier`),
  publisher: namedNode(`${PREFIXES.dct}publisher`),
  modified: namedNode(`${PREFIXES.dct}modified`),
  created: namedNode(`${PREFIXES.dct}created`),
  conformsTo: namedNode(`${PREFIXES.dct}conformsTo`),
  isVersionOf: namedNode(`${PREFIXES.dct}isVersionOf`),
  hasVersion: namedNode(`${PREFIXES.dct}hasVersion`),
  Standard: namedNode(`${PREFIXES.dct}Standard`),
};

export const DCAT = {
  Catalog: namedNode(`${PREFIXES.dcat}Catalog`),
  Resource: namedNode(`${PREFIXES.dcat}Resource`),
  Dataset: namedNode(`${PREFIXES.dcat}Dataset`),
  dataset: namedNode(`${PREFIXES.dcat}dataset`),
  record: namedNode(`${PREFIXES.dcat}record`),
};

export const SCHEMA = {
  Organization: namedNode(`${PREFIXES.schema}Organization`),
  GovernmentOrganization: namedNode(`${PREFIXES.schema}GovernmentOrganization`),
  SoftwareApplication: namedNode(`${PREFIXES.schema}SoftwareApplication`),
  name: namedNode(`${PREFIXES.schema}name`),
  description: namedNode(`${PREFIXES.schema}description`),
  url: namedNode(`${PREFIXES.schema}url`),
  email: namedNode(`${PREFIXES.schema}email`),
  identifier: namedNode(`${PREFIXES.schema}identifier`),
  version: namedNode(`${PREFIXES.schema}version`),
  provider: namedNode(`${PREFIXES.schema}provider`),
  isPartOf: namedNode(`${PREFIXES.schema}isPartOf`),
  hasPart: namedNode(`${PREFIXES.schema}hasPart`),
  makesOffer: namedNode(`${PREFIXES.schema}makesOffer`),
  softwareVersion: namedNode(`${PREFIXES.schema}softwareVersion`),
};

export const SKOS = {
  Concept: namedNode(`${PREFIXES.skos}Concept`),
  prefLabel: namedNode(`${PREFIXES.skos}prefLabel`),
  altLabel: namedNode(`${PREFIXES.skos}altLabel`),
  definition: namedNode(`${PREFIXES.skos}definition`),
  scopeNote: namedNode(`${PREFIXES.skos}scopeNote`),
  inScheme: namedNode(`${PREFIXES.skos}inScheme`),
};

export const ORG = {
  Organization: namedNode(`${PREFIXES.org}Organization`),
};

export const VVC = {
  Referentiecomponent: namedNode(`${PREFIXES.vvc}Referentiecomponent`),
  Koppeling: namedNode(`${PREFIXES.vvc}Koppeling`),
  status: namedNode(`${PREFIXES.vvc}status`),
  implementeert: namedNode(`${PREFIXES.vvc}implementeert`),
  bronPakketversie: namedNode(`${PREFIXES.vvc}bronPakketversie`),
  doelPakketversie: namedNode(`${PREFIXES.vvc}doelPakketversie`),
  richting: namedNode(`${PREFIXES.vvc}richting`),
  standaard: namedNode(`${PREFIXES.vvc}standaard`),
  transportprotocol: namedNode(`${PREFIXES.vvc}transportprotocol`),
  buitengemeentelijk: namedNode(`${PREFIXES.vvc}buitengemeentelijk`),
  compliancyMonitor: namedNode(`${PREFIXES.vvc}compliancyMonitor`),
};

// ─── URI Builders ────────────────────────────────────────────────────────────

export function catalogUri() {
  return namedNode(`${BASE_URI}catalog`);
}

export function gemeenteUri(id: string) {
  return namedNode(`${BASE_URI}gemeente/${id}`);
}

export function leverancierUri(slug: string) {
  return namedNode(`${BASE_URI}leverancier/${slug}`);
}

export function pakketUri(slug: string) {
  return namedNode(`${BASE_URI}pakket/${slug}`);
}

export function pakketversieUri(pakketSlug: string, id: string) {
  return namedNode(`${BASE_URI}pakket/${pakketSlug}/versie/${id}`);
}

export function referentiecomponentUri(id: string) {
  return namedNode(`${BASE_URI}referentiecomponent/${id}`);
}

export function standaardUri(id: string) {
  return namedNode(`${BASE_URI}standaard/${id}`);
}

export function standaardversieUri(standaardId: string, id: string) {
  return namedNode(`${BASE_URI}standaard/${standaardId}/versie/${id}`);
}

export function koppelingUri(id: string) {
  return namedNode(`${BASE_URI}koppeling/${id}`);
}
