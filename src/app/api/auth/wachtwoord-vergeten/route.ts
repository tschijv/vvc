import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "@/data/prisma";
import { sendEmail } from "@/integration/email";
import { wachtwoordResetEmail } from "@/integration/email-templates";
import { parseBody, emailSchema } from "@/process/validation";

const vergetenSchema = z.object({
  email: emailSchema,
});

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, vergetenSchema);
    if ("error" in parsed) return parsed.error;
    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "Als dit e-mailadres bij ons bekend is, ontvangt u een e-mail met instructies.",
      });
    }

    // Invalidate existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/wachtwoord-reset?token=${token}`;

    const { subject, html } = wachtwoordResetEmail(user.naam, resetUrl);
    await sendEmail({ to: user.email, subject, html });

    return NextResponse.json({
      message: "Als dit e-mailadres bij ons bekend is, ontvangt u een e-mail met instructies.",
    });
  } catch {
    return NextResponse.json(
      { error: "Er is een fout opgetreden." },
      { status: 500 }
    );
  }
}
