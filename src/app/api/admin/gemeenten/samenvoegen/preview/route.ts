import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/process/auth-helpers";
import { getMergePreview } from "@/service/gemeente";
import { tenant } from "@/process/tenant-config";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const bronId = req.nextUrl.searchParams.get("bronId");
  const doelId = req.nextUrl.searchParams.get("doelId");

  if (!bronId || !doelId) {
    return NextResponse.json(
      { error: "bronId en doelId zijn verplicht." },
      { status: 400 }
    );
  }

  if (bronId === doelId) {
    return NextResponse.json(
      { error: "Bron- en doelgemeente mogen niet dezelfde zijn." },
      { status: 400 }
    );
  }

  try {
    const preview = await getMergePreview(bronId, doelId);
    return NextResponse.json(preview);
  } catch {
    return NextResponse.json(
      { error: `${tenant.organisatieType.capitaal} niet gevonden.` },
      { status: 404 }
    );
  }
}
