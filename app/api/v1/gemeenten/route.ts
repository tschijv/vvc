import { NextRequest, NextResponse } from "next/server";
import { getGemeenten, getGemeenteCount } from "@/lib/services/gemeente";
import { negotiateFormat, isRdfFormat } from "@/lib/rdf/content-negotiation";
import { serializeRdf } from "@/lib/rdf/serializer";
import { gemeenteToTriples } from "@/lib/rdf/mappers";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(request: NextRequest) {
  const blocked = withRateLimit(request, RATE_LIMITS.api);
  if (blocked) return blocked;
  const format = negotiateFormat(request);
  const { searchParams } = new URL(request.url);
  const zoek = searchParams.get("zoek") || undefined;
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0") || 0);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT)) || DEFAULT_LIMIT)
  );

  try {
    if (isRdfFormat(format)) {
      const gemeenten = await getGemeenten({ zoek, skip: offset, take: limit });
      const quads = gemeenten.flatMap((g) => gemeenteToTriples(g));
      return serializeRdf(quads, format);
    }

    const [gemeenten, total] = await Promise.all([
      getGemeenten({ zoek, skip: offset, take: limit }),
      getGemeenteCount({ zoek }),
    ]);

    const data = gemeenten.map((g) => ({
      id: g.id,
      naam: g.naam,
      cbsCode: g.cbsCode,
      progress: g.progress,
      aantalPakketten: g._count.pakketten,
    }));

    return NextResponse.json(
      { data, meta: { total, offset, limit } },
      { headers: { "X-Total-Count": String(total) } }
    );
  } catch (error) {
    console.error("API v1 gemeenten fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
