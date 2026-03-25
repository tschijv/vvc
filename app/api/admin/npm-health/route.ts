import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  try {
    // Run npm audit (returns exit code 1 if vulnerabilities found, which is fine)
    let auditResult;
    try {
      const { stdout } = await execAsync("npm audit --json 2>/dev/null", {
        cwd: process.cwd(),
        timeout: 30000,
      });
      auditResult = JSON.parse(stdout);
    } catch (err: unknown) {
      // npm audit exits with code 1 when vulnerabilities found
      const execErr = err as { stdout?: string };
      if (execErr.stdout) {
        auditResult = JSON.parse(execErr.stdout);
      } else {
        throw err;
      }
    }

    const vulnerabilities = auditResult.vulnerabilities || {};
    const vulnList = Object.entries(vulnerabilities).map(
      ([name, data]: [string, unknown]) => {
        const d = data as {
          severity: string;
          via: unknown[];
          fixAvailable: boolean | { name: string; version: string };
          range: string;
        };
        const advisories = d.via
          .filter((v: unknown) => typeof v === "object" && v !== null && "title" in (v as Record<string, unknown>))
          .map((v: unknown) => (v as { title: string; url: string }).title);
        return {
          name,
          severity: d.severity,
          fixAvailable: !!d.fixAvailable,
          advisories,
          range: d.range,
        };
      },
    );

    // Count by severity
    const summary = {
      critical: vulnList.filter((v) => v.severity === "critical").length,
      high: vulnList.filter((v) => v.severity === "high").length,
      moderate: vulnList.filter((v) => v.severity === "moderate").length,
      low: vulnList.filter((v) => v.severity === "low").length,
      total: vulnList.length,
    };

    return NextResponse.json({
      audit: { summary, vulnerabilities: vulnList },
    });
  } catch (err) {
    console.error("npm health check failed:", err);
    return NextResponse.json(
      { error: "Health check mislukt", detail: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { action } = await request.json();

  if (action === "fix" || action === "fix-force") {
    const cmd = action === "fix-force"
      ? "npm audit fix --force 2>&1"
      : "npm audit fix 2>&1";
    try {
      const { stdout, stderr } = await execAsync(cmd, {
        cwd: process.cwd(),
        timeout: 120000,
      });
      return NextResponse.json({ success: true, output: stdout + stderr, forced: action === "fix-force" });
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string };
      return NextResponse.json({
        success: true,
        output: (execErr.stdout || "") + (execErr.stderr || ""),
        forced: action === "fix-force",
      });
    }
  }

  if (action === "depcheck") {
    try {
      const { stdout } = await execAsync(
        "npx depcheck --json 2>/dev/null",
        { cwd: process.cwd(), timeout: 60000 },
      );
      const result = JSON.parse(stdout);
      return NextResponse.json({
        success: true,
        unused: {
          dependencies: result.dependencies || [],
          devDependencies: result.devDependencies || [],
        },
      });
    } catch (err: unknown) {
      const execErr = err as { stdout?: string };
      if (execErr.stdout) {
        const result = JSON.parse(execErr.stdout);
        return NextResponse.json({
          success: true,
          unused: {
            dependencies: result.dependencies || [],
            devDependencies: result.devDependencies || [],
          },
        });
      }
      return NextResponse.json({ success: false, error: String(err) });
    }
  }

  if (action === "remove-unused") {
    const { packages } = await request.json();
    if (!Array.isArray(packages) || packages.length === 0) {
      return NextResponse.json({ success: false, error: "Geen packages opgegeven" });
    }
    // Sanitize package names (only allow alphanumeric, @, /, -)
    const safe = packages.filter((p: string) => /^[@a-zA-Z0-9\/-]+$/.test(p));
    if (safe.length === 0) {
      return NextResponse.json({ success: false, error: "Ongeldige packagenamen" });
    }
    try {
      const { stdout, stderr } = await execAsync(
        `npm uninstall ${safe.join(" ")} 2>&1`,
        { cwd: process.cwd(), timeout: 60000 },
      );
      return NextResponse.json({ success: true, output: stdout + stderr, removed: safe });
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string };
      return NextResponse.json({
        success: false,
        output: (execErr.stdout || "") + (execErr.stderr || ""),
      });
    }
  }

  return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
}
