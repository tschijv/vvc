import { NextRequest, NextResponse } from "next/server";
import { getBegrippen, getBegrippenCount } from "@/lib/services/begrippen";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zoek = searchParams.get("zoek") || undefined;

  try {
    const [begrippen, total] = await Promise.all([
      getBegrippen({ zoek }),
      getBegrippenCount({ zoek }),
    ]);

    const data = begrippen.map((b) => ({
      id: b.id,
      term: b.term,
      definitie: b.definitie,
      toelichting: b.toelichting,
      scopeNote: b.scopeNote,
      bron: b.bron,
      uri: b.uri,
      synoniemen: b.synoniemen,
      vocab: b.vocab,
    }));

    return NextResponse.json(
      { data, meta: { total } },
      { headers: { "X-Total-Count": String(total) } }
    );
  } catch (error) {
    console.error("API v1 begrippen fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
