import { Quad, DataFactory } from "n3";
import { RDF, DCT, VVC, SCHEMA, standaardUri, standaardversieUri } from "../namespaces";

const { literal, quad } = DataFactory;

interface StandaardInput {
  id: string;
  naam: string;
  guid?: string | null;
  beschrijving?: string | null;
  versies?: StandaardversieInput[];
}

interface StandaardversieInput {
  id: string;
  naam?: string | null;
  standaardId: string;
  compliancyMonitor?: boolean | null;
}

export function standaardToTriples(standaard: StandaardInput): Quad[] {
  const subject = standaardUri(standaard.id);
  const quads: Quad[] = [];

  quads.push(quad(subject, RDF.type, DCT.Standard));
  quads.push(quad(subject, SCHEMA.name, literal(standaard.naam)));

  if (standaard.guid) {
    quads.push(quad(subject, DCT.identifier, literal(standaard.guid)));
  }

  if (standaard.beschrijving) {
    quads.push(quad(subject, SCHEMA.description, literal(standaard.beschrijving, "nl")));
  }

  if (standaard.versies) {
    for (const versie of standaard.versies) {
      const versieSubject = standaardversieUri(standaard.id, versie.id);
      quads.push(quad(subject, DCT.hasVersion, versieSubject));
      quads.push(...standaardversieToTriples(versie));
    }
  }

  return quads;
}

export function standaardversieToTriples(versie: StandaardversieInput): Quad[] {
  const subject = standaardversieUri(versie.standaardId, versie.id);
  const quads: Quad[] = [];

  quads.push(quad(subject, RDF.type, DCT.Standard));

  if (versie.naam) {
    quads.push(quad(subject, SCHEMA.name, literal(versie.naam)));
    quads.push(quad(subject, SCHEMA.version, literal(versie.naam)));
  }

  quads.push(quad(subject, DCT.isVersionOf, standaardUri(versie.standaardId)));

  if (versie.compliancyMonitor != null) {
    quads.push(
      quad(subject, VVC.compliancyMonitor, literal(String(versie.compliancyMonitor), DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean")))
    );
  }

  return quads;
}
