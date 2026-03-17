import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/leveranciers/route";
import { GET as GETDetail } from "@/app/api/v1/leveranciers/[id]/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/leverancier", () => ({
  getLeveranciers: vi.fn(),
  getLeverancierCount: vi.fn(),
  getLeverancierById: vi.fn(),
}));

import {
  getLeveranciers,
  getLeverancierCount,
  getLeverancierById,
} from "@/lib/services/leverancier";

const mockGetLeveranciers = vi.mocked(getLeveranciers);
const mockGetLeverancierCount = vi.mocked(getLeverancierCount);
const mockGetLeverancierById = vi.mocked(getLeverancierById);

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/v1/leveranciers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourneert een lijst leveranciers", async () => {
    mockGetLeveranciers.mockResolvedValue([
      {
        id: "lev-1",
        naam: "Centric",
        slug: "centric",
        contactpersoon: "Jan",
        email: "jan@centric.nl",
        website: "https://centric.nl",
        _count: { pakketten: 15 },
        addenda: [{ addendum: { naam: "Addendum A" } }],
      },
    ] as unknown as Awaited<ReturnType<typeof getLeveranciers>>);
    mockGetLeverancierCount.mockResolvedValue(1);

    const response = await GET(createRequest("/api/v1/leveranciers"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].naam).toBe("Centric");
    expect(body.data[0].aantalPakketten).toBe(15);
    expect(body.data[0].addenda).toEqual(["Addendum A"]);
    expect(body.meta.total).toBe(1);
  });

  it("ondersteunt zoekparameter", async () => {
    mockGetLeveranciers.mockResolvedValue([]);
    mockGetLeverancierCount.mockResolvedValue(0);

    await GET(createRequest("/api/v1/leveranciers?zoek=Centr"));

    expect(mockGetLeveranciers).toHaveBeenCalledWith(
      expect.objectContaining({ zoek: "Centr" })
    );
  });
});

describe("GET /api/v1/leveranciers/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourneert leverancier detail", async () => {
    mockGetLeverancierById.mockResolvedValue({
      id: "lev-1",
      naam: "Centric",
      slug: "centric",
      contactpersoon: "Jan",
      email: "jan@centric.nl",
      website: "https://centric.nl",
      telefoon: "030-1234567",
      addenda: [{ addendum: { naam: "Addendum A" } }],
      pakketten: [
        {
          id: "pak-1",
          naam: "Suite4",
          slug: "suite4",
          versies: [{ naam: "5.0", status: "In gebruik" }],
        },
      ],
    } as unknown as Awaited<ReturnType<typeof getLeverancierById>>);

    const response = await GETDetail(
      createRequest("/api/v1/leveranciers/lev-1"),
      { params: Promise.resolve({ id: "lev-1" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.naam).toBe("Centric");
    expect(body.data.pakketten).toHaveLength(1);
    expect(body.data.pakketten[0].laatsteVersie.naam).toBe("5.0");
  });

  it("retourneert 404 voor onbekende leverancier", async () => {
    mockGetLeverancierById.mockResolvedValue(null);

    const response = await GETDetail(
      createRequest("/api/v1/leveranciers/onbekend"),
      { params: Promise.resolve({ id: "onbekend" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Leverancier niet gevonden");
  });

  it("retourneert 500 bij interne fout (detail)", async () => {
    mockGetLeverancierById.mockRejectedValue(new Error("DB error"));

    const response = await GETDetail(
      createRequest("/api/v1/leveranciers/lev-1"),
      { params: Promise.resolve({ id: "lev-1" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Interne serverfout");
  });
});

describe("GET /api/v1/leveranciers - error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourneert 500 bij interne fout (lijst)", async () => {
    mockGetLeveranciers.mockRejectedValue(new Error("DB timeout"));
    mockGetLeverancierCount.mockResolvedValue(0);

    const response = await GET(createRequest("/api/v1/leveranciers"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Interne serverfout");
  });

  it("beperkt limit tot maximum 200", async () => {
    mockGetLeveranciers.mockResolvedValue([]);
    mockGetLeverancierCount.mockResolvedValue(0);

    await GET(createRequest("/api/v1/leveranciers?limit=999"));

    expect(mockGetLeveranciers).toHaveBeenCalledWith(
      expect.objectContaining({ take: 200 })
    );
  });
});
