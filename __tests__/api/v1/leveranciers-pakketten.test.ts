import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/leveranciers/[id]/pakketten/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/leverancier", () => ({
  getLeverancierPakketten: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    leverancier: {
      findUnique: vi.fn(),
    },
  },
}));

import { getLeverancierPakketten } from "@/lib/services/leverancier";
import { prisma } from "@/lib/prisma";

const mockGetLeverancierPakketten = vi.mocked(getLeverancierPakketten);
const mockFindUnique = vi.mocked(prisma.leverancier.findUnique);

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/v1/leveranciers/[id]/pakketten", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourneert pakketten van een leverancier", async () => {
    mockFindUnique.mockResolvedValue({
      id: "lev-1",
      naam: "Centric",
    } as ReturnType<typeof prisma.leverancier.findUnique> extends Promise<infer T> ? T : never);

    mockGetLeverancierPakketten.mockResolvedValue([
      {
        id: "pak-1",
        naam: "Suite4",
        slug: "suite4",
        leverancier: { naam: "Centric" },
        versies: [{ naam: "5.0", status: "In gebruik" }],
      },
      {
        id: "pak-2",
        naam: "Decos JOIN",
        slug: "decos-join",
        leverancier: { naam: "Centric" },
        versies: [],
      },
    ] as unknown as Awaited<ReturnType<typeof getLeverancierPakketten>>);

    const response = await GET(
      createRequest("/api/v1/leveranciers/lev-1/pakketten"),
      { params: Promise.resolve({ id: "lev-1" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].naam).toBe("Suite4");
    expect(body.data[0].laatsteVersie).toEqual({
      naam: "5.0",
      status: "In gebruik",
    });
    expect(body.data[1].laatsteVersie).toBeNull();
    expect(body.meta.total).toBe(2);
    expect(body.meta.leverancierNaam).toBe("Centric");
  });

  it("retourneert 404 voor onbekende leverancier", async () => {
    mockFindUnique.mockResolvedValue(null);

    const response = await GET(
      createRequest("/api/v1/leveranciers/onbekend/pakketten"),
      { params: Promise.resolve({ id: "onbekend" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Leverancier niet gevonden");
  });

  it("retourneert 500 bij interne fout", async () => {
    mockFindUnique.mockRejectedValue(new Error("Connection timeout"));

    const response = await GET(
      createRequest("/api/v1/leveranciers/lev-1/pakketten"),
      { params: Promise.resolve({ id: "lev-1" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Interne serverfout");
  });

  it("retourneert lege lijst als leverancier geen pakketten heeft", async () => {
    mockFindUnique.mockResolvedValue({
      id: "lev-2",
      naam: "Nieuw BV",
    } as ReturnType<typeof prisma.leverancier.findUnique> extends Promise<infer T> ? T : never);

    mockGetLeverancierPakketten.mockResolvedValue([]);

    const response = await GET(
      createRequest("/api/v1/leveranciers/lev-2/pakketten"),
      { params: Promise.resolve({ id: "lev-2" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(0);
    expect(body.meta.total).toBe(0);
  });
});
