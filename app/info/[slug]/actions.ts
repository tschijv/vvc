"use server";

import { getSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePagina(
  slug: string,
  titel: string,
  inhoud: string
) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Geen toegang");
  }

  await prisma.pagina.update({
    where: { slug },
    data: { titel, inhoud },
  });

  revalidatePath(`/info/${slug}`);
  if (slug.startsWith("homepage-")) {
    revalidatePath("/");
  }
}
