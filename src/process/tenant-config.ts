/**
 * Tenant configuration system.
 *
 * The TENANT env var determines which config to load:
 * - TENANT=vvc → VNG Voorzieningencatalogus (gemeenten)
 * - TENANT=hwh → HWH Voorzieningencatalogus (waterschappen)
 *
 * Default: vvc
 */

export type TenantConfig = {
  id: string;
  naam: string;
  korteNaam: string;
  organisatie: string;

  organisatieType: {
    enkelvoud: string; // "gemeente" | "waterschap"
    meervoud: string; // "gemeenten" | "waterschappen"
    capitaal: string; // "Gemeente" | "Waterschap"
    meervoudCapitaal: string; // "Gemeenten" | "Waterschappen"
  };

  routes: {
    organisaties: string; // "/gemeenten" | "/waterschappen"
  };

  roles: {
    beheerder: string; // "GEMEENTE_BEHEERDER" | "WATERSCHAP_BEHEERDER"
    raadpleger: string; // "GEMEENTE_RAADPLEGER" | "WATERSCHAP_RAADPLEGER"
    primary: string; // "GEMEENTE" | "WATERSCHAP"
  };

  architectuur: {
    naam: string; // "GEMMA" | "WILMA"
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

// Load tenant config based on TENANT env var
function loadTenantConfig(): TenantConfig {
  const tenantId = process.env.TENANT || "vvc";

  // Dynamic import won't work in edge runtime, so we use a switch
  switch (tenantId) {
    case "hwh":
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("../../tenants/hwh.config").config;
    case "vvc":
    default:
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("../../tenants/vvc.config").config;
  }
}

/** The active tenant configuration */
export const tenant = loadTenantConfig();

/** Helper: get the organisatie route path */
export function organisatieRoute(subpath = ""): string {
  return `${tenant.routes.organisaties}${subpath}`;
}

/** Helper: capitalize the organisatie type */
export function organisatieLabel(variant: "enkelvoud" | "meervoud" | "capitaal" | "meervoudCapitaal" = "enkelvoud"): string {
  return tenant.organisatieType[variant];
}

/** Helper: check if a role is a beheerder for this tenant */
export function isBeheerder(role: string): boolean {
  return role === tenant.roles.beheerder || role === "ADMIN";
}

/** Helper: check if a role is a raadpleger for this tenant */
export function isRaadpleger(role: string): boolean {
  return role === tenant.roles.raadpleger;
}

/** Helper: check if a role is the primary organisatie role */
export function isPrimaryRole(role: string): boolean {
  return role === tenant.roles.primary || role === tenant.roles.beheerder || role === tenant.roles.raadpleger;
}
