import { Quad, DataFactory } from "n3";
import { RDF, SCHEMA, leverancierUri, pakketUri } from "../namespaces";

const { literal, quad, namedNode } = DataFactory;

interface LeverancierInput {
  id: string;
  naam: string;
  slug: string;
  website?: string | null;
  email?: string | null;
  beschrijving?: string | null;
  pakketten?: { slug: string }[];
}

export function leverancierToTriples(leverancier: LeverancierInput): Quad[] {
  const subject = leverancierUri(leverancier.slug);
  const quads: Quad[] = [];

  quads.push(quad(subject, RDF.type, SCHEMA.Organization));
  quads.push(quad(subject, SCHEMA.name, literal(leverancier.naam)));

  if (leverancier.beschrijving) {
    quads.push(quad(subject, SCHEMA.description, literal(leverancier.beschrijving, "nl")));
  }

  if (leverancier.website) {
    quads.push(quad(subject, SCHEMA.url, namedNode(leverancier.website)));
  }

  if (leverancier.email) {
    quads.push(quad(subject, SCHEMA.email, literal(leverancier.email)));
  }

  if (leverancier.pakketten) {
    for (const pakket of leverancier.pakketten) {
      quads.push(quad(subject, SCHEMA.makesOffer, pakketUri(pakket.slug)));
    }
  }

  return quads;
}
