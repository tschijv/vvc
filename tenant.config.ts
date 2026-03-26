// Re-export tenant config from the centralized system
// The TENANT env var determines which config is loaded (default: vvc)
export { tenant as config } from "@/process/tenant-config";
export type { TenantConfig } from "@/process/tenant-config";
