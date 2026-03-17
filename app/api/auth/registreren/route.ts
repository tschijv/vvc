import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerUser } from "@/lib/services/user";
import { sendEmail } from "@/lib/email";
import { registratieOntvangenEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { naam, email, wachtwoord, organisatieType, organisatieNaam } = body;

    // Validatie
    if (!naam || !email || !wachtwoord || !organisatieType || !organisatieNaam) {
      return NextResponse.json(
        { error: "Alle velden zijn verplicht." },
        { status: 400 }
      );
    }

    if (wachtwoord.length < 8) {
      return NextResponse.json(
        { error: "Wachtwoord moet minimaal 8 tekens bevatten." },
        { status: 400 }
      );
    }

    if (!["leverancier", "gemeente"].includes(organisatieType)) {
      return NextResponse.json(
        { error: "Ongeldig organisatietype." },
        { status: 400 }
      );
    }

    // Check of email al bestaat
    const bestaand = await prisma.user.findUnique({ where: { email } });
    if (bestaand) {
      return NextResponse.json(
        { error: "Er bestaat al een account met dit e-mailadres." },
        { status: 409 }
      );
    }

    await registerUser({
      email,
      naam,
      wachtwoord,
      organisatieType,
      organisatieNaam,
    });

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
