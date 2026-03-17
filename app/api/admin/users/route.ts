import { NextRequest, NextResponse } from "next/server";
import { getUsers, getUserCount, createUser } from "@/lib/services/user";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zoek = searchParams.get("zoek") || undefined;
  const rol = (searchParams.get("rol") as Role) || undefined;
  const actiefParam = searchParams.get("actief");
  const actief =
    actiefParam === "true" ? true : actiefParam === "false" ? false : undefined;
  const skip = parseInt(searchParams.get("skip") || "0");
  const take = parseInt(searchParams.get("take") || "50");

  const [users, total] = await Promise.all([
    getUsers({ zoek, rol, actief, skip, take }),
    getUserCount({ zoek, rol, actief }),
  ]);

  return NextResponse.json({ users, total });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, naam, wachtwoord, rollen, gemeenteId, leverancierId } = body;

    if (!email || !naam) {
      return NextResponse.json(
        { error: "E-mail en naam zijn verplicht" },
        { status: 400 }
      );
    }

    const user = await createUser({
      email,
      naam,
      wachtwoord,
      rollen: rollen || ["GEVERIFIEERD"],
      gemeenteId,
      leverancierId,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Onbekende fout";
    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "E-mailadres is al in gebruik" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
