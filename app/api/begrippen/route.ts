import { NextResponse } from "next/server";
import { getAllBegrippenForGlossary } from "@/lib/services/begrippen";

export async function GET() {
  try {
    const begrippen = await getAllBegrippenForGlossary();

    return NextResponse.json(begrippen, {
      headers: {
        "Cache-Control": "public, max-age=300",
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
