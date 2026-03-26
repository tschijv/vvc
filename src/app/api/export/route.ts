import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/process/auth-helpers";
import {
  generatePakketoverzichtCsv,
  generateIbdFotoCsv,
  generateAmeffExport,
} from "@/service/export";

export async function GET(request: NextRequest) {
  // Auth check: alleen ingelogde gebruikers
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type"); // "csv" | "ibd" | "ameff"
  const gemeenteId = searchParams.get("gemeenteId");
  const viewId = searchParams.get("viewId"); // alleen voor ameff

  if (!type || !gemeenteId) {
    return NextResponse.json(
      { error: "Parameters type en gemeenteId zijn verplicht" },
      { status: 400 }
    );
  }

  try {
    switch (type) {
      case "csv": {
        const { csv, organisatieNaam } =
          await generatePakketoverzichtCsv(gemeenteId);
        const now = new Date();
        const dateStr = now.toISOString().replace(/[:.]/g, "-").substring(0, 19);
        const filename = `Applicatieportfolio_Gemeente_${organisatieNaam}_${dateStr}.csv`;

        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }

      case "ibd": {
        const { csv, organisatieNaam } = await generateIbdFotoCsv(gemeenteId);
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
        // Sanitize gemeente naam for filename
        const safeNaam = organisatieNaam
          .replace(/['']/g, "")
          .replace(/[^a-zA-Z0-9-_]/g, "_")
          .toLowerCase();
        const filename = `IBD_foto_${safeNaam}_${dateStr}.csv`;

        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }

      case "ameff": {
        if (!viewId) {
          return NextResponse.json(
            { error: "Parameter viewId is verplicht voor AMEFF export" },
            { status: 400 }
          );
        }

        const { xml, organisatieNaam, viewTitel } = await generateAmeffExport(
          gemeenteId,
          viewId
        );
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
        const filename = `${dateStr}_${viewTitel}_${organisatieNaam}_ameff_model.xml`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Onbekend exporttype: ${type}. Gebruik csv, ibd of ameff.` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Internal error:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
