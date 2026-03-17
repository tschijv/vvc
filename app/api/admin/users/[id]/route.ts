import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/lib/services/user";

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
    const body = await request.json();
    const { naam, email, wachtwoord, actief, rollen, gemeenteId, leverancierId } = body;

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
