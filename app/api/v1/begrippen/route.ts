import { NextRequest, NextResponse } from "next/server";
import { searchLiveBegrippen } from "@/lib/services/begrippen-live";
import { negotiateFormat, isRdfFormat } from "@/lib/rdf/content-negotiation";
import { serializeRdf } from "@/lib/rdf/serializer";
import { begripToTriples } from "@/lib/rdf/mappers";

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

    const data = begrippen.map((b) => ({
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
