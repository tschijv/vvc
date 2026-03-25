/**
 * Backward-compatibility re-exports.
 *
 * All logic has moved to `./organisatie.ts`.  This file keeps existing import
 * paths (`@/lib/services/gemeente`) working so that callers can be migrated
 * gradually.  Every symbol exported here is also available (with an
 * Organisatie-based name) from `./organisatie.ts`.
 */
export {
  // Functions — old names (aliases defined in organisatie.ts)
  getGemeenten,
  getGemeenteCount,
  getGemeenteById,
  getGemeenteForDashboard,
  getGemeentenForAdmin,
  getGemeentePakketten,
  getGemeenteDashboardStats,
  getGemeenteKoppelingen,
  getGemeenteHistorie,
  mergeGemeenten,
  getSimilarGemeenten,
  getPakkettenMetTellingen,
  getMergePreview,
  getStandaardFilters,

  // Functions — new names
  getOrganisaties,
  getOrganisatieCount,
  getOrganisatieById,
  getOrganisatieForDashboard,
  getOrganisatiesForAdmin,
  getOrganisatiePakketten,
  getOrganisatieDashboardStats,
  getOrganisatieKoppelingen,
  getOrganisatieHistorie,
  mergeOrganisaties,
  getSimilarOrganisaties,
} from "./organisatie";

// Types
export type {
  DashboardStats,
  KoppelingRow,
  MergePreview,
  SimilarGemeente,
  SimilarGemeentenResult,
  SimilarOrganisatie,
  SimilarOrganisatiesResult,
} from "./organisatie";
