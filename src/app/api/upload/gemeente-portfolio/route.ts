import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/process/auth-helpers";
import {
  parseUploadRequest,
  parseUploadFile,
  processOrganisatieUpload,
  UploadValidationError,
} from "@/service/upload";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "GEMEENTE")) {
      return NextResponse.json(
        { error: "Geen toegang. U moet ingelogd zijn als gemeente of admin." },
        { status: 403 }
      );
    }

    const { file, mode, orgId } = await parseUploadRequest(request);

    // Determine organisatieId
    let organisatieId: string;
    if (user.role === "GEMEENTE") {
      if (!user.organisatieId) {
        return NextResponse.json(
          { error: "Uw account is niet gekoppeld aan een gemeente." },
          { status: 403 }
        );
      }
      organisatieId = user.organisatieId;
    } else {
      if (!orgId) {
        return NextResponse.json(
          { error: "organisatieId is verplicht voor admins." },
          { status: 400 }
        );
      }
      organisatieId = orgId;
    }

    const rows = await parseUploadFile(file);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Het bestand bevat geen data." }, { status: 400 });
    }

    return NextResponse.json(await processOrganisatieUpload(rows, organisatieId, mode));
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Internal error:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
