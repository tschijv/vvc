import type { TenantConfig } from "./types";

export const config: TenantConfig = {
  id: "hwh",
  naam: "HWH Voorzieningencatalogus",
  korteNaam: "HWH VC",
  organisatie: "Het Waterschapshuis",

  organisatieType: {
    enkelvoud: "waterschap",
    meervoud: "waterschappen",
    capitaal: "Waterschap",
    meervoudCapitaal: "Waterschappen",
  },

  routes: {
    organisaties: "/waterschappen",
  },

  roles: {
    beheerder: "BEHEERDER",
    raadpleger: "RAADPLEGER",
    primary: "WATERSCHAP",
  },

  architectuur: {
    naam: "WILMA",
    apiUrl: "https://www.wilmaonline.nl/api.php",
    modelId: "48af3206-a19e-40e8-bc8c-79ffb63e606d",
    wikiBaseUrl: "https://www.wilmaonline.nl/wiki/WILMA",
    nieuwsbriefNaam: "WILMA",
    smwCategories: {
      referentiecomponenten: "Category:ApplicationComponents",
      applicatiefuncties: "Category:ApplicationFunctions",
      applicatieservices: "Category:ApplicationServices",
      standaarden: "Category:Standaarden",
    },
  },

  branding: {
    primaryColor: "#18407f",
    accentColor: "#f18900",
    headerBg: "#18407f",
    contactEmail: "voorzieningencatalogus@hetwaterschapshuis.nl",
  },

  menuItems: [
    {
      label: "Hoe werkt de catalogus",
      items: [
        { label: "Voor waterschappen", href: "/info/voor-waterschappen" },
        { label: "Voor leveranciers", href: "/info/voor-leveranciers" },
      ],
    },
    {
      label: "Wat is er te vinden",
      items: [
        { label: "Alle pakketten", href: "/pakketten" },
        { label: "Alle pakketversies", href: "/pakketversies" },
        { label: "Alle leveranciers", href: "/leveranciers" },
        { label: "Alle dienstverleners", href: "/dienstverleners" },
        { label: "Alle cloud-providers", href: "/cloudproviders" },
        { label: "Alle addenda en ondertekening", href: "/addenda" },
        { label: "Alle standaarden", href: "/standaarden" },
        { label: "Alle referentiecomponenten", href: "/referentiecomponenten" },
        { label: "Alle applicatiefuncties", href: "/applicatiefuncties" },
        { label: "Inkoopondersteuning", href: "/info/inkoopondersteuning" },
      ],
    },
    {
      label: "Wie doet er mee",
      items: [
        { label: "Gebruik Voorzieningencatalogus (kaart)", href: "/kaart/nederland" },
        { label: "Hoe meld ik mij aan als waterschap", href: "/info/aanmelden-waterschap" },
        { label: "Welke leveranciers doen mee", href: "/leveranciers" },
        { label: "Hoe meld ik mij aan als leverancier", href: "/info/aanmelden-leverancier" },
        { label: "Nieuws", href: "/info/nieuws" },
      ],
    },
    {
      label: "Praktijkvoorbeelden",
      items: [
        { label: "Hoogheemraadschap Hollands Noorderkwartier", href: "/info/praktijkvoorbeeld-hhnk" },
        { label: "Waterschap Rivierenland", href: "/info/praktijkvoorbeeld-rivierenland" },
      ],
    },
  ],

  footer: {
    copyright: "Het Waterschapshuis",
    links: [
      { label: "Over Het Waterschapshuis", href: "https://www.hetwaterschapshuis.nl" },
      { label: "Privacyverklaring", href: "/info/privacy" },
      { label: "Toegankelijkheidsverklaring", href: "/info/toegankelijkheid" },
    ],
  },
};
