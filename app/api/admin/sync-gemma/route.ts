import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { runFullSync } from "@/lib/services/gemma";

export async function POST() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const { results, viewSync } = await runFullSync();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      viewSync,
    });
  } catch (error) {
    console.error("GEMMA sync fout:", error);
    return NextResponse.json(
      {
        error: "Synchronisatie mislukt",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
