import { prisma } from "@/data/prisma";
import { tenant } from "@/process/tenant-config";

const API_URL = tenant.architectuur.apiUrl;

/**
 * Genereer een SVG kaart van het applicatielandschap van een organisatie
 * voor een specifieke view (GEMMA/WILMA).
 */
export async function genereerKaartSvg(
  viewId: string,
  organisatieId: string
): Promise<string> {
  // 1. Haal de view op
  const view = await prisma.gemmaView.findUnique({
    where: { id: viewId },
  });
  if (!view) {
    throw new KaartError("View niet gevonden", 404);
  }

  // 2. Haal organisatie op
  const organisatie = await prisma.organisatie.findUnique({
    where: { id: organisatieId },
  });
  if (!organisatie) {
    throw new KaartError("Organisatie niet gevonden", 404);
  }

  // 3. Haal organisatie-pakketten op met alle benodigde relaties
  //    Referentiecomponenten zitten op Pakket-niveau (niet Pakketversie)
  const organisatiePakketten = await prisma.organisatiePakket.findMany({
    where: { organisatieId },
    include: {
      pakketversie: {
        include: {
          pakket: {
            include: {
              leverancier: true,
              referentiecomponenten: {
                include: {
                  referentiecomponent: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // 4. Transformeer naar swcquery JSON-formaat
  const pakketData = organisatiePakketten
    .map((gp) => {
      const pv = gp.pakketversie;
      const pakket = pv.pakket;
      const leverancier = pakket.leverancier;

      // Referentiecomponenten zitten op pakket-niveau
      const refComps = (pakket.referentiecomponenten || [])
        .filter((rc) => rc.referentiecomponent.guid)
        .map((rc) => ({
          ReferentiecomponentID: rc.referentiecomponent.guid!,
          ReferentiecomponentURL: `${tenant.architectuur.wikiBaseUrl}/id-${rc.referentiecomponent.guid}`,
        }));

      if (refComps.length === 0) return null;

      return {
        Pakketregel: {
          Pakketid: pakket.id,
          Pakketnaam: pakket.naam,
          Pakketversie: pv.naam,
          Pakketstatus: gp.status || pv.status || "productie",
          Beheerder: leverancier.naam,
          Leverancier: leverancier.naam,
        },
        Pakketstijl: "",
        PakketURL: `/pakketten/${pakket.slug}`,
        Referentiecomponenten: refComps,
        Organisaties: [
          {
            CBS: organisatie.cbsCode || "",
            Id: organisatie.id,
            Naam: organisatie.naam,
          },
        ],
      };
    })
    .filter(Boolean);

  // 5. Wrap pakketdata in swcquery viewInfo-formaat
  const viewInfoData = [
    {
      Title: view.titel,
      Pakketten: pakketData,
      Infoboxes: [],
    },
  ];

  // 6. POST naar architectuur API (GEMMA/WILMA) viewdiagram endpoint
  const params = new URLSearchParams({
    action: "swcquery",
    output: "viewdiagram",
    view: view.objectId,
    modelid: view.modelId,
    imageformat: "svg",
    format: "json",
  });

  const res = await fetch(`${API_URL}?${params}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `json=${encodeURIComponent(JSON.stringify(viewInfoData))}`,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`${tenant.architectuur.naam} viewdiagram API fout:`, errorText);
    throw new KaartError(
      `${tenant.architectuur.naam} API fout: ${res.status}: ${errorText.substring(0, 200)}`,
      502
    );
  }

  const data = await res.json();

  // 7. Decodeer base64 SVG uit response
  const base64Svg =
    data?.viewdiagrams?.item?.base64 ||
    data?.viewdiagram?.item?.base64;

  if (!base64Svg) {
    console.error(
      `${tenant.architectuur.naam} response zonder SVG:`,
      JSON.stringify(data).substring(0, 500)
    );
    throw new KaartError(
      `Geen SVG ontvangen van ${tenant.architectuur.naam}: ${JSON.stringify(data).substring(0, 300)}`,
      502
    );
  }

  return Buffer.from(base64Svg, "base64").toString("utf-8");
}

// ─── Error class ────────────────────────────────────────────────────────────────

export class KaartError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "KaartError";
    this.statusCode = statusCode;
  }
}
