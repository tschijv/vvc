export interface MenuItem {
  label: string;
  href: string;
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export const menuItems: MenuGroup[] = [
  {
    label: "Hoe werkt de catalogus",
    items: [
      { label: "Voor gemeenten", href: "/info/voor-gemeenten" },
      { label: "Voor leveranciers", href: "/info/voor-leveranciers" },
    ],
  },
  {
    label: "Wat is er te vinden",
    items: [
      { label: "Alle pakketten", href: "/pakketten" },
      { label: "Alle pakketversies", href: "/pakketversies" },
      { label: "Alle leveranciers", href: "/leveranciers" },
      { label: "Marktverdeling leveranciers", href: "/marktverdeling" },
      { label: "Alle addenda en ondertekening", href: "/addenda" },
      { label: "Alle standaarden", href: "/standaarden" },
      { label: "Alle referentiecomponenten", href: "/referentiecomponenten" },
      { label: "Alle applicatiefuncties", href: "/applicatiefuncties" },
      { label: "Marktscan Digikoppeling", href: "/info/marktscan-digikoppeling" },
      { label: "Inkoopondersteuning", href: "/info/inkoopondersteuning" },
      { label: "Monitor digitoegankelijke pakketten", href: "/info/monitor-digitoegankelijkheid" },
      { label: "Beschikbare downloads", href: "/info/downloads" },
      { label: "Rapportages", href: "/info/rapportages" },
    ],
  },
  {
    label: "Wie doet er mee",
    items: [
      { label: "Gebruik Voorzieningencatalogus (kaart)", href: "/kaart/nederland" },
      { label: "Hoe meld ik mij aan als gemeente of samenwerking", href: "/info/aanmelden-gemeente" },
      { label: "Welke leveranciers doen mee", href: "/leveranciers" },
      { label: "Hoe meld ik mij aan als leverancier", href: "/info/aanmelden-leverancier" },
      { label: "Nieuws", href: "/info/nieuws" },
    ],
  },
  {
    label: "Praktijkvoorbeelden",
    items: [
      { label: "RID de Liemers", href: "/info/praktijkvoorbeeld-rid" },
      { label: "Gemeente Delft", href: "/info/praktijkvoorbeeld-delft" },
    ],
  },
];
