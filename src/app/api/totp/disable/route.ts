import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";
import { verifyTotpToken, disableTotp } from "@/service/totp";
import { parseBody } from "@/process/validation";
import { logAudit } from "@/service/audit";

const disableSchema = z.object({
  token: z.string().length(6, "Code moet 6 cijfers zijn").regex(/^\d{6}$/, "Code moet 6 cijfers zijn"),
});

/**
 * POST /api/totp/disable - Verify current token and disable TOTP
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const parsed = await parseBody(req, disableSchema);
  if ("error" in parsed) return parsed.error;
  const { token } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true, totpSecret: true },
  });

  if (!user || !user.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ error: "2FA is niet ingeschakeld" }, { status: 400 });
  }

  const isValid = verifyTotpToken(user.totpSecret, token);
  if (!isValid) {
    return NextResponse.json(
      { error: "Ongeldige verificatiecode. Probeer opnieuw." },
      { status: 400 },
    );
  }

  await disableTotp(session.user.id);

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    actie: "totp_disable",
    entiteit: "User",
    entiteitId: session.user.id,
    details: "2FA uitgeschakeld",
  });

  return NextResponse.json({ success: true });
}
