import { NextResponse } from "next/server";
import { auth } from "@/process/auth";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
  }

  const root = process.cwd();

  try {
    // Read package.json
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    const deps = Object.entries(pkg.dependencies || {}).map(([naam, versie]) => ({
      naam,
      versie: String(versie),
      type: "dependency" as const,
    }));
    const devDeps = Object.entries(pkg.devDependencies || {}).map(([naam, versie]) => ({
      naam,
      versie: String(versie),
      type: "devDependency" as const,
    }));
    const allDeps = [...deps, ...devDeps];

    // npm audit
    let vulnerabilities: { naam: string; severity: string; title: string; fixAvailable: boolean; via: string }[] = [];
    try {
      const auditJson = execSync("npm audit --json 2>/dev/null", { cwd: root, timeout: 30000 }).toString();
      const audit = JSON.parse(auditJson);
      const vulns = audit.vulnerabilities || {};
      vulnerabilities = Object.entries(vulns).map(([naam, info]: [string, unknown]) => {
        const v = info as { severity: string; fixAvailable: boolean; via: unknown[] };
        const viaNames = Array.isArray(v.via)
          ? v.via.filter((x): x is string => typeof x === "string").join(", ")
          : "direct";
        return {
          naam,
          severity: v.severity || "unknown",
          title: Array.isArray(v.via) && typeof v.via[0] === "object" && v.via[0] !== null
            ? (v.via[0] as { title?: string }).title || ""
            : "",
          fixAvailable: !!v.fixAvailable,
          via: viaNames || "direct",
        };
      });
    } catch {
      // npm audit returns exit code 1 when vulnerabilities found
      try {
        const auditJson = execSync("npm audit --json 2>&1 || true", { cwd: root, timeout: 30000 }).toString();
        const audit = JSON.parse(auditJson);
        const vulns = audit.vulnerabilities || {};
        vulnerabilities = Object.entries(vulns).map(([naam, info]: [string, unknown]) => {
          const v = info as { severity: string; fixAvailable: boolean; via: unknown[] };
          const viaNames = Array.isArray(v.via)
            ? v.via.filter((x): x is string => typeof x === "string").join(", ")
            : "direct";
          return {
            naam,
            severity: v.severity || "unknown",
            title: Array.isArray(v.via) && typeof v.via[0] === "object" && v.via[0] !== null
              ? (v.via[0] as { title?: string }).title || ""
              : "",
            fixAvailable: !!v.fixAvailable,
            via: viaNames || "direct",
          };
        });
      } catch {
        // ignore
      }
    }

    // License summary
    let licenses: { license: string; count: number }[] = [];
    try {
      const licenseJson = execSync("npx license-checker --json --production 2>/dev/null", {
        cwd: root,
        timeout: 30000,
      }).toString();
      const licenseData = JSON.parse(licenseJson);
      const licenseMap = new Map<string, number>();
      Object.values(licenseData).forEach((info: unknown) => {
        const lic = (info as { licenses?: string }).licenses || "Unknown";
        licenseMap.set(lic, (licenseMap.get(lic) || 0) + 1);
      });
      licenses = [...licenseMap.entries()]
        .map(([license, count]) => ({ license, count }))
        .sort((a, b) => b.count - a.count);
    } catch {
      // license-checker not available
    }

    // Total package count + size
    let totalPackages = 0;
    let totalSize = "onbekend";
    try {
      const nmPath = path.join(root, "node_modules");
      const dirs = fs.readdirSync(nmPath);
      totalPackages = dirs.filter(d => !d.startsWith(".")).length;
      const sizeOutput = execSync(`du -sh ${nmPath} 2>/dev/null`, { timeout: 10000 }).toString().trim();
      totalSize = sizeOutput.split("\t")[0];
    } catch {
      // ignore
    }

    return NextResponse.json({
      dependencies: allDeps,
      vulnerabilities: vulnerabilities.sort((a, b) => {
        const order: Record<string, number> = { critical: 0, high: 1, moderate: 2, low: 3 };
        return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
      }),
      licenses,
      totalPackages,
      totalSize,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
