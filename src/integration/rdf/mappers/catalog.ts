import { Quad, DataFactory } from "n3";
import { RDF, DCT, DCAT, SCHEMA, PREFIXES, catalogUri } from "../namespaces";

const { namedNode, literal, quad: q } = DataFactory;

const VNG_URI = namedNode(`${PREFIXES.vvc}org/vng-realisatie`);

export function catalogToTriples(): Quad[] {
  const subject = catalogUri();
  const quads: Quad[] = [];

  quads.push(q(subject, RDF.type, DCAT.Catalog));
  quads.push(q(subject, DCT.title, literal("VNG Voorzieningencatalogus", "nl")));
  quads.push(
    q(subject, DCT.description,
      literal("Catalogus van softwarevoorzieningen, standaarden en referentiecomponenten bij Nederlandse gemeenten.", "nl"))
  );
  quads.push(q(subject, DCT.publisher, VNG_URI));

  // Publisher info
  quads.push(q(VNG_URI, RDF.type, SCHEMA.Organization));
  quads.push(q(VNG_URI, SCHEMA.name, literal("VNG Realisatie")));
  quads.push(q(VNG_URI, SCHEMA.url, namedNode("https://vng.nl/rubrieken/gemeentelijke-dienstverlening")));

  return quads;
}
