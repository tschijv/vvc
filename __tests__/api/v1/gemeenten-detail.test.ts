import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/gemeenten/[id]/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/services/gemeente", () => ({
  getGemeenteById: vi.fn(),
}));

import { getGemeenteById } from "@/lib/services/gemeente";

const mockGetGemeenteById = vi.mocked(getGemeenteById);

function createRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/v1/gemeenten/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourneert gemeente detail met samenwerkingen", async () => {
    mockGetGemeenteById.mockResolvedValue({
      id: "gem-1",
      naam: "Amsterdam",
      cbsCode: "0363",
      progress: 85,
      contactpersoon: "Jan de Vries",
      email: "jan@amsterdam.nl",
      website: "https://amsterdam.nl",
      telefoon: "020-1234567",
      samenwerkingen: [
        {
          samenwerking: {
            naam: "Dimpact",
            type: "Coöperatie",
          },
        },
        {
          samenwerking: {
            naam: "VNG Realisatie",
            type: "Stichting",
          },
        },
      ],
    } as unknown as Awaited<ReturnType<typeof getGemeenteById>>);

    const response = await GET(createRequest("/api/v1/gemeenten/gem-1"), {
      params: Promise.resolve({ id: "gem-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.naam).toBe("Amsterdam");
    expect(body.data.cbsCode).toBe("0363");
    expect(body.data.progress).toBe(85);
    expect(body.data.contactpersoon).toBe("Jan de Vries");
    expect(body.data.samenwerkingen).toHaveLength(2);
    expect(body.data.samenwerkingen[0]).toEqual({
      naam: "Dimpact",
      type: "Coöperatie",
    });
  });

  it("retourneert 404 voor onbekende gemeente", async () => {
    mockGetGemeenteById.mockResolvedValue(null);

    const response = await GET(
      createRequest("/api/v1/gemeenten/onbekend"),
      { params: Promise.resolve({ id: "onbekend" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Gemeente niet gevonden");
  });

  it("retourneert 500 bij interne fout", async () => {
    mockGetGemeenteById.mockRejectedValue(new Error("DB connection lost"));

    const response = await GET(createRequest("/api/v1/gemeenten/gem-1"), {
      params: Promise.resolve({ id: "gem-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Interne serverfout");
  });

  it("retourneert gemeente zonder samenwerkingen", async () => {
    mockGetGemeenteById.mockResolvedValue({
      id: "gem-2",
      naam: "Sliedrecht",
      cbsCode: "0610",
      progress: 30,
      contactpersoon: null,
      email: null,
      website: null,
      telefoon: null,
      samenwerkingen: [],
    } as unknown as Awaited<ReturnType<typeof getGemeenteById>>);

    const response = await GET(createRequest("/api/v1/gemeenten/gem-2"), {
      params: Promise.resolve({ id: "gem-2" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.samenwerkingen).toHaveLength(0);
    expect(body.data.contactpersoon).toBeNull();
  });
});
