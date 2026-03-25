import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/process/auth";
import { parseBody } from "@/process/validation";
import { switchActiveOrganisatie } from "@/process/auth-helpers";
import { logAudit } from "@/service/audit";

const switchSchema = z.object({
  organisatieId: z.string().min(1, "organisatieId is verplicht"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const parsed = await parseBody(req, switchSchema);
  if ("error" in parsed) return parsed.error;

  const { organisatieId } = parsed.data;
  const success = await switchActiveOrganisatie(session.user.id, organisatieId);

  if (!success) {
    return NextResponse.json(
      { error: "Geen toegang tot deze organisatie" },
      { status: 403 }
    );
  }

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    actie: "switch-organisatie",
    entiteit: "User",
    entiteitId: session.user.id,
    details: `Switched to organisatie ${organisatieId}`,
  });

  return NextResponse.json({ ok: true });
}
