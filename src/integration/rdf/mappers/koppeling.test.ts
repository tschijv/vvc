import { describe, it, expect } from "vitest";
import { koppelingToTriples } from "./koppeling";

function findTriple(quads: any[], predicateFragment: string) {
  return quads.filter((q) => q.predicate.value.includes(predicateFragment));
}

describe("koppelingToTriples", () => {
  const base = {
    id: "kop-1",
  };

  it("creates rdf:type VVC:Koppeling", () => {
    const quads = koppelingToTriples(base);
    const typeTriples = findTriple(quads, "rdf-syntax-ns#type");
    expect(typeTriples.length).toBe(1);
    expect(typeTriples[0].object.value).toContain("Koppeling");
  });

  it("includes bronPakketversie when provided", () => {
    const quads = koppelingToTriples({
      ...base,
      bronPakketversie: { id: "bv-1", pakket: { slug: "pakket-a" } },
    });
    const bronTriples = findTriple(quads, "bronPakketversie");
    expect(bronTriples.length).toBe(1);
    expect(bronTriples[0].object.value).toContain("pakket/pakket-a/versie/bv-1");
  });

  it("excludes bronPakketversie when pakket slug is missing", () => {
    const quads = koppelingToTriples({
      ...base,
      bronPakketversie: { id: "bv-1", pakket: null },
    });
    const bronTriples = findTriple(quads, "bronPakketversie");
    expect(bronTriples.length).toBe(0);
  });

  it("includes doelPakketversie when provided", () => {
    const quads = koppelingToTriples({
      ...base,
      doelPakketversie: { id: "dv-1", pakket: { slug: "pakket-b" } },
    });
    const doelTriples = findTriple(quads, "doelPakketversie");
    expect(doelTriples.length).toBe(1);
    expect(doelTriples[0].object.value).toContain("pakket/pakket-b/versie/dv-1");
  });

  it("includes richting when provided", () => {
    const quads = koppelingToTriples({ ...base, richting: "bidirectioneel" });
    const richtingTriples = findTriple(quads, "richting");
    expect(richtingTriples.length).toBe(1);
    expect(richtingTriples[0].object.value).toBe("bidirectioneel");
  });

  it("includes standaard when provided", () => {
    const quads = koppelingToTriples({ ...base, standaard: "StUF-ZKN" });
    const stdTriples = findTriple(quads, "standaard");
    expect(stdTriples.length).toBe(1);
    expect(stdTriples[0].object.value).toBe("StUF-ZKN");
  });

  it("includes transportprotocol when provided", () => {
    const quads = koppelingToTriples({ ...base, transportprotocol: "SOAP" });
    const tpTriples = findTriple(quads, "transportprotocol");
    expect(tpTriples.length).toBe(1);
    expect(tpTriples[0].object.value).toBe("SOAP");
  });

  it("includes buitengemeentelijk as boolean literal when true", () => {
    const quads = koppelingToTriples({ ...base, buitengemeentelijk: true });
    const bgTriples = findTriple(quads, "buitengemeentelijk");
    expect(bgTriples.length).toBe(1);
    expect(bgTriples[0].object.value).toBe("true");
  });

  it("includes buitengemeentelijk as boolean literal when false", () => {
    const quads = koppelingToTriples({ ...base, buitengemeentelijk: false });
    const bgTriples = findTriple(quads, "buitengemeentelijk");
    expect(bgTriples.length).toBe(1);
    expect(bgTriples[0].object.value).toBe("false");
  });

  it("excludes buitengemeentelijk when null", () => {
    const quads = koppelingToTriples({ ...base, buitengemeentelijk: null });
    const bgTriples = findTriple(quads, "buitengemeentelijk");
    expect(bgTriples.length).toBe(0);
  });

  it("returns 1 triple with only required id", () => {
    const quads = koppelingToTriples(base);
    expect(quads.length).toBe(1); // just rdf:type
  });
});
