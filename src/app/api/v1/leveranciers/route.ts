import { NextRequest, NextResponse } from "next/server";
import {
  getLeveranciers,
  getLeverancierCount,
} from "@/service/leverancier";
import { negotiateFormat, isRdfFormat } from "@/integration/rdf/content-negotiation";
import { serializeRdf } from "@/integration/rdf/serializer";
import { leverancierToTriples } from "@/integration/rdf/mappers";
import { withRateLimit, RATE_LIMITS } from "@/process/rate-limit";
import type { components } from "@/integration/api-types";

type LeverancierSummary = components["schemas"]["LeverancierSummary"];
type PaginationMeta = components["schemas"]["PaginationMeta"];

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
      const leveranciers = await getLeveranciers({ zoek, skip: offset, take: limit });
      const quads = leveranciers.flatMap((l) => leverancierToTriples(l));
      return serializeRdf(quads, format);
    }

    const [leveranciers, total] = await Promise.all([
      getLeveranciers({ zoek, skip: offset, take: limit }),
      getLeverancierCount({ zoek }),
    ]);

    const data: LeverancierSummary[] = leveranciers.map((l) => ({
      id: l.id,
      naam: l.naam,
      slug: l.slug,
      contactpersoon: l.contactpersoon,
      email: l.email,
      website: l.website,
      beschrijvingDiensten: l.beschrijvingDiensten,
      supportPortalUrl: l.supportPortalUrl,
      documentatieUrl: l.documentatieUrl,
      kennisbankUrl: l.kennisbankUrl,
      aantalPakketten: l._count.pakketten,
      addenda: l.addenda.map((a) => a.addendum.naam),
    }));

    const meta: PaginationMeta = { total, offset, limit };

    return NextResponse.json(
      { data, meta },
      { headers: { "X-Total-Count": String(total) } }
    );
  } catch (error) {
    console.error("API v1 leveranciers fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
