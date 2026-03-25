import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserById, updateUser, deleteUser } from "@/lib/services/user";
import { parseBody } from "@/lib/validation";

const updateUserSchema = z.object({
  naam: z.string().optional(),
  email: z.string().email().optional(),
  wachtwoord: z.string().optional(),
  actief: z.boolean().optional(),
  rollen: z.array(z.string()).optional(),
  gemeenteId: z.string().nullable().optional(),
  leverancierId: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) {
    return NextResponse.json(
      { error: "Gebruiker niet gevonden" },
      { status: 404 }
    );
  }
  return NextResponse.json(user);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const parsed = await parseBody(request, updateUserSchema);
    if ("error" in parsed) return parsed.error;
    const { naam, email, wachtwoord, actief, rollen, gemeenteId, leverancierId } = parsed.data;

    const user = await updateUser(id, {
      ...(naam !== undefined && { naam }),
      ...(email !== undefined && { email }),
      ...(wachtwoord && { wachtwoord }),
      ...(actief !== undefined && { actief }),
      ...(rollen !== undefined && { rollen }),
      ...(gemeenteId !== undefined && { gemeenteId }),
      ...(leverancierId !== undefined && { leverancierId }),
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Onbekende fout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Onbekende fout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
