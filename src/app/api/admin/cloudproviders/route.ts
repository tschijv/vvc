import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/process/auth-helpers";
import { withRateLimit, RATE_LIMITS } from "@/process/rate-limit";
import { createCloudprovider } from "@/service/cloudprovider";
import { z } from "zod";

const createSchema = z.object({
  naam: z.string().min(1),
  slug: z.string().min(1),
  beschrijving: z.string().optional(),
  type: z.enum(["IaaS", "PaaS", "SaaS", "Hosting"]).optional(),
  certificeringen: z.string().optional(),
  datacenterLocatie: z.enum(["Nederland", "EU", "Internationaal"]).optional(),
  contactpersoon: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefoon: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const blocked = withRateLimit(request, RATE_LIMITS.admin);
  if (blocked) return blocked;

  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ongeldige invoer", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const cloudprovider = await createCloudprovider(parsed.data);
    return NextResponse.json({ data: cloudprovider }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cloudprovider:", error);
    return NextResponse.json({ error: "Er is een fout opgetreden" }, { status: 500 });
  }
}
