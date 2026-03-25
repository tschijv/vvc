/**
 * Gemeente → RDF mapper.
 * PRIVACY: Alleen naam en CBS-code worden gepubliceerd.
 * Geen contactgegevens, pakketten, voortgang of koppelingen.
 */
import { Quad, DataFactory } from "n3";
import { RDF, SCHEMA, ORG, DCT, gemeenteUri } from "../namespaces";

const { literal, quad } = DataFactory;

interface GemeenteInput {
  id: string;
  naam: string;
  cbsCode?: string | null;
}

export function gemeenteToTriples(gemeente: GemeenteInput): Quad[] {
  const subject = gemeenteUri(gemeente.id);
  const quads: Quad[] = [];

  quads.push(quad(subject, RDF.type, ORG.Organization));
  quads.push(quad(subject, RDF.type, SCHEMA.GovernmentOrganization));
  quads.push(quad(subject, SCHEMA.name, literal(gemeente.naam, "nl")));

  if (gemeente.cbsCode) {
    quads.push(quad(subject, DCT.identifier, literal(gemeente.cbsCode)));
  }

  return quads;
}
