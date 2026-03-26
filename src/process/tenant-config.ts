/**
 * Tenant configuration system.
 *
 * The TENANT env var determines which config to load:
 * - TENANT=vvc → VNG Voorzieningencatalogus (gemeenten)
 * - TENANT=hwh → HWH Voorzieningencatalogus (waterschappen)
 *
 * Default: vvc
 */

// Re-export type from tenants/types.ts (single source of truth)
export type { TenantConfig } from "../../tenants/types";

// Import all tenant configs statically (tree-shaking removes unused)
import type { TenantConfig } from "../../tenants/types";
import { config as vvcConfig } from "../../tenants/vvc.config";
import { config as hwhConfig } from "../../tenants/hwh.config";

const TENANT_CONFIGS: Record<string, TenantConfig> = {
  vvc: vvcConfig,
  hwh: hwhConfig,
};

// Load tenant config based on TENANT env var
function loadTenantConfig(): TenantConfig {
  const tenantId = process.env.TENANT || "vvc";
  return TENANT_CONFIGS[tenantId] || TENANT_CONFIGS.vvc;
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
