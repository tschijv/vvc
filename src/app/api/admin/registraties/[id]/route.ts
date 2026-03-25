import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/process/auth-helpers";
import { approveRegistration, rejectRegistration } from "@/service/user";
import { parseBody } from "@/process/validation";

const registratieActieSchema = z.object({
  actie: z.enum(["goedkeuren", "afwijzen"], {
    errorMap: () => ({ message: "Ongeldige actie. Gebruik 'goedkeuren' of 'afwijzen'." }),
  }),
  rollen: z.array(z.string()).optional(),
  organisatieId: z.string().nullable().optional(),
  leverancierId: z.string().nullable().optional(),
  reden: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;

  const parsed = await parseBody(req, registratieActieSchema);
  if ("error" in parsed) return parsed.error;
  const { actie, rollen, organisatieId, leverancierId, reden } = parsed.data;

  try {
    if (actie === "goedkeuren") {
      if (!rollen || rollen.length === 0) {
        return NextResponse.json(
          { error: "Rollen zijn verplicht bij goedkeuren." },
          { status: 400 }
        );
      }

      await approveRegistration(id, {
        rollen,
        organisatieId: organisatieId || null,
        leverancierId: leverancierId || null,
      });

      return NextResponse.json({ message: "Registratie goedgekeurd." });
    }

    if (actie === "afwijzen") {
      await rejectRegistration(id, reden);
      return NextResponse.json({ message: "Registratie afgewezen." });
    }
  } catch {
    return NextResponse.json(
      { error: "Er is een fout opgetreden." },
      { status: 500 }
    );
  }
}
