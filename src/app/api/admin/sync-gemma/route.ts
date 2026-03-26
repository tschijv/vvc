import { NextResponse } from "next/server";
import { getSessionUser } from "@/process/auth-helpers";
import { runFullSync } from "@/service/gemma";

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
    console.error("Internal error:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
