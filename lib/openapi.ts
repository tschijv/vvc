/**
 * OpenAPI 3.0 Specification for Voorzieningencatalogus API v1
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Voorzieningencatalogus API",
    description:
      "Publieke API voor de VNG Voorzieningencatalogus van Nederlandse gemeenten. " +
      "Biedt toegang tot gegevens over gemeenten, leveranciers, softwarepakketten, " +
      "referentiecomponenten en standaarden. " +
      "Zie de documentatie bovenaan deze pagina voor setup-instructies en het response formaat.",
    version: "1.0.0",
    contact: {
      name: "Voorzieningencatalogus",
      url: "https://softwarecatalogus.nl",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1",
    },
  ],
  tags: [
    {
      name: "Gemeenten",
      description: "Endpoints voor gemeentelijke informatie en hun softwareportfolio",
    },
    {
      name: "Leveranciers",
      description: "Endpoints voor leveranciersinformatie en hun pakketten",
    },
    {
      name: "Referentiecomponenten",
      description: "Endpoints voor GEMMA referentiecomponenten",
    },
    {
      name: "Standaarden",
      description: "Endpoints voor standaarden en hun versies",
    },
    {
      name: "Begrippen",
      description: "Endpoints voor NL-SBB begrippen (glossary) uit het NORA begrippenkader",
    },
  ],
  paths: {
    "/gemeenten": {
      get: {
        tags: ["Gemeenten"],
        summary: "Lijst van gemeenten",
        description: "Retourneert een gepagineerde lijst van alle gemeenten met hun voortgang en aantal pakketten.",
        operationId: "getGemeenten",
        parameters: [
          {
            name: "zoek",
            in: "query",
            description: "Zoekterm om gemeenten te filteren op naam",
            required: false,
            schema: { type: "string" },
            example: "Amsterdam",
          },
          {
            name: "offset",
            in: "query",
            description: "Aantal items om over te slaan (voor paginatie)",
            required: false,
            schema: { type: "integer", minimum: 0, default: 0 },
          },
          {
            name: "limit",
            in: "query",
            description: "Maximum aantal items per pagina (max 200)",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 200, default: 50 },
          },
        ],
        responses: {
          "200": {
            description: "Succesvolle response met lijst van gemeenten",
            headers: {
              "X-Total-Count": {
                description: "Totaal aantal gemeenten (ongeacht paginatie)",
                schema: { type: "integer" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/GemeenteSummary" },
                    },
                    meta: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Interne serverfout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/gemeenten/{id}": {
      get: {
        tags: ["Gemeenten"],
        summary: "Gemeente detail",
        description: "Retourneert gedetailleerde informatie over een specifieke gemeente, inclusief samenwerkingen.",
        operationId: "getGemeenteById",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Unieke ID van de gemeente",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Succesvolle response met gemeente details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/GemeenteDetail" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Gemeente niet gevonden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "500": {
            description: "Interne serverfout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/gemeenten/{id}/pakketten": {
      get: {
        tags: ["Gemeenten"],
        summary: "Pakketportfolio van een gemeente",
        description: "Retourneert alle softwarepakketten die een gemeente in gebruik heeft, inclusief versie-informatie en referentiecomponenten.",
        operationId: "getGemeentePakketten",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Unieke ID van de gemeente",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Succesvolle response met pakketportfolio",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/GemeentePakket" },
                    },
                    meta: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                        gemeenteNaam: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Gemeente niet gevonden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "500": {
            description: "Interne serverfout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/leveranciers": {
      get: {
        tags: ["Leveranciers"],
        summary: "Lijst van leveranciers",
        description: "Retourneert een gepagineerde lijst van alle softwareleveranciers.",
        operationId: "getLeveranciers",
        parameters: [
          {
            name: "zoek",
            in: "query",
            description: "Zoekterm om leveranciers te filteren op naam",
            required: false,
            schema: { type: "string" },
            example: "Centric",
          },
          {
            name: "offset",
            in: "query",
            description: "Aantal items om over te slaan (voor paginatie)",
            required: false,
            schema: { type: "integer", minimum: 0, default: 0 },
          },
          {
            name: "limit",
            in: "query",
            description: "Maximum aantal items per pagina (max 200)",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 200, default: 50 },
          },
        ],
        responses: {
          "200": {
            description: "Succesvolle response met lijst van leveranciers",
            headers: {
              "X-Total-Count": {
                description: "Totaal aantal leveranciers",
                schema: { type: "integer" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/LeverancierSummary" },
                    },
                    meta: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Interne serverfout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/leveranciers/{id}": {
      get: {
        tags: ["Leveranciers"],
        summary: "Leverancier detail",
        description: "Retourneert gedetailleerde informatie over een specifieke leverancier, inclusief pakketten.",
        operationId: "getLeverancierById",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Unieke ID van de leverancier",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Succesvolle response met leverancier details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/LeverancierDetail" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Leverancier niet gevonden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "500": {
            description: "Interne serverfout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/leveranciers/{id}/pakketten": {
      get: {
        tags: ["Leveranciers"],
        summary: "Pakketten van een leverancier",
        description: "Retourneert alle softwarepakketten van een specifieke leverancier.",
        operationId: "getLeverancierPakketten",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Unieke ID van de leverancier",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Succesvolle response met pakketten",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/LeverancierPakket" },
                    },
                    meta: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                        leverancierNaam: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Leverancier niet gevonden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "500": {
            description: "Interne serverfout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/referentiecomponenten": {
      get: {
        tags: ["Referentiecomponenten"],
        summary: "Lijst van referentiecomponenten",
        description: "Retourneert alle GEMMA referentiecomponenten met het aantal gekoppelde pakketversies.",
        operationId: "getReferentiecomponenten",
        parameters: [
          {
            name: "zoek",
            in: "query",
            description: "Zoekterm om referentiecomponenten te filteren op naam",
            required: false,
            schema: { type: "string" },
            example: "Zaakregistratie",
          },
        ],
        responses: {
          "200": {
            description: "Succesvolle response met lijst van referentiecomponenten",
            headers: {
              "X-Total-Count": {
                description: "Totaal aantal referentiecomponenten",
                schema: { type: "integer" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Referentiecomponent" },
                    },
                    meta: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Interne serverfout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/standaarden": {
      get: {
        tags: ["Standaarden"],
        summary: "Lijst van standaarden",
        description: "Retourneert alle standaarden met hun versies en het aantal gekoppelde pakketversies per versie.",
        operationId: "getStandaarden",
        parameters: [
          {
            name: "zoek",
            in: "query",
            description: "Zoekterm om standaarden te filteren op naam",
            required: false,
            schema: { type: "string" },
            example: "StUF",
          },
        ],
        responses: {
          "200": {
            description: "Succesvolle response met lijst van standaarden",
            headers: {
              "X-Total-Count": {
                description: "Totaal aantal standaarden",
                schema: { type: "integer" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Standaard" },
                    },
                    meta: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Interne serverfout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/begrippen": {
      get: {
        tags: ["Begrippen"],
        summary: "Lijst van begrippen",
        description: "Retourneert alle NL-SBB begrippen uit het NORA begrippenkader, optioneel gefilterd op zoekterm.",
        operationId: "getBegrippen",
        parameters: [
          {
            name: "zoek",
            in: "query",
            description: "Zoekterm om begrippen te filteren op term of definitie",
            required: false,
            schema: { type: "string" },
            example: "applicatie",
          },
        ],
        responses: {
          "200": {
            description: "Succesvolle response met lijst van begrippen",
            headers: {
              "X-Total-Count": {
                description: "Totaal aantal begrippen",
                schema: { type: "integer" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Begrip" },
                    },
                    meta: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Interne serverfout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", description: "Foutmelding" },
        },
        required: ["error"],
      },
      PaginationMeta: {
        type: "object",
        properties: {
          total: { type: "integer", description: "Totaal aantal items" },
          offset: { type: "integer", description: "Huidige offset" },
          limit: { type: "integer", description: "Huidige limiet per pagina" },
        },
        required: ["total", "offset", "limit"],
      },
      GemeenteSummary: {
        type: "object",
        properties: {
          id: { type: "string", description: "Unieke ID" },
          naam: { type: "string", description: "Naam van de gemeente", example: "Amsterdam" },
          cbsCode: { type: "string", description: "CBS gemeentecode", example: "0363" },
          progress: { type: "integer", description: "Voortgangspercentage (0-100)", example: 85 },
          aantalPakketten: { type: "integer", description: "Aantal softwarepakketten in gebruik", example: 42 },
        },
        required: ["id", "naam", "cbsCode", "progress", "aantalPakketten"],
      },
      GemeenteDetail: {
        type: "object",
        properties: {
          id: { type: "string" },
          naam: { type: "string", example: "Amsterdam" },
          cbsCode: { type: "string", example: "0363" },
          progress: { type: "integer", example: 85 },
          contactpersoon: { type: "string", nullable: true },
          email: { type: "string", nullable: true },
          website: { type: "string", nullable: true },
          telefoon: { type: "string", nullable: true },
          samenwerkingen: {
            type: "array",
            items: {
              type: "object",
              properties: {
                naam: { type: "string", example: "Dimpact" },
                type: { type: "string", example: "Coöperatie" },
              },
            },
          },
        },
        required: ["id", "naam", "cbsCode", "progress", "samenwerkingen"],
      },
      GemeentePakket: {
        type: "object",
        properties: {
          pakketId: { type: "string" },
          pakketNaam: { type: "string", example: "Zaaksysteem" },
          pakketSlug: { type: "string", example: "zaaksysteem" },
          versie: { type: "string", example: "3.2" },
          status: { type: "string", example: "productie" },
          leverancier: {
            type: "object",
            properties: {
              naam: { type: "string", example: "Centric" },
            },
          },
          referentiecomponenten: {
            type: "array",
            items: {
              type: "object",
              properties: {
                naam: { type: "string" },
                guid: { type: "string" },
              },
            },
          },
        },
      },
      LeverancierSummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          naam: { type: "string", example: "Centric" },
          slug: { type: "string", example: "centric" },
          contactpersoon: { type: "string", nullable: true },
          email: { type: "string", nullable: true },
          website: { type: "string", nullable: true },
          aantalPakketten: { type: "integer", example: 15 },
          addenda: {
            type: "array",
            items: { type: "string" },
            description: "Lijst van addendum-namen",
          },
        },
        required: ["id", "naam", "slug", "aantalPakketten"],
      },
      LeverancierDetail: {
        type: "object",
        properties: {
          id: { type: "string" },
          naam: { type: "string", example: "Centric" },
          slug: { type: "string", example: "centric" },
          contactpersoon: { type: "string", nullable: true },
          email: { type: "string", nullable: true },
          website: { type: "string", nullable: true },
          telefoon: { type: "string", nullable: true },
          addenda: {
            type: "array",
            items: { type: "string" },
          },
          pakketten: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                naam: { type: "string" },
                slug: { type: "string" },
                laatsteVersie: {
                  type: "object",
                  nullable: true,
                  properties: {
                    naam: { type: "string" },
                    status: { type: "string" },
                  },
                },
              },
            },
          },
        },
        required: ["id", "naam", "slug", "pakketten"],
      },
      LeverancierPakket: {
        type: "object",
        properties: {
          id: { type: "string" },
          naam: { type: "string", example: "Suite4" },
          slug: { type: "string", example: "suite4" },
          leverancier: { type: "string", example: "Centric" },
          laatsteVersie: {
            type: "object",
            nullable: true,
            properties: {
              naam: { type: "string", example: "5.0" },
              status: { type: "string", example: "In gebruik" },
            },
          },
        },
        required: ["id", "naam", "slug"],
      },
      Referentiecomponent: {
        type: "object",
        properties: {
          id: { type: "string" },
          naam: { type: "string", example: "Zaakregistratie" },
          guid: { type: "string", example: "abc-123" },
          beschrijving: { type: "string", nullable: true },
          aantalPakketversies: { type: "integer", example: 8, description: "Aantal pakketversies dat dit component ondersteunt" },
        },
        required: ["id", "naam", "guid", "aantalPakketversies"],
      },
      Begrip: {
        type: "object",
        properties: {
          id: { type: "string" },
          term: { type: "string", description: "skos:prefLabel", example: "Applicatiefunctie" },
          definitie: { type: "string", description: "skos:definition", example: "Een functie van een applicatie" },
          toelichting: { type: "string", nullable: true, description: "rdfs:comment" },
          scopeNote: { type: "string", nullable: true, description: "skos:scopeNote" },
          bron: { type: "string", nullable: true, description: "Bronverwijzing" },
          uri: { type: "string", description: "NL-SBB concept URI", example: "https://begrippen.noraonline.nl/basisbegrippen/applicatiefunctie" },
          synoniemen: {
            type: "array",
            items: { type: "string" },
            description: "skos:altLabel",
            example: ["appfunctie"],
          },
          vocab: { type: "string", description: "SKOSMOS vocabulary ID", example: "basisbegrippen" },
        },
        required: ["id", "term", "definitie", "uri", "synoniemen", "vocab"],
      },
      Standaard: {
        type: "object",
        properties: {
          id: { type: "string" },
          naam: { type: "string", example: "StUF" },
          guid: { type: "string" },
          beschrijving: { type: "string", nullable: true },
          versies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                naam: { type: "string", example: "3.01" },
                aantalPakketversies: { type: "integer", example: 12 },
              },
            },
          },
          totaalPakketversies: { type: "integer", description: "Som van pakketversies over alle versies", example: 20 },
        },
        required: ["id", "naam", "guid", "versies", "totaalPakketversies"],
      },
    },
  },
};
