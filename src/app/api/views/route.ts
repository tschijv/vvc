import { NextResponse } from "next/server";
import { getSessionUser } from "@/process/auth-helpers";
import { prisma } from "@/data/prisma";

/**
 * GET /api/views
 * Retourneert alle actieve GEMMA views, gegroepeerd op domein.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "GEMEENTE" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const views = await prisma.gemmaView.findMany({
    where: { actief: true },
    orderBy: [{ domein: "asc" }, { volgorde: "asc" }],
  });

  return NextResponse.json(views);
}
