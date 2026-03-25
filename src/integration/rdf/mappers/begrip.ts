import { Quad, DataFactory } from "n3";
import { RDF, SKOS, RDFS } from "../namespaces";

const { namedNode, literal, quad } = DataFactory;

interface BegripInput {
  term: string;
  definitie: string;
  toelichting?: string | null;
  scopeNote?: string | null;
  uri: string;
  synoniemen?: string[];
  vocab?: string;
}

export function begripToTriples(begrip: BegripInput): Quad[] {
  if (!begrip.uri) return [];

  const subject = namedNode(begrip.uri);
  const quads: Quad[] = [];

  quads.push(quad(subject, RDF.type, SKOS.Concept));
  quads.push(quad(subject, SKOS.prefLabel, literal(begrip.term, "nl")));

  if (begrip.definitie && begrip.definitie !== "(geen definitie)") {
    quads.push(quad(subject, SKOS.definition, literal(begrip.definitie, "nl")));
  }

  if (begrip.toelichting) {
    quads.push(quad(subject, RDFS.comment, literal(begrip.toelichting, "nl")));
  }

  if (begrip.scopeNote) {
    quads.push(quad(subject, SKOS.scopeNote, literal(begrip.scopeNote, "nl")));
  }

  if (begrip.synoniemen) {
    for (const syn of begrip.synoniemen) {
      quads.push(quad(subject, SKOS.altLabel, literal(syn, "nl")));
    }
  }

  return quads;
}
