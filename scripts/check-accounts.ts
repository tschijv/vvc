import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { compare } from "bcryptjs";
import "dotenv/config";

const p = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

async function main() {
  const accounts = [
    { email: "admin@swc.nl", password: "admin2026" },
    { email: "gemeente1@swc.nl", password: "test2026" },
    { email: "leverancier1@swc.nl", password: "test2026" },
  ];

  for (const acc of accounts) {
    const user = await p.user.findFirst({
      where: { email: acc.email },
      select: { id: true, email: true, rollen: true, passwordHash: true, actief: true },
    });
    if (!user) {
      console.log("❌", acc.email, "- NIET GEVONDEN");
      continue;
    }
    const valid = user.passwordHash
      ? await compare(acc.password, user.passwordHash)
      : false;
    console.log(
      valid ? "✅" : "❌",
      acc.email,
      "- rollen:",
      user.rollen.join(","),
      "- actief:",
      user.actief,
      valid ? "" : "- WACHTWOORD KLOPT NIET",
    );
  }
  await p.$disconnect();
}

main().catch(console.error);
