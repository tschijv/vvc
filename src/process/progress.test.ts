import { describe, it, expect } from "vitest";
import { progressToStars, sterrenDisplay, STAR_LABELS } from "./progress";

describe("progressToStars", () => {
  it("returns 5 stars for 100%", () => {
    expect(progressToStars(100)).toBe(5);
  });

  it("returns 5 stars for values above 100", () => {
    expect(progressToStars(150)).toBe(5);
    expect(progressToStars(999)).toBe(5);
  });

  it("returns 4 stars for 75-99%", () => {
    expect(progressToStars(75)).toBe(4);
    expect(progressToStars(99)).toBe(4);
    expect(progressToStars(85)).toBe(4);
  });

  it("returns 3 stars for 50-74%", () => {
    expect(progressToStars(50)).toBe(3);
    expect(progressToStars(74)).toBe(3);
    expect(progressToStars(60)).toBe(3);
  });

  it("returns 2 stars for 25-49%", () => {
    expect(progressToStars(25)).toBe(2);
    expect(progressToStars(49)).toBe(2);
    expect(progressToStars(30)).toBe(2);
  });

  it("returns 1 star for 0-24%", () => {
    expect(progressToStars(0)).toBe(1);
    expect(progressToStars(24)).toBe(1);
    expect(progressToStars(1)).toBe(1);
  });

  it("returns 1 star for negative values", () => {
    expect(progressToStars(-10)).toBe(1);
    expect(progressToStars(-100)).toBe(1);
  });

  it("handles exact boundary values", () => {
    expect(progressToStars(24.9)).toBe(1);
    expect(progressToStars(25)).toBe(2);
    expect(progressToStars(49.9)).toBe(2);
    expect(progressToStars(50)).toBe(3);
    expect(progressToStars(74.9)).toBe(3);
    expect(progressToStars(75)).toBe(4);
    expect(progressToStars(99.9)).toBe(4);
    expect(progressToStars(100)).toBe(5);
  });
});

describe("sterrenDisplay", () => {
  it("returns array of length 5", () => {
    expect(sterrenDisplay(0)).toHaveLength(5);
    expect(sterrenDisplay(50)).toHaveLength(5);
    expect(sterrenDisplay(100)).toHaveLength(5);
  });

  it("returns all filled stars for 100%", () => {
    expect(sterrenDisplay(100)).toEqual(["★", "★", "★", "★", "★"]);
  });

  it("returns 1 filled star for 0%", () => {
    expect(sterrenDisplay(0)).toEqual(["★", "☆", "☆", "☆", "☆"]);
  });

  it("returns 3 filled stars for 50%", () => {
    expect(sterrenDisplay(50)).toEqual(["★", "★", "★", "☆", "☆"]);
  });

  it("returns 4 filled stars for 75%", () => {
    expect(sterrenDisplay(75)).toEqual(["★", "★", "★", "★", "☆"]);
  });

  it("returns 2 filled stars for 30%", () => {
    expect(sterrenDisplay(30)).toEqual(["★", "★", "☆", "☆", "☆"]);
  });
});

describe("STAR_LABELS", () => {
  it("has labels for 0 through 5", () => {
    expect(STAR_LABELS[0]).toBe("Geen data");
    expect(STAR_LABELS[1]).toBe("1 ster");
    expect(STAR_LABELS[2]).toBe("2 sterren");
    expect(STAR_LABELS[3]).toBe("3 sterren");
    expect(STAR_LABELS[4]).toBe("4 sterren");
    expect(STAR_LABELS[5]).toBe("5 sterren");
  });

  it("has exactly 6 entries", () => {
    expect(Object.keys(STAR_LABELS)).toHaveLength(6);
  });

  it("uses singular for 1 star", () => {
    expect(STAR_LABELS[1]).toContain("ster");
    expect(STAR_LABELS[1]).not.toContain("sterren");
  });

  it("uses plural for 2+ stars", () => {
    expect(STAR_LABELS[2]).toContain("sterren");
    expect(STAR_LABELS[3]).toContain("sterren");
    expect(STAR_LABELS[4]).toContain("sterren");
    expect(STAR_LABELS[5]).toContain("sterren");
  });
});
