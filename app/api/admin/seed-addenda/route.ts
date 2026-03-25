import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const ADDENDUM_TYPES = [
  { naam: "Anonimiseringssoftware leverancier", beschrijving: "Leverancier biedt anonimiseringssoftware aan" },
  { naam: "Groeipact Common Ground", beschrijving: "Ondertekening van het Groeipact Common Ground" },
  { naam: "Handreiking Standaard Verwerkersovereenkomst Gemeenten (VWO)", beschrijving: "Naleving van de standaard verwerkersovereenkomst" },
];

export async function POST() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    // Create addendum types
    const addenda = [];
    for (const type of ADDENDUM_TYPES) {
      const addendum = await prisma.addendum.upsert({
        where: { naam: type.naam },
        update: {},
        create: { naam: type.naam, beschrijving: type.beschrijving },
      });
      addenda.push(addendum);
    }

    // Get leveranciers
    const leveranciers = await prisma.leverancier.findMany({
      select: { id: true, naam: true },
      orderBy: { naam: "asc" },
    });

    let count = 0;
    for (let i = 0; i < leveranciers.length && i < 45; i++) {
      const lev = leveranciers[i];
      // Distribute addenda: most get 1-2, some get all 3
      const typesToAssign = i % 5 === 0 ? addenda : i % 2 === 0 ? [addenda[1]] : [addenda[2]];
      if (i < 8) typesToAssign.push(addenda[0]); // First 8 get anonimisering

      for (const add of typesToAssign) {
        const ondertekend = new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
        const hasDeadline = Math.random() > 0.4;
        const deadline = hasDeadline ? new Date(ondertekend.getTime() + (180 + Math.floor(Math.random() * 365)) * 86400000) : null;

        await prisma.leverancierAddendum.upsert({
          where: { leverancierId_addendumId: { leverancierId: lev.id, addendumId: add.id } },
          update: {},
          create: {
            leverancierId: lev.id,
            addendumId: add.id,
            ondertekend,
            deadline,
          },
        });
        count++;
      }
    }

    return NextResponse.json({ success: true, count, message: `${count} addenda aangemaakt voor ${Math.min(leveranciers.length, 45)} leveranciers` });
  } catch (error) {
    console.error("Seed addenda error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
