import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUsers, getUserCount, createUser } from "@/service/user";

import { parseBody, emailSchema, naamSchema } from "@/process/validation";
import { getSessionUser } from "@/process/auth-helpers";

const createUserSchema = z.object({
  email: emailSchema,
  naam: naamSchema,
  wachtwoord: z.string().optional(),
  rollen: z.array(z.string()).optional(),
  organisatieId: z.string().nullable().optional(),
  leverancierId: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const zoek = searchParams.get("zoek") || undefined;
  const rol = (searchParams.get("rol") as string) || undefined;
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
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const parsed = await parseBody(request, createUserSchema);
    if ("error" in parsed) return parsed.error;
    const { email, naam, wachtwoord, rollen, organisatieId, leverancierId } = parsed.data;

    const createdUser = await createUser({
      email,
      naam,
      wachtwoord,
      rollen: rollen || ["GEVERIFIEERD"],
      organisatieId,
      leverancierId,
    });

    return NextResponse.json(createdUser, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "";
    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "E-mailadres is al in gebruik" },
        { status: 409 }
      );
    }
    console.error("Internal error:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
