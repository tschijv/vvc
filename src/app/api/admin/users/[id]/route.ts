import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserById, updateUser, deleteUser } from "@/service/user";
import { parseBody } from "@/process/validation";
import { getSessionUser } from "@/process/auth-helpers";

const updateUserSchema = z.object({
  naam: z.string().optional(),
  email: z.string().email().optional(),
  wachtwoord: z.string().optional(),
  actief: z.boolean().optional(),
  rollen: z.array(z.string()).optional(),
  organisatieId: z.string().nullable().optional(),
  leverancierId: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  const targetUser = await getUserById(id);
  if (!targetUser) {
    return NextResponse.json(
      { error: "Gebruiker niet gevonden" },
      { status: 404 }
    );
  }
  return NextResponse.json(targetUser);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const parsed = await parseBody(request, updateUserSchema);
    if ("error" in parsed) return parsed.error;
    const { naam, email, wachtwoord, actief, rollen, organisatieId, leverancierId } = parsed.data;

    const updatedUser = await updateUser(id, {
      ...(naam !== undefined && { naam }),
      ...(email !== undefined && { email }),
      ...(wachtwoord && { wachtwoord }),
      ...(actief !== undefined && { actief }),
      ...(rollen !== undefined && { rollen }),
      ...(organisatieId !== undefined && { organisatieId }),
      ...(leverancierId !== undefined && { leverancierId }),
    });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error("Internal error:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Internal error:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
