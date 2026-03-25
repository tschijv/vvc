import { prisma } from "@/data/prisma";

const GEMMA_API = "https://www.gemmaonline.nl/api.php";

/**
 * Genereer een SVG kaart van het applicatielandschap van een gemeente
 * voor een specifieke GEMMA view.
 */
export async function genereerKaartSvg(
  viewId: string,
  gemeenteId: string
): Promise<string> {
  // 1. Haal de view op
  const view = await prisma.gemmaView.findUnique({
    where: { id: viewId },
  });
  if (!view) {
    throw new KaartError("View niet gevonden", 404);
  }

  // 2. Haal organisatie op
  const gemeente = await prisma.organisatie.findUnique({
    where: { id: gemeenteId },
  });
  if (!gemeente) {
    throw new KaartError("Gemeente niet gevonden", 404);
  }

  // 3. Haal organisatie-pakketten op met alle benodigde relaties
  const gemeentePakketten = await prisma.organisatiePakket.findMany({
    where: { organisatieId: gemeenteId },
    include: {
      pakketversie: {
        include: {
          pakket: {
            include: {
              leverancier: true,
            },
          },
          referentiecomponenten: {
            include: {
              referentiecomponent: true,
            },
          },
        },
      },
    },
  });

  // 4. Transformeer naar swcquery JSON-formaat
  const pakketData = gemeentePakketten
    .map((gp) => {
      const pv = gp.pakketversie;
      const pakket = pv.pakket;
      const leverancier = pakket.leverancier;

      const refComps = pv.referentiecomponenten
        .filter((rc) => rc.referentiecomponent.guid)
        .map((rc) => ({
          ReferentiecomponentID: rc.referentiecomponent.guid!,
          ReferentiecomponentURL: `https://www.gemmaonline.nl/wiki/GEMMA/id-${rc.referentiecomponent.guid}`,
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
            CBS: gemeente.cbsCode || "",
            Id: gemeente.id,
            Naam: gemeente.naam,
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

  // 6. POST naar GEMMA Online viewdiagram API
  const gemmaParams = new URLSearchParams({
    action: "swcquery",
    output: "viewdiagram",
    view: view.objectId,
    modelid: view.modelId,
    imageformat: "svg",
    format: "json",
  });

  const gemmaRes = await fetch(`${GEMMA_API}?${gemmaParams}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `json=${encodeURIComponent(JSON.stringify(viewInfoData))}`,
  });

  if (!gemmaRes.ok) {
    const errorText = await gemmaRes.text();
    console.error("GEMMA viewdiagram API fout:", errorText);
    throw new KaartError(
      `GEMMA Online API fout: ${gemmaRes.status}: ${errorText.substring(0, 200)}`,
      502
    );
  }

  const gemmaData = await gemmaRes.json();

  // 7. Decodeer base64 SVG uit response
  const base64Svg =
    gemmaData?.viewdiagrams?.item?.base64 ||
    gemmaData?.viewdiagram?.item?.base64;

  if (!base64Svg) {
    console.error(
      "GEMMA response zonder SVG:",
      JSON.stringify(gemmaData).substring(0, 500)
    );
    throw new KaartError(
      `Geen SVG ontvangen van GEMMA Online: ${JSON.stringify(gemmaData).substring(0, 300)}`,
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
