import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/process/auth-helpers";
import {
  parseUploadRequest,
  parseUploadFile,
  processLeverancierUpload,
  UploadValidationError,
} from "@/service/upload";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "LEVERANCIER")) {
      return NextResponse.json(
        { error: "Geen toegang. U moet ingelogd zijn als leverancier of admin." },
        { status: 403 }
      );
    }

    const { file, mode, orgId } = await parseUploadRequest(request);

    // Determine leverancierId
    let leverancierId: string;
    if (user.role === "LEVERANCIER") {
      if (!user.leverancierId) {
        return NextResponse.json(
          { error: "Uw account is niet gekoppeld aan een leverancier." },
          { status: 403 }
        );
      }
      leverancierId = user.leverancierId;
    } else {
      if (!orgId) {
        return NextResponse.json(
          { error: "leverancierId is verplicht voor admins." },
          { status: 400 }
        );
      }
      leverancierId = orgId;
    }

    const rows = await parseUploadFile(file);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Het bestand bevat geen data." }, { status: 400 });
    }

    return NextResponse.json(await processLeverancierUpload(rows, leverancierId, mode));
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Upload leverancier pakketten fout:", error);
    return NextResponse.json(
      {
        error: "Er is een fout opgetreden bij het verwerken van de upload.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
