import { NextResponse } from "next/server";
import { getLiveBegrippenForGlossary } from "@/lib/services/begrippen-live";

export async function GET() {
  try {
    const begrippen = await getLiveBegrippenForGlossary();

    return NextResponse.json(begrippen, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Begrippen ophalen fout:", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
