import { NextRequest, NextResponse } from "next/server";
import { getStandaarden } from "@/lib/services/standaard";
import { negotiateFormat, isRdfFormat } from "@/lib/rdf/content-negotiation";
import { serializeRdf } from "@/lib/rdf/serializer";
import { standaardToTriples } from "@/lib/rdf/mappers";

export async function GET(request: NextRequest) {
  const format = negotiateFormat(request);
  const { searchParams } = new URL(request.url);
  const zoek = searchParams.get("zoek") || undefined;

  try {
    const standaarden = await getStandaarden({ zoek });

    if (isRdfFormat(format)) {
      const quads = standaarden.flatMap((s) => standaardToTriples(s));
      return serializeRdf(quads, format);
    }

    const data = standaarden.map((s) => ({
      id: s.id,
      naam: s.naam,
      guid: s.guid,
      beschrijving: s.beschrijving,
      versies: s.versies.map((v) => ({
        id: v.id,
        naam: v.naam,
        aantalPakketversies: v._count.pakketten,
      })),
      totaalPakketversies: s.versies.reduce(
        (sum, v) => sum + v._count.pakketten,
        0
      ),
    }));

    return NextResponse.json(
      { data, meta: { total: data.length } },
      { headers: { "X-Total-Count": String(data.length) } }
    );
  } catch (error) {
    console.error("API v1 standaarden fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
