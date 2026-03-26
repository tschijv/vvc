/**
 * Koppeling → RDF mapper.
 * PRIVACY: Alleen generieke koppelingen, GEEN gemeente-specifieke data.
 */
import { Quad, DataFactory } from "n3";
import { RDF, VVC, koppelingUri, pakketversieUri } from "../namespaces";

const { literal, quad } = DataFactory;

interface KoppelingInput {
  id: string;
  richting?: string | null;
  standaard?: string | null;
  transportprotocol?: string | null;
  buitenOrganisatie?: boolean | null;
  bronPakketversie?: { id: string; pakket?: { slug: string } | null } | null;
  doelPakketversie?: { id: string; pakket?: { slug: string } | null } | null;
}

export function koppelingToTriples(koppeling: KoppelingInput): Quad[] {
  const subject = koppelingUri(koppeling.id);
  const quads: Quad[] = [];

  quads.push(quad(subject, RDF.type, VVC.Koppeling));

  if (koppeling.bronPakketversie?.pakket?.slug) {
    quads.push(
      quad(subject, VVC.bronPakketversie,
        pakketversieUri(koppeling.bronPakketversie.pakket.slug, koppeling.bronPakketversie.id))
    );
  }

  if (koppeling.doelPakketversie?.pakket?.slug) {
    quads.push(
      quad(subject, VVC.doelPakketversie,
        pakketversieUri(koppeling.doelPakketversie.pakket.slug, koppeling.doelPakketversie.id))
    );
  }

  if (koppeling.richting) {
    quads.push(quad(subject, VVC.richting, literal(koppeling.richting)));
  }

  if (koppeling.standaard) {
    quads.push(quad(subject, VVC.standaard, literal(koppeling.standaard)));
  }

  if (koppeling.transportprotocol) {
    quads.push(quad(subject, VVC.transportprotocol, literal(koppeling.transportprotocol)));
  }

  if (koppeling.buitenOrganisatie != null) {
    quads.push(
      quad(subject, VVC.buitengemeentelijk,
        literal(String(koppeling.buitenOrganisatie), DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean")))
    );
  }

  return quads;
}
