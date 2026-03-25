import { Quad, DataFactory } from "n3";
import {
  RDF, SCHEMA, DCT, VVC,
  pakketUri, pakketversieUri, leverancierUri,
  referentiecomponentUri, standaardversieUri,
} from "../namespaces";

const { literal, quad } = DataFactory;

interface PakketInput {
  id: string;
  naam: string;
  slug: string;
  beschrijving?: string | null;
  leverancier?: { slug: string } | null;
  versies?: PakketversieInput[];
}

interface PakketversieInput {
  id: string;
  naam?: string | null;
  status?: string | null;
  pakket?: { slug: string };
  referentiecomponenten?: { referentiecomponentId: string }[];
  standaarden?: { standaardversie?: { id: string; standaardId: string } | null }[];
}

export function pakketToTriples(pakket: PakketInput): Quad[] {
  const subject = pakketUri(pakket.slug);
  const quads: Quad[] = [];

  quads.push(quad(subject, RDF.type, SCHEMA.SoftwareApplication));
  quads.push(quad(subject, SCHEMA.name, literal(pakket.naam)));

  if (pakket.beschrijving) {
    quads.push(quad(subject, SCHEMA.description, literal(pakket.beschrijving, "nl")));
  }

  if (pakket.leverancier) {
    quads.push(quad(subject, SCHEMA.provider, leverancierUri(pakket.leverancier.slug)));
  }

  if (pakket.versies) {
    for (const versie of pakket.versies) {
      const versieSubject = pakketversieUri(pakket.slug, versie.id);
      quads.push(quad(subject, SCHEMA.hasPart, versieSubject));
      quads.push(...pakketversieToTriples(versie, pakket.slug));
    }
  }

  return quads;
}

export function pakketversieToTriples(
  versie: PakketversieInput,
  pakketSlug: string
): Quad[] {
  const subject = pakketversieUri(pakketSlug, versie.id);
  const quads: Quad[] = [];

  quads.push(quad(subject, RDF.type, SCHEMA.SoftwareApplication));

  if (versie.naam) {
    quads.push(quad(subject, SCHEMA.name, literal(versie.naam)));
    quads.push(quad(subject, SCHEMA.version, literal(versie.naam)));
  }

  quads.push(quad(subject, SCHEMA.isPartOf, pakketUri(pakketSlug)));

  if (versie.status) {
    quads.push(quad(subject, VVC.status, literal(versie.status)));
  }

  if (versie.referentiecomponenten) {
    for (const rc of versie.referentiecomponenten) {
      quads.push(quad(subject, VVC.implementeert, referentiecomponentUri(rc.referentiecomponentId)));
    }
  }

  if (versie.standaarden) {
    for (const s of versie.standaarden) {
      if (s.standaardversie) {
        quads.push(
          quad(subject, DCT.conformsTo, standaardversieUri(s.standaardversie.standaardId, s.standaardversie.id))
        );
      }
    }
  }

  return quads;
}
