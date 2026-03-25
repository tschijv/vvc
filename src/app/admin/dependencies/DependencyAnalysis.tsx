"use client";

import { useState, useEffect } from "react";

type DepInfo = {
  naam: string;
  versie: string;
  categorie: string;
  doel: string;
  type: "dependency" | "devDependency";
};

type AuditVuln = {
  naam: string;
  severity: string;
  title: string;
  fixAvailable: boolean;
  via: string;
};

type AnalysisData = {
  dependencies: DepInfo[];
  vulnerabilities: AuditVuln[];
  licenses: { license: string; count: number }[];
  totalPackages: number;
  totalSize: string;
  timestamp: string;
};

const CATEGORIES: Record<string, { doel: string; categorie: string }> = {
  "next": { categorie: "Framework", doel: "React framework met SSR, routing, API routes" },
  "react": { categorie: "Framework", doel: "UI library — component rendering" },
  "react-dom": { categorie: "Framework", doel: "React DOM renderer voor browser" },
  "@prisma/client": { categorie: "Database", doel: "ORM — type-safe database queries" },
  "@prisma/adapter-pg": { categorie: "Database", doel: "PostgreSQL adapter voor Prisma" },
  "pg": { categorie: "Database", doel: "PostgreSQL driver (Node.js)" },
  "prisma": { categorie: "Database", doel: "Prisma CLI — migraties, schema, generate" },
  "next-auth": { categorie: "Authenticatie", doel: "Login, sessies, rollen, JWT" },
  "bcryptjs": { categorie: "Authenticatie", doel: "Wachtwoord hashing (bcrypt)" },
  "tailwindcss": { categorie: "Styling", doel: "Utility-first CSS framework" },
  "@tailwindcss/postcss": { categorie: "Styling", doel: "PostCSS plugin voor Tailwind" },
  "@anthropic-ai/sdk": { categorie: "AI", doel: "Claude API — AI-adviseur" },
  "leaflet": { categorie: "Kaarten", doel: "Interactieve kaart library" },
  "react-leaflet": { categorie: "Kaarten", doel: "React wrapper voor Leaflet" },
  "csv-parse": { categorie: "Data import", doel: "CSV parsing voor portfolio-upload" },
  "xlsx": { categorie: "Data import", doel: "Excel parsing (⚠️ niet meer onderhouden)" },
  "docx": { categorie: "Document", doel: "Word-documenten programmatisch aanmaken" },
  "n3": { categorie: "Linked Data", doel: "RDF serialisatie (JSON-LD, Turtle, RDF/XML)" },
  "resend": { categorie: "E-mail", doel: "Transactionele e-mails (registratie, reset)" },
  "zod": { categorie: "Validatie", doel: "Input validatie op API routes" },
  "dotenv": { categorie: "Config", doel: "Environment variables laden uit .env" },
  "typescript": { categorie: "TypeScript", doel: "Type checking compiler" },
  "eslint": { categorie: "Linting", doel: "Code kwaliteitscontrole" },
  "eslint-config-next": { categorie: "Linting", doel: "ESLint regels voor Next.js" },
  "vitest": { categorie: "Testing", doel: "Unit test framework" },
  "jsdom": { categorie: "Testing", doel: "DOM simulatie voor tests" },
  "@playwright/test": { categorie: "Testing", doel: "E2E test framework" },
  "playwright": { categorie: "Testing", doel: "Browser automatisatie engine" },
};

// Match TipTap packages
function getCategory(name: string): { categorie: string; doel: string } {
  if (CATEGORIES[name]) return CATEGORIES[name];
  if (name.startsWith("@tiptap/")) return { categorie: "Rich text editor", doel: "TipTap editor module" };
  if (name.startsWith("@types/")) return { categorie: "TypeScript", doel: `Type definities voor ${name.replace("@types/", "")}` };
  return { categorie: "Overig", doel: "Transitive of utility package" };
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-700 text-white",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  moderate: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

export default function DependencyAnalysis() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "vuln" | "dev" | "prod">("all");

  async function runAnalysis() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/dependency-analysis");
      if (!res.ok) throw new Error("Analyse mislukt");
      setData(await res.json());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { runAnalysis(); }, []);

  if (loading) return (
    <div className="text-center py-12 text-gray-500">
      <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-[#1a6ca8] rounded-full mb-3" />
      <p>Analyse wordt uitgevoerd...</p>
      <p className="text-xs text-gray-400 mt-1">npm audit + license check (~15 sec)</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p className="font-medium">Fout bij analyse</p>
      <p className="text-sm mt-1">{error}</p>
      <button onClick={runAnalysis} className="mt-2 text-sm text-[#1a6ca8] hover:underline">Opnieuw proberen</button>
    </div>
  );

  if (!data) return null;

  const filteredDeps = data.dependencies.filter(d => {
    if (filter === "vuln") return data.vulnerabilities.some(v => v.naam === d.naam);
    if (filter === "dev") return d.type === "devDependency";
    if (filter === "prod") return d.type === "dependency";
    return true;
  });

  const vulnCount = data.vulnerabilities.length;
  const highCount = data.vulnerabilities.filter(v => v.severity === "high" || v.severity === "critical").length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <SummaryCard label="Directe packages" value={String(data.dependencies.length)} color="blue" />
        <SummaryCard label="Totaal (incl. transitive)" value={String(data.totalPackages)} color="gray" />
        <SummaryCard label="Totale grootte" value={data.totalSize} color="gray" />
        <SummaryCard label="Kwetsbaarheden" value={String(vulnCount)} color={vulnCount > 0 ? "red" : "green"} />
        <SummaryCard label="Hoog/Kritiek" value={String(highCount)} color={highCount > 0 ? "red" : "green"} />
      </div>

      {/* Vulnerabilities */}
      {data.vulnerabilities.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Kwetsbaarheden ({vulnCount})</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 text-left">
                <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Package</th>
                <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Ernst</th>
                <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Probleem</th>
                <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Via</th>
                <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-300 text-center">Fix?</th>
              </tr>
            </thead>
            <tbody>
              {data.vulnerabilities.map((v, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-slate-700">
                  <td className="py-2 px-3 font-mono text-xs">{v.naam}</td>
                  <td className="py-2 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_COLORS[v.severity] || ""}`}>
                      {v.severity}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{v.title}</td>
                  <td className="py-2 px-3 text-gray-400 text-xs">{v.via}</td>
                  <td className="py-2 px-3 text-center">{v.fixAvailable ? "✅" : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Licenses */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Licenties</h2>
        <div className="flex flex-wrap gap-2">
          {data.licenses.map(l => (
            <span key={l.license} className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              l.license.includes("GPL") || l.license === "UNLICENSED"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300"
            }`}>
              {l.license} ({l.count})
            </span>
          ))}
        </div>
      </div>

      {/* Dependencies table */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Packages ({filteredDeps.length})</h2>
          <div className="flex gap-1">
            {(["all", "prod", "dev", "vuln"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-[#1a6ca8] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300"
                }`}>
                {{ all: "Alle", prod: "Productie", dev: "Development", vuln: "Kwetsbaar" }[f]}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700 text-left">
              <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Package</th>
              <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Versie</th>
              <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Categorie</th>
              <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Doel</th>
              <th scope="col" className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-300 text-center">Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeps.map(d => {
              const hasVuln = data.vulnerabilities.some(v => v.naam === d.naam);
              return (
                <tr key={d.naam} className={`border-b border-gray-100 dark:border-slate-700 ${hasVuln ? "bg-red-50 dark:bg-red-900/20" : ""}`}>
                  <td className="py-2 px-3 font-mono text-xs">
                    {hasVuln && <span className="text-red-500 mr-1" title="Kwetsbaar">⚠</span>}
                    {d.naam}
                  </td>
                  <td className="py-2 px-3 text-gray-500 text-xs">{d.versie}</td>
                  <td className="py-2 px-3">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[#1a6ca8] dark:text-blue-300 rounded text-xs">
                      {d.categorie}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{d.doel}</td>
                  <td className="py-2 px-3 text-center text-xs text-gray-400">{d.type === "dependency" ? "prod" : "dev"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Timestamp + refresh */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Laatste analyse: {new Date(data.timestamp).toLocaleString("nl-NL")}</span>
        <button onClick={runAnalysis} className="text-[#1a6ca8] hover:underline">
          Opnieuw analyseren
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-[#1a6ca8]",
    red: "text-red-600",
    green: "text-green-600",
    gray: "text-gray-700 dark:text-gray-300",
  };
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-center">
      <div className={`text-2xl font-bold ${colorMap[color] || colorMap.gray}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
