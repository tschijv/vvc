import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { parseBody, idSchema } from "@/lib/validation";

const updateAddendumSchema = z.object({
  leverancierId: idSchema,
  addendumId: idSchema,
  deadline: z.string().nullable().optional(),
  datumGereed: z.string().nullable().optional(),
});

export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || !["ADMIN", "LEVERANCIER"].includes(user.role)) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const parsed = await parseBody(request, updateAddendumSchema);
    if ("error" in parsed) return parsed.error;
    const { leverancierId, addendumId, deadline, datumGereed } = parsed.data;

    const updated = await prisma.leverancierAddendum.update({
      where: {
        leverancierId_addendumId: { leverancierId, addendumId },
      },
      data: {
        deadline: deadline ? new Date(deadline) : null,
        ondertekend: datumGereed ? new Date(datumGereed) : null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update addendum error:", error);
    return NextResponse.json(
      { error: "Fout bij opslaan" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const deleteSchema = z.object({ leverancierId: idSchema, addendumId: idSchema });
    const parsed = await parseBody(request, deleteSchema);
    if ("error" in parsed) return parsed.error;
    const { leverancierId, addendumId } = parsed.data;

    await prisma.leverancierAddendum.delete({
      where: {
        leverancierId_addendumId: { leverancierId, addendumId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete addendum error:", error);
    return NextResponse.json(
      { error: "Fout bij verwijderen" },
      { status: 500 }
    );
  }
}
