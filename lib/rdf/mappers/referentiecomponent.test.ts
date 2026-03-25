import { describe, it, expect } from "vitest";
import { referentiecomponentToTriples } from "./referentiecomponent";

function findTriple(quads: any[], predicateFragment: string) {
  return quads.filter((q) => q.predicate.value.includes(predicateFragment));
}

describe("referentiecomponentToTriples", () => {
  const base = {
    id: "rc-1",
    naam: "e-Formulieren",
  };

  it("creates two rdf:type triples (DCAT Resource + VVC Referentiecomponent)", () => {
    const quads = referentiecomponentToTriples(base);
    const typeTriples = findTriple(quads, "rdf-syntax-ns#type");
    expect(typeTriples.length).toBe(2);
  });

  it("creates schema:name triple", () => {
    const quads = referentiecomponentToTriples(base);
    const nameTriples = findTriple(quads, "schema.org/name");
    expect(nameTriples.length).toBe(1);
    expect(nameTriples[0].object.value).toBe("e-Formulieren");
  });

  it("includes guid as identifier", () => {
    const quads = referentiecomponentToTriples({ ...base, guid: "guid-123" });
    const idTriples = findTriple(quads, "dc/terms/identifier");
    expect(idTriples.length).toBe(1);
    expect(idTriples[0].object.value).toBe("guid-123");
  });

  it("excludes guid when null", () => {
    const quads = referentiecomponentToTriples({ ...base, guid: null });
    const idTriples = findTriple(quads, "dc/terms/identifier");
    expect(idTriples.length).toBe(0);
  });

  it("includes beschrijving when provided", () => {
    const quads = referentiecomponentToTriples({ ...base, beschrijving: "Desc" });
    const descTriples = findTriple(quads, "schema.org/description");
    expect(descTriples.length).toBe(1);
    expect(descTriples[0].object.language).toBe("nl");
  });

  it("includes status when provided", () => {
    const quads = referentiecomponentToTriples({ ...base, status: "actief" });
    const statusTriples = quads.filter(
      (q) => q.predicate.value.includes("status") && !q.predicate.value.includes("syntax")
    );
    expect(statusTriples.length).toBe(1);
    expect(statusTriples[0].object.value).toBe("actief");
  });

  it("returns 3 triples with only required fields", () => {
    const quads = referentiecomponentToTriples(base);
    expect(quads.length).toBe(3); // 2 types + name
  });

  it("uses referentiecomponent URI as subject", () => {
    const quads = referentiecomponentToTriples(base);
    expect(quads[0].subject.value).toContain("referentiecomponent/rc-1");
  });
});
