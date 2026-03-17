import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/begrippen/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/begrippen", () => ({
  getBegrippen: vi.fn(),
  getBegrippenCount: vi.fn(),
}));

import { getBegrippen, getBegrippenCount } from "@/lib/services/begrippen";

const mockGetBegrippen = vi.mocked(getBegrippen);
const mockGetBegrippenCount = vi.mocked(getBegrippenCount);

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/v1/begrippen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourneert een lijst begrippen", async () => {
    const mockData = [
      {
        id: "b-1",
        term: "Applicatiefunctie",
        definitie: "Een functie van een applicatie",
        toelichting: "Extra uitleg",
        scopeNote: null,
        bron: "NORA",
        uri: "https://begrippen.noraonline.nl/basisbegrippen/applicatiefunctie",
        synoniemen: ["appfunctie"],
        vocab: "basisbegrippen",
        status: "actief",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "b-2",
        term: "Zaakregistratie",
        definitie: "Het registreren van zaken",
        toelichting: null,
        scopeNote: "Scope info",
        bron: null,
        uri: "https://begrippen.noraonline.nl/basisbegrippen/zaakregistratie",
        synoniemen: [],
        vocab: "basisbegrippen",
        status: "actief",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockGetBegrippen.mockResolvedValue(mockData as Awaited<ReturnType<typeof getBegrippen>>);
    mockGetBegrippenCount.mockResolvedValue(2);

    const response = await GET(createRequest("/api/v1/begrippen"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].term).toBe("Applicatiefunctie");
    expect(body.data[0].definitie).toBe("Een functie van een applicatie");
    expect(body.data[0].synoniemen).toEqual(["appfunctie"]);
    expect(body.data[0].vocab).toBe("basisbegrippen");
    expect(body.meta.total).toBe(2);
    expect(response.headers.get("X-Total-Count")).toBe("2");
  });

  it("ondersteunt zoekparameter", async () => {
    mockGetBegrippen.mockResolvedValue([]);
    mockGetBegrippenCount.mockResolvedValue(0);

    await GET(createRequest("/api/v1/begrippen?zoek=applicatie"));

    expect(mockGetBegrippen).toHaveBeenCalledWith({ zoek: "applicatie" });
    expect(mockGetBegrippenCount).toHaveBeenCalledWith({ zoek: "applicatie" });
  });

  it("retourneert lege lijst bij geen resultaten", async () => {
    mockGetBegrippen.mockResolvedValue([]);
    mockGetBegrippenCount.mockResolvedValue(0);

    const response = await GET(
      createRequest("/api/v1/begrippen?zoek=bestaatniet")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(0);
    expect(body.meta.total).toBe(0);
  });

  it("retourneert 500 bij interne fout", async () => {
    mockGetBegrippen.mockRejectedValue(new Error("DB error"));

    const response = await GET(createRequest("/api/v1/begrippen"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Interne serverfout");
  });

  it("bevat alle NL-SBB velden in response", async () => {
    const mockBegrip = {
      id: "b-1",
      term: "Dienst",
      definitie: "Een afgebakend geheel van functionaliteit",
      toelichting: "Uitleg over dienst",
      scopeNote: "In de context van overheid",
      bron: "NORA Online",
      uri: "https://begrippen.noraonline.nl/basisbegrippen/dienst",
      synoniemen: ["service", "voorziening"],
      vocab: "basisbegrippen",
      status: "actief",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetBegrippen.mockResolvedValue([mockBegrip] as Awaited<ReturnType<typeof getBegrippen>>);
    mockGetBegrippenCount.mockResolvedValue(1);

    const response = await GET(createRequest("/api/v1/begrippen"));
    const body = await response.json();

    const begrip = body.data[0];
    expect(begrip).toHaveProperty("id");
    expect(begrip).toHaveProperty("term");
    expect(begrip).toHaveProperty("definitie");
    expect(begrip).toHaveProperty("toelichting");
    expect(begrip).toHaveProperty("scopeNote");
    expect(begrip).toHaveProperty("bron");
    expect(begrip).toHaveProperty("uri");
    expect(begrip).toHaveProperty("synoniemen");
    expect(begrip).toHaveProperty("vocab");
    // Should not expose internal fields
    expect(begrip).not.toHaveProperty("status");
    expect(begrip).not.toHaveProperty("createdAt");
    expect(begrip).not.toHaveProperty("updatedAt");
  });
});
