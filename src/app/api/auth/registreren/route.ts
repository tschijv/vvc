import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/data/prisma";
import { registerUser } from "@/service/user";
import { sendEmail } from "@/integration/email";
import { registratieOntvangenEmail } from "@/integration/email-templates";
import { withRateLimit, RATE_LIMITS } from "@/process/rate-limit";
import { parseBody, emailSchema, wachtwoordSchema, naamSchema } from "@/process/validation";

const registratieSchema = z.object({
  naam: naamSchema,
  email: emailSchema,
  wachtwoord: wachtwoordSchema,
  organisatieType: z.enum(["leverancier", "gemeente"], {
    errorMap: () => ({ message: "Kies leverancier of gemeente" }),
  }),
  organisatieNaam: z.string().min(1, "Organisatienaam is verplicht").max(300),
});

export async function POST(req: NextRequest) {
  const blocked = withRateLimit(req, RATE_LIMITS.auth);
  if (blocked) return blocked;
  try {
    const parsed = await parseBody(req, registratieSchema);
    if ("error" in parsed) return parsed.error;
    const { naam, email, wachtwoord, organisatieType, organisatieNaam } = parsed.data;

    // Check of email al bestaat
    const bestaand = await prisma.user.findUnique({ where: { email } });
    if (bestaand) {
      return NextResponse.json(
        { error: "Er bestaat al een account met dit e-mailadres." },
        { status: 409 }
      );
    }

    await registerUser({ email, naam, wachtwoord, organisatieType, organisatieNaam });

    const { subject, html } = registratieOntvangenEmail(naam);
    await sendEmail({ to: email, subject, html });

    return NextResponse.json(
      { message: "Registratie ontvangen. Uw aanmelding wordt beoordeeld." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij de registratie." },
      { status: 500 }
    );
  }
}
