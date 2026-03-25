import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { parseBody, wachtwoordSchema } from "@/lib/validation";

const resetSchema = z.object({
  token: z.string().min(1, "Token is verplicht"),
  wachtwoord: wachtwoordSchema,
});

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, resetSchema);
    if ("error" in parsed) return parsed.error;
    const { token, wachtwoord } = parsed.data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Ongeldige of verlopen link." },
        { status: 400 }
      );
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "Deze link is al gebruikt." },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Deze link is verlopen. Vraag een nieuwe aan." },
        { status: 400 }
      );
    }

    const passwordHash = await hash(wachtwoord, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      message: "Wachtwoord succesvol gewijzigd. U kunt nu inloggen.",
    });
  } catch {
    return NextResponse.json(
      { error: "Er is een fout opgetreden." },
      { status: 500 }
    );
  }
}
