import { describe, it, expect } from "vitest";
import {
  BASE_URI,
  PREFIXES,
  RDF,
  RDFS,
  DCT,
  DCAT,
  SCHEMA,
  SKOS,
  ORG,
  VVC,
  catalogUri,
  gemeenteUri,
  leverancierUri,
  pakketUri,
  pakketversieUri,
  referentiecomponentUri,
  standaardUri,
  standaardversieUri,
  koppelingUri,
} from "./namespaces";

describe("BASE_URI", () => {
  it("is the correct VNG data URI", () => {
    expect(BASE_URI).toBe("https://data.vng.nl/vc/");
  });

  it("ends with a slash", () => {
    expect(BASE_URI).toMatch(/\/$/);
  });
});

describe("PREFIXES", () => {
  it("contains standard W3C namespaces", () => {
    expect(PREFIXES.rdf).toBe("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    expect(PREFIXES.rdfs).toBe("http://www.w3.org/2000/01/rdf-schema#");
    expect(PREFIXES.xsd).toBe("http://www.w3.org/2001/XMLSchema#");
  });

  it("contains DCAT and DCT namespaces", () => {
    expect(PREFIXES.dcat).toBe("http://www.w3.org/ns/dcat#");
    expect(PREFIXES.dct).toBe("http://purl.org/dc/terms/");
  });

  it("contains schema.org namespace", () => {
    expect(PREFIXES.schema).toBe("https://schema.org/");
  });

  it("contains SKOS namespace", () => {
    expect(PREFIXES.skos).toBe("http://www.w3.org/2004/02/skos/core#");
  });

  it("contains vvc namespace derived from BASE_URI", () => {
    expect(PREFIXES.vvc).toBe(`${BASE_URI}def/`);
  });

  it("all prefixes are valid URIs ending with / or #", () => {
    for (const [key, uri] of Object.entries(PREFIXES)) {
      expect(uri).toMatch(/[/#]$/);
    }
  });
});

describe("RDF namespace terms", () => {
  it("has rdf:type", () => {
    expect(RDF.type.value).toBe("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  });
});

describe("RDFS namespace terms", () => {
  it("has rdfs:label and rdfs:comment", () => {
    expect(RDFS.label.value).toContain("label");
    expect(RDFS.comment.value).toContain("comment");
  });
});

describe("DCT namespace terms", () => {
  it("has title, description, identifier", () => {
    expect(DCT.title.value).toContain("title");
    expect(DCT.description.value).toContain("description");
    expect(DCT.identifier.value).toContain("identifier");
  });

  it("has versioning terms", () => {
    expect(DCT.isVersionOf.value).toContain("isVersionOf");
    expect(DCT.hasVersion.value).toContain("hasVersion");
  });
});

describe("SCHEMA namespace terms", () => {
  it("has Organization and SoftwareApplication types", () => {
    expect(SCHEMA.Organization.value).toBe("https://schema.org/Organization");
    expect(SCHEMA.SoftwareApplication.value).toBe("https://schema.org/SoftwareApplication");
  });

  it("has name property", () => {
    expect(SCHEMA.name.value).toBe("https://schema.org/name");
  });
});

describe("URI builders", () => {
  it("catalogUri returns catalog URI", () => {
    expect(catalogUri().value).toBe("https://data.vng.nl/vc/catalog");
  });

  it("gemeenteUri builds correct URI", () => {
    expect(gemeenteUri("abc123").value).toBe("https://data.vng.nl/vc/gemeente/abc123");
  });

  it("leverancierUri builds correct URI from slug", () => {
    expect(leverancierUri("centric").value).toBe("https://data.vng.nl/vc/leverancier/centric");
  });

  it("pakketUri builds correct URI from slug", () => {
    expect(pakketUri("suite4gemeenten").value).toBe("https://data.vng.nl/vc/pakket/suite4gemeenten");
  });

  it("pakketversieUri builds correct nested URI", () => {
    expect(pakketversieUri("suite4gemeenten", "v1").value).toBe(
      "https://data.vng.nl/vc/pakket/suite4gemeenten/versie/v1"
    );
  });

  it("referentiecomponentUri builds correct URI", () => {
    expect(referentiecomponentUri("rc-1").value).toBe(
      "https://data.vng.nl/vc/referentiecomponent/rc-1"
    );
  });

  it("standaardUri builds correct URI", () => {
    expect(standaardUri("std-1").value).toBe("https://data.vng.nl/vc/standaard/std-1");
  });

  it("standaardversieUri builds correct nested URI", () => {
    expect(standaardversieUri("std-1", "v2").value).toBe(
      "https://data.vng.nl/vc/standaard/std-1/versie/v2"
    );
  });

  it("koppelingUri builds correct URI", () => {
    expect(koppelingUri("kop-1").value).toBe("https://data.vng.nl/vc/koppeling/kop-1");
  });

  it("handles special characters in slugs", () => {
    // URI builders don't encode - they pass through raw
    expect(leverancierUri("name-with-dashes").value).toContain("name-with-dashes");
  });
});
