import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { approveRegistration, rejectRegistration } from "@/lib/services/user";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    if (body.actie === "goedkeuren") {
      if (!body.rollen || body.rollen.length === 0) {
        return NextResponse.json(
          { error: "Rollen zijn verplicht bij goedkeuren." },
          { status: 400 }
        );
      }

      await approveRegistration(id, {
        rollen: body.rollen,
        gemeenteId: body.gemeenteId || null,
        leverancierId: body.leverancierId || null,
      });

      return NextResponse.json({ message: "Registratie goedgekeurd." });
    }

    if (body.actie === "afwijzen") {
      await rejectRegistration(id, body.reden);
      return NextResponse.json({ message: "Registratie afgewezen." });
    }

    return NextResponse.json(
      { error: "Ongeldige actie. Gebruik 'goedkeuren' of 'afwijzen'." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Er is een fout opgetreden." },
      { status: 500 }
    );
  }
}
