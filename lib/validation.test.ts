import { describe, it, expect } from "vitest";
import {
  emailSchema,
  wachtwoordSchema,
  naamSchema,
  idSchema,
  slugSchema,
  paginaSchema,
  zoekSchema,
  parseSearchParams,
} from "./validation";
import { z } from "zod";

describe("emailSchema", () => {
  it("accepts valid email addresses", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
    expect(emailSchema.safeParse("a@b.nl").success).toBe(true);
    expect(emailSchema.safeParse("test.user+tag@domain.co.uk").success).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
    expect(emailSchema.safeParse("notanemail").success).toBe(false);
    expect(emailSchema.safeParse("@domain.com").success).toBe(false);
    expect(emailSchema.safeParse("user@").success).toBe(false);
  });

  it("rejects emails longer than 255 characters", () => {
    const longEmail = "a".repeat(250) + "@b.com";
    expect(emailSchema.safeParse(longEmail).success).toBe(false);
  });

  it("provides Dutch error message for invalid email", () => {
    const result = emailSchema.safeParse("invalid");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Ongeldig e-mailadres");
    }
  });
});

describe("wachtwoordSchema", () => {
  it("accepts passwords of 8+ characters", () => {
    expect(wachtwoordSchema.safeParse("12345678").success).toBe(true);
    expect(wachtwoordSchema.safeParse("a very long password").success).toBe(true);
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(wachtwoordSchema.safeParse("1234567").success).toBe(false);
    expect(wachtwoordSchema.safeParse("").success).toBe(false);
    expect(wachtwoordSchema.safeParse("abc").success).toBe(false);
  });

  it("rejects passwords longer than 128 characters", () => {
    expect(wachtwoordSchema.safeParse("a".repeat(129)).success).toBe(false);
  });

  it("accepts passwords of exactly 128 characters", () => {
    expect(wachtwoordSchema.safeParse("a".repeat(128)).success).toBe(true);
  });

  it("provides Dutch error message for short password", () => {
    const result = wachtwoordSchema.safeParse("short");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Minimaal 8 tekens");
    }
  });
});

describe("naamSchema", () => {
  it("accepts valid names", () => {
    expect(naamSchema.safeParse("Jan").success).toBe(true);
    expect(naamSchema.safeParse("Jan de Vries").success).toBe(true);
  });

  it("rejects empty names", () => {
    expect(naamSchema.safeParse("").success).toBe(false);
  });

  it("rejects names longer than 200 characters", () => {
    expect(naamSchema.safeParse("a".repeat(201)).success).toBe(false);
  });

  it("accepts names of exactly 200 characters", () => {
    expect(naamSchema.safeParse("a".repeat(200)).success).toBe(true);
  });

  it("provides Dutch error message", () => {
    const result = naamSchema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Naam is verplicht");
    }
  });
});

describe("idSchema", () => {
  it("accepts valid UUIDs", () => {
    expect(idSchema.safeParse("550e8400-e29b-41d4-a716-446655440000").success).toBe(true);
    expect(idSchema.safeParse("6ba7b810-9dad-11d1-80b4-00c04fd430c8").success).toBe(true);
  });

  it("rejects non-UUID strings", () => {
    expect(idSchema.safeParse("not-a-uuid").success).toBe(false);
    expect(idSchema.safeParse("").success).toBe(false);
    expect(idSchema.safeParse("12345").success).toBe(false);
  });

  it("provides Dutch error message", () => {
    const result = idSchema.safeParse("invalid");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Ongeldig ID");
    }
  });
});

describe("slugSchema", () => {
  it("accepts valid slugs", () => {
    expect(slugSchema.safeParse("my-slug").success).toBe(true);
    expect(slugSchema.safeParse("a").success).toBe(true);
  });

  it("rejects empty slugs", () => {
    expect(slugSchema.safeParse("").success).toBe(false);
  });

  it("rejects slugs longer than 200 characters", () => {
    expect(slugSchema.safeParse("a".repeat(201)).success).toBe(false);
  });
});

describe("paginaSchema", () => {
  it("defaults to 1 when undefined", () => {
    expect(paginaSchema.parse(undefined)).toBe(1);
  });

  it("coerces string numbers", () => {
    expect(paginaSchema.parse("5")).toBe(5);
    expect(paginaSchema.parse("1")).toBe(1);
  });

  it("accepts positive integers", () => {
    expect(paginaSchema.parse(1)).toBe(1);
    expect(paginaSchema.parse(100)).toBe(100);
  });

  it("rejects 0 and negative numbers", () => {
    expect(paginaSchema.safeParse(0).success).toBe(false);
    expect(paginaSchema.safeParse(-1).success).toBe(false);
  });

  it("rejects non-integer numbers", () => {
    expect(paginaSchema.safeParse(1.5).success).toBe(false);
  });
});

describe("zoekSchema", () => {
  it("accepts a search string", () => {
    expect(zoekSchema.safeParse("pakket zoeken").success).toBe(true);
  });

  it("accepts undefined (optional)", () => {
    expect(zoekSchema.safeParse(undefined).success).toBe(true);
  });

  it("rejects strings longer than 200 characters", () => {
    expect(zoekSchema.safeParse("a".repeat(201)).success).toBe(false);
  });

  it("accepts empty string", () => {
    expect(zoekSchema.safeParse("").success).toBe(true);
  });
});

describe("parseSearchParams", () => {
  const testSchema = z.object({
    pagina: paginaSchema,
    zoek: zoekSchema,
  });

  it("parses valid search params", () => {
    const result = parseSearchParams(
      "https://example.com?pagina=2&zoek=test",
      testSchema
    );
    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data.pagina).toBe(2);
      expect(result.data.zoek).toBe("test");
    }
  });

  it("uses defaults for missing params", () => {
    const result = parseSearchParams("https://example.com", testSchema);
    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data.pagina).toBe(1);
    }
  });

  it("returns error for invalid params", () => {
    const strictSchema = z.object({ id: idSchema });
    const result = parseSearchParams(
      "https://example.com?id=not-uuid",
      strictSchema
    );
    expect("error" in result).toBe(true);
  });
});
