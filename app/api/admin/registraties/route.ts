import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { getPendingRegistrations } from "@/lib/services/user";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const registraties = await getPendingRegistrations();
  return NextResponse.json({ data: registraties });
}
