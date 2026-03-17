import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { syncBegrippen } from "@/lib/services/begrippen";

export async function POST() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const result = await syncBegrippen();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("Begrippen sync fout:", error);
    return NextResponse.json(
      { error: "Fout bij synchroniseren begrippen" },
      { status: 500 }
    );
  }
}
