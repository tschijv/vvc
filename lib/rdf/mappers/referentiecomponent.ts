import { Quad, DataFactory } from "n3";
import { RDF, DCT, DCAT, SCHEMA, VVC, referentiecomponentUri } from "../namespaces";

const { literal, quad } = DataFactory;

interface ReferentiecomponentInput {
  id: string;
  naam: string;
  guid?: string | null;
  beschrijving?: string | null;
  status?: string | null;
}

export function referentiecomponentToTriples(rc: ReferentiecomponentInput): Quad[] {
  const subject = referentiecomponentUri(rc.id);
  const quads: Quad[] = [];

  quads.push(quad(subject, RDF.type, DCAT.Resource));
  quads.push(quad(subject, RDF.type, VVC.Referentiecomponent));
  quads.push(quad(subject, SCHEMA.name, literal(rc.naam)));

  if (rc.guid) {
    quads.push(quad(subject, DCT.identifier, literal(rc.guid)));
  }

  if (rc.beschrijving) {
    quads.push(quad(subject, SCHEMA.description, literal(rc.beschrijving, "nl")));
  }

  if (rc.status) {
    quads.push(quad(subject, VVC.status, literal(rc.status)));
  }

  return quads;
}
