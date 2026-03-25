import { NextRequest, NextResponse } from "next/server";
import { searchLiveBegrippen } from "@/service/begrippen-live";
import { negotiateFormat, isRdfFormat } from "@/integration/rdf/content-negotiation";
import { serializeRdf } from "@/integration/rdf/serializer";
import { begripToTriples } from "@/integration/rdf/mappers";
import type { components } from "@/integration/api-types";

type Begrip = components["schemas"]["Begrip"];

export async function GET(request: NextRequest) {
  const format = negotiateFormat(request);
  const { searchParams } = new URL(request.url);
  const zoek = searchParams.get("zoek") || undefined;

  try {
    const begrippen = await searchLiveBegrippen(zoek);

    if (isRdfFormat(format)) {
      const quads = begrippen.flatMap((b) => begripToTriples(b));
      return serializeRdf(quads, format);
    }

    const data: Begrip[] = begrippen.map((b) => ({
      term: b.term,
      definitie: b.definitie,
      toelichting: b.toelichting,
      scopeNote: b.scopeNote,
      uri: b.uri,
      synoniemen: b.synoniemen,
      vocab: b.vocab,
    }));

    return NextResponse.json(
      { data, meta: { total: data.length } },
      { headers: { "X-Total-Count": String(data.length) } }
    );
  } catch (error) {
    console.error("API v1 begrippen fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
