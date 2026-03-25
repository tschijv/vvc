import { describe, it, expect } from "vitest";
import { begripToTriples } from "./begrip";

function findTriple(quads: any[], predicateFragment: string) {
  return quads.filter((q) => q.predicate.value.includes(predicateFragment));
}

describe("begripToTriples", () => {
  const base = {
    term: "Zaakgericht werken",
    definitie: "Een werkwijze gebaseerd op zaken",
    uri: "http://standaarden.overheid.nl/owms/terms/zaakgericht-werken",
  };

  it("creates rdf:type SKOS:Concept", () => {
    const quads = begripToTriples(base);
    const typeTriples = findTriple(quads, "rdf-syntax-ns#type");
    expect(typeTriples.length).toBe(1);
    expect(typeTriples[0].object.value).toContain("skos/core#Concept");
  });

  it("creates skos:prefLabel with Dutch language", () => {
    const quads = begripToTriples(base);
    const labelTriples = findTriple(quads, "skos/core#prefLabel");
    expect(labelTriples.length).toBe(1);
    expect(labelTriples[0].object.value).toBe("Zaakgericht werken");
    expect(labelTriples[0].object.language).toBe("nl");
  });

  it("creates skos:definition when provided", () => {
    const quads = begripToTriples(base);
    const defTriples = findTriple(quads, "skos/core#definition");
    expect(defTriples.length).toBe(1);
  });

  it("skips definition when it equals '(geen definitie)'", () => {
    const quads = begripToTriples({ ...base, definitie: "(geen definitie)" });
    const defTriples = findTriple(quads, "skos/core#definition");
    expect(defTriples.length).toBe(0);
  });

  it("includes toelichting as rdfs:comment", () => {
    const quads = begripToTriples({ ...base, toelichting: "Extra info" });
    const commentTriples = findTriple(quads, "rdf-schema#comment");
    expect(commentTriples.length).toBe(1);
    expect(commentTriples[0].object.value).toBe("Extra info");
  });

  it("excludes toelichting when null", () => {
    const quads = begripToTriples({ ...base, toelichting: null });
    const commentTriples = findTriple(quads, "rdf-schema#comment");
    expect(commentTriples.length).toBe(0);
  });

  it("includes scopeNote when provided", () => {
    const quads = begripToTriples({ ...base, scopeNote: "Scope note text" });
    const scopeTriples = findTriple(quads, "skos/core#scopeNote");
    expect(scopeTriples.length).toBe(1);
  });

  it("includes synoniemen as skos:altLabel", () => {
    const quads = begripToTriples({
      ...base,
      synoniemen: ["ZGW", "Zaakgericht"],
    });
    const altTriples = findTriple(quads, "skos/core#altLabel");
    expect(altTriples.length).toBe(2);
    const values = altTriples.map((t: any) => t.object.value);
    expect(values).toContain("ZGW");
    expect(values).toContain("Zaakgericht");
  });

  it("returns empty array when uri is empty", () => {
    const quads = begripToTriples({ ...base, uri: "" });
    expect(quads).toEqual([]);
  });

  it("uses the provided uri as subject", () => {
    const quads = begripToTriples(base);
    expect(quads[0].subject.value).toBe(base.uri);
  });
});
