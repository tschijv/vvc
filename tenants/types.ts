export type TenantConfig = {
  id: string;
  naam: string;
  korteNaam: string;
  organisatie: string;

  organisatieType: {
    enkelvoud: string;
    meervoud: string;
    capitaal: string;
    meervoudCapitaal: string;
  };

  routes: {
    organisaties: string;
  };

  roles: {
    beheerder: string;
    raadpleger: string;
    primary: string;
  };

  architectuur: {
    naam: string;
    apiUrl: string;
    modelId: string;
    wikiBaseUrl: string;
    nieuwsbriefNaam: string;
  };

  branding: {
    primaryColor: string;
    accentColor: string;
    contactEmail: string;
  };

  menuItems: {
    label: string;
    items: { label: string; href: string }[];
  }[];

  footer: {
    copyright: string;
    links: { label: string; href: string }[];
  };
};
