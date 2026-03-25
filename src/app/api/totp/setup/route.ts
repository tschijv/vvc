import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/process/auth";
import { prisma } from "@/data/prisma";
import { generateTotpSecret, enableTotp } from "@/service/totp";
import { parseBody } from "@/process/validation";
import { logAudit } from "@/service/audit";

const enableSchema = z.object({
  secret: z.string().min(1, "Secret is verplicht"),
  token: z.string().length(6, "Code moet 6 cijfers zijn").regex(/^\d{6}$/, "Code moet 6 cijfers zijn"),
});

/**
 * GET /api/totp/setup - Generate a new TOTP secret and QR code
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, totpEnabled: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  if (user.totpEnabled) {
    return NextResponse.json({ error: "2FA is al ingeschakeld" }, { status: 400 });
  }

  const { secret, qrCodeDataUrl } = await generateTotpSecret(user.email);

  return NextResponse.json({ secret, qrCodeDataUrl });
}

/**
 * POST /api/totp/setup - Verify token and enable TOTP
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const parsed = await parseBody(req, enableSchema);
  if ("error" in parsed) return parsed.error;
  const { secret, token } = parsed.data;

  const success = await enableTotp(session.user.id, secret, token);

  if (!success) {
    return NextResponse.json(
      { error: "Ongeldige verificatiecode. Probeer opnieuw." },
      { status: 400 },
    );
  }

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    actie: "totp_enable",
    entiteit: "User",
    entiteitId: session.user.id,
    details: "2FA ingeschakeld",
  });

  return NextResponse.json({ success: true });
}
