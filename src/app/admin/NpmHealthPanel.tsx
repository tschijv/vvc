"use client";

import { useState } from "react";

type Vuln = {
  name: string;
  severity: string;
  fixAvailable: boolean;
  advisories: string[];
  range: string;
};

type AuditSummary = {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  total: number;
};

type UnusedResult = {
  dependencies: string[];
  devDependencies: string[];
};

const severityColor: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-red-100 text-red-700",
  moderate: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

export default function NpmHealthPanel() {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState<string | null>(null);
  const [audit, setAudit] = useState<{ summary: AuditSummary; vulnerabilities: Vuln[] } | null>(null);
  const [unused, setUnused] = useState<UnusedResult | null>(null);
  const [fixOutput, setFixOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAudit() {
    setScanning("audit");
    setError(null);
    setAudit(null);
    try {
      const res = await fetch("/api/admin/npm-health");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAudit(data.audit);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setScanning(null);
    }
  }

  async function runDepcheck() {
    setScanning("depcheck");
    setError(null);
    setUnused(null);
    try {
      const res = await fetch("/api/admin/npm-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "depcheck" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Depcheck mislukt");
      setUnused(data.unused);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setScanning(null);
    }
  }

  async function runFix(force = false) {
    if (force && !confirm(
      "⚠️ npm audit fix --force kan breaking changes veroorzaken!\n\n" +
      "Dit kan packages downgraden (bijv. Prisma 7→6, Next.js versie).\n" +
      "Na het uitvoeren moet je testen of de applicatie nog werkt.\n\n" +
      "Wil je doorgaan?"
    )) return;

    setLoading(true);
    setFixOutput(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/npm-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: force ? "fix-force" : "fix" }),
      });
      const data = await res.json();
      setFixOutput(data.output || "Geen wijzigingen uitgevoerd");
      // Re-scan after fix
      await runAudit();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function removePackages(packages: string[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/npm-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove-unused", packages }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.output || "Verwijderen mislukt");
      setFixOutput(`Verwijderd: ${data.removed.join(", ")}`);
      // Re-scan after removal
      await runDepcheck();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const hasFixable = audit?.vulnerabilities.some((v) => v.fixAvailable) || false;
  const allUnused = unused
    ? [...unused.dependencies, ...unused.devDependencies]
    : [];
  // Ignore false positives (used via PostCSS/build config)
  const falsePositives = ["tailwindcss", "@tailwindcss/postcss", "@tailwindcss/cli"];
  const realUnused = allUnused.filter((p) => !falsePositives.includes(p));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">Dependency Health Check</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Scan op kwetsbaarheden en ongebruikte packages
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runAudit}
            disabled={!!scanning}
            className="px-3 py-1.5 bg-[#1a6ca8] text-white text-xs font-medium rounded hover:bg-[#155a8c] disabled:opacity-50 transition-colors"
          >
            {scanning === "audit" ? "Scannen..." : "🛡️ Kwetsbaarheden"}
          </button>
          <button
            onClick={runDepcheck}
            disabled={!!scanning}
            className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {scanning === "depcheck" ? "Scannen..." : "📦 Ongebruikte packages"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {fixOutput && (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
          <pre className="text-xs text-green-800 whitespace-pre-wrap max-h-32 overflow-y-auto">
            {fixOutput}
          </pre>
        </div>
      )}

      {/* Audit results */}
      {audit && (
        <div className="mb-4">
          <div className="flex gap-3 mb-3">
            {(["critical", "high", "moderate", "low"] as const).map((sev) => (
              <div
                key={sev}
                className={`px-3 py-1.5 rounded text-xs font-bold ${
                  audit.summary[sev] > 0 ? severityColor[sev] : "bg-gray-50 text-gray-400"
                }`}
              >
                {audit.summary[sev]} {sev}
              </div>
            ))}
            <div
              className={`px-3 py-1.5 rounded text-xs font-bold ${
                audit.summary.total === 0
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {audit.summary.total === 0 ? "✅ Geen kwetsbaarheden" : `${audit.summary.total} totaal`}
            </div>
          </div>

          {audit.vulnerabilities.length > 0 && (
            <div className="border rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th scope="col" className="px-3 py-2 font-semibold text-gray-600">Package</th>
                    <th scope="col" className="px-3 py-2 font-semibold text-gray-600">Ernst</th>
                    <th scope="col" className="px-3 py-2 font-semibold text-gray-600">Probleem</th>
                    <th scope="col" className="px-3 py-2 font-semibold text-gray-600 text-center">Fix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {audit.vulnerabilities
                    .sort((a, b) => {
                      const order = { critical: 0, high: 1, moderate: 2, low: 3 };
                      return (order[a.severity as keyof typeof order] ?? 4) - (order[b.severity as keyof typeof order] ?? 4);
                    })
                    .map((v) => (
                      <tr key={v.name} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono font-medium text-gray-800">{v.name}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${severityColor[v.severity]}`}>
                            {v.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-500 max-w-xs truncate">
                          {v.advisories[0] || v.range}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {v.fixAvailable ? (
                            <span className="text-green-600">✅</span>
                          ) : (
                            <span className="text-red-400" title="Geen automatische fix beschikbaar">❌</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {hasFixable && (
            <div className="mt-3 space-y-2">
              <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-xs text-amber-700">
                <strong>✅ = fix beschikbaar</strong> maar vereist vaak breaking changes (major versie-wijzigingen).
                <br />
                <strong>❌ = geen fix</strong> — pakket moet handmatig vervangen worden.
                <br />
                <span className="text-amber-500">Tip: &quot;npm audit fix&quot; zonder --force wijzigt alleen minor/patch versies. Voor echte fixes is --force nodig.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => runFix(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-500 text-white text-xs font-medium rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Bezig..." : "🔧 Veilige fix (zonder --force)"}
                </button>
                <button
                  onClick={() => runFix(true)}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Bezig..." : "⚠️ Fix met --force (breaking changes mogelijk)"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unused packages results */}
      {unused && (
        <div>
          {realUnused.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700">
              ✅ Geen ongebruikte packages gevonden
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-2">
                <strong>{realUnused.length}</strong> ongebruikte package{realUnused.length !== 1 ? "s" : ""} gevonden:
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {realUnused.map((pkg) => (
                  <span
                    key={pkg}
                    className="px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-mono text-amber-700"
                  >
                    {pkg}
                  </span>
                ))}
              </div>
              <button
                onClick={() => removePackages(realUnused)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Bezig met verwijderen..." : `🗑️ ${realUnused.length} package${realUnused.length !== 1 ? "s" : ""} verwijderen`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
