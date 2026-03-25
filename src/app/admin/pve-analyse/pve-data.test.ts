import { describe, it, expect } from "vitest";
import { computePveStats, sections, type PveSection, type PveRow } from "./pve-data";

describe("sections data", () => {
  it("is a non-empty array", () => {
    expect(sections.length).toBeGreaterThan(0);
  });

  it("every section has a rows array", () => {
    for (const section of sections) {
      expect(Array.isArray(section.rows)).toBe(true);
    }
  });

  it("every row has required fields", () => {
    const allRows = sections.flatMap((s) => s.rows);
    for (const row of allRows) {
      expect(row.id).toBeTypeOf("string");
      expect(row.id.length).toBeGreaterThan(0);
      expect(row.naam).toBeTypeOf("string");
      expect(row.naam.length).toBeGreaterThan(0);
      expect(["eis", "wens", "could", "nvt"]).toContain(row.prio);
      expect(["yes", "partial", "no", "nvt", "extra"]).toContain(row.status);
      expect(row.toelichting).toBeTypeOf("string");
    }
  });

  it("has both 'eis' and 'wens' priority rows", () => {
    const allRows = sections.flatMap((s) => s.rows);
    expect(allRows.some((r) => r.prio === "eis")).toBe(true);
    expect(allRows.some((r) => r.prio === "wens")).toBe(true);
  });

  it("has rows with all status types (yes, partial, no, extra)", () => {
    const allRows = sections.flatMap((s) => s.rows);
    expect(allRows.some((r) => r.status === "yes")).toBe(true);
    expect(allRows.some((r) => r.status === "partial")).toBe(true);
    expect(allRows.some((r) => r.status === "no")).toBe(true);
    expect(allRows.some((r) => r.status === "extra")).toBe(true);
  });

  it("links start with / when present", () => {
    const allRows = sections.flatMap((s) => s.rows);
    for (const row of allRows) {
      if (row.link) {
        expect(row.link).toMatch(/^\//);
      }
    }
  });
});

describe("computePveStats", () => {
  it("returns all required stat fields", () => {
    const stats = computePveStats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("yes");
    expect(stats).toHaveProperty("partial");
    expect(stats).toHaveProperty("no");
    expect(stats).toHaveProperty("extra");
    expect(stats).toHaveProperty("eisTotal");
    expect(stats).toHaveProperty("eisYes");
    expect(stats).toHaveProperty("eisPartial");
    expect(stats).toHaveProperty("eisNo");
    expect(stats).toHaveProperty("wensTotal");
    expect(stats).toHaveProperty("wensYes");
    expect(stats).toHaveProperty("wensPartial");
    expect(stats).toHaveProperty("wensNo");
    expect(stats).toHaveProperty("couldTotal");
    expect(stats).toHaveProperty("couldYes");
    expect(stats).toHaveProperty("couldPartial");
    expect(stats).toHaveProperty("couldNo");
    expect(stats).toHaveProperty("coveragePercent");
  });

  it("total equals yes + partial + no", () => {
    const stats = computePveStats();
    expect(stats.total).toBe(stats.yes + stats.partial + stats.no);
  });

  it("eis subtotals add up", () => {
    const stats = computePveStats();
    expect(stats.eisTotal).toBe(stats.eisYes + stats.eisPartial + stats.eisNo);
  });

  it("wens subtotals add up", () => {
    const stats = computePveStats();
    expect(stats.wensTotal).toBe(stats.wensYes + stats.wensPartial + stats.wensNo);
  });

  it("could subtotals add up", () => {
    const stats = computePveStats();
    expect(stats.couldTotal).toBe(stats.couldYes + stats.couldPartial + stats.couldNo);
  });

  it("total equals sum of eis + wens + could totals", () => {
    const stats = computePveStats();
    expect(stats.total).toBe(stats.eisTotal + stats.wensTotal + stats.couldTotal);
  });

  it("excludes extra and nvt status rows from total", () => {
    const allRows = sections.flatMap((s) => s.rows);
    const extraCount = allRows.filter((r) => r.status === "extra").length;
    const nvtCount = allRows.filter((r) => r.status === "nvt").length;
    const stats = computePveStats();
    expect(stats.total).toBe(allRows.length - extraCount - nvtCount);
  });

  it("counts extra rows separately", () => {
    const allRows = sections.flatMap((s) => s.rows);
    const extraCount = allRows.filter((r) => r.status === "extra").length;
    const stats = computePveStats();
    expect(stats.extra).toBe(extraCount);
    expect(stats.extra).toBeGreaterThan(0);
  });

  it("coveragePercent is between 0 and 100", () => {
    const stats = computePveStats();
    expect(stats.coveragePercent).toBeGreaterThanOrEqual(0);
    expect(stats.coveragePercent).toBeLessThanOrEqual(100);
  });

  it("coveragePercent is a rounded integer", () => {
    const stats = computePveStats();
    expect(Number.isInteger(stats.coveragePercent)).toBe(true);
  });

  it("coveragePercent matches manual calculation", () => {
    const stats = computePveStats();
    const expected =
      stats.total > 0
        ? Math.round(((stats.yes + stats.partial) / stats.total) * 100)
        : 0;
    expect(stats.coveragePercent).toBe(expected);
  });

  it("has a positive number of eisen", () => {
    const stats = computePveStats();
    expect(stats.eisTotal).toBeGreaterThan(0);
  });

  it("has a positive number of wensen", () => {
    const stats = computePveStats();
    expect(stats.wensTotal).toBeGreaterThan(0);
  });
});
