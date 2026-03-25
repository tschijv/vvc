import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { getPendingRegistrations } from "@/lib/services/user";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const blocked = withRateLimit(request, RATE_LIMITS.admin);
  if (blocked) return blocked;
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const registraties = await getPendingRegistrations();
  return NextResponse.json({ data: registraties });
}
