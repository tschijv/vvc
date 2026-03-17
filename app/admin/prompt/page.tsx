import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import Link from "next/link";
import CopyButton from "./CopyButton";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">{title}</h2>
      {children}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-gray-700 mb-1">{title}</h3>
      {children}
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-sm text-gray-600 leading-relaxed">{children}</li>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>;
}

function Bold({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-gray-800">{children}</strong>;
}

export default async function PromptPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const promptText = `# Regeneratie-prompt: Voorzieningencatalogus

> Gebruik deze prompt om de volledige applicatie opnieuw te genereren met Claude Code of een vergelijkbare AI-assistent.

## Opdracht

Bouw een Voorzieningencatalogus voor de Nederlandse gemeentelijke sector. Dit is een webapplicatie waarmee gemeenten hun softwarepakketten, leveranciers, standaarden en koppelingen kunnen beheren en vergelijken. De applicatie is gebaseerd op het GEMMA-referentiemodel van VNG.

## Technische stack

- Framework: Next.js 16 (App Router, Server Components)
- Taal: TypeScript
- Styling: Tailwind CSS v4
- Database: PostgreSQL (Neon) via Prisma 7 met PrismaPg adapter
- Authenticatie: NextAuth v5 (credentials provider, bcrypt)
- E-mail: Resend
- Rich text editor: TipTap
- Kaarten: Leaflet / React-Leaflet
- CSV/Excel: csv-parse, xlsx
- Document generatie: docx (voor Word-documenten)
- Deployment: Vercel
- Tests: Vitest

## Datamodel — 26 entiteiten

### Kern-entiteiten
1. Leverancier — contactgegevens, convenant-status, logo, support/documentatie URLs
2. Pakket — softwarepakketten van leveranciers (naam, slug, beschrijving)
3. Pakketversie — versies met status (in ontwikkeling/test/distributie)
4. PakketContact — contactpersonen per pakket
5. ExternPakket — externe pakketten buiten de catalogus

### GEMMA-domein
6. Referentiecomponent — GEMMA referentiecomponenten
7. Standaard — standaarden (bijv. StUF, API's)
8. Standaardversie — versies met compliancyMonitor vlag
9. Applicatiefunctie — applicatiefuncties uit GEMMA
10. GemmaView — views/diagrammen uit GEMMA ArchiMate-model

### Gemeente-domein
11. Gemeente — alle gemeenten met CBS-code, voortgang
12. Samenwerking — samenwerkingsverbanden
13. SamenwerkingGemeente — koppeltabel

### Integratie-domein
14. Koppeling — integraties tussen systemen (bron, doel, richting, standaard)
15. Addendum — addenda bij convenanten
16. LeverancierAddendum — koppeltabel

### Koppeltabellen met attributen
17. GemeentePakket — welk pakket een gemeente gebruikt
18. PakketversieReferentiecomponent — implementatie referentiecomponenten
19. PakketversieStandaard — compliancy aan standaardversies
20. PakketversieApplicatiefunctie — ondersteunde functies
21. PakketversieTechnologie — technologieën per versie

### Gebruikers & Content
22. User — met rollen (10 rollen), gekoppeld aan gemeente/leverancier
23. PasswordResetToken
24. Pagina — CMS-pagina's (slug, titel, rich-text)
25. Begrip — NL-SBB/SKOS begrippen
26. AuditLog — audit logging

## Pagina's — 40+ routes

Publiek: /, /pakketten, /leveranciers, /gemeenten, /standaarden, /referentiecomponenten, /samenwerkingen, /koppelingen, /compliancy, /begrippen, /kaart, /inkoop, /zoeken, /dashboard, /info/[slug], /dienstverleners, /cloudproviders
Auth: /auth/login, /auth/registreren, /auth/wachtwoord-vergeten, /auth/wachtwoord-reset
Admin: /admin, /admin/gebruikers, /admin/registraties, /admin/gemeenten/samenvoegen, /admin/auditlog, /admin/statistieken, /admin/pve-analyse, /admin/datamodel, /admin/prompt, /upload
API v1: /api/v1/gemeenten, /api/v1/leveranciers, /api/v1/referentiecomponenten, /api/v1/standaarden, /api/v1/begrippen, /api/v1/openapi, /api/v1/docs

## GEMMA synchronisatie
- GEMMA ArchiMate Model API (gemmaonline.nl)
- NL-SBB SKOS/Skosmos API (begrippenxl.nl)

## Bijzonderheden
- GlossaryHighlighter: automatische begrippen-tooltips
- Compliancy-monitor: matrix pakketten vs standaarden
- Inkoopondersteuning: selecteer functies, vergelijk pakketten
- Kaart: Leaflet + SVG-kaart van Nederland
- Gemeente samenvoegen bij herindelingen
- PvE-analyse: 104 eisen en wensen
- Audit log voor alle mutaties
- API-authenticatie via API_USER rol`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regeneratie-prompt</h1>
          <p className="text-sm text-gray-500 mt-1">Prompt om de applicatie opnieuw te genereren met AI</p>
        </div>
        <Link href="/admin" className="text-sm text-[#1a6ca8] hover:underline">&larr; Beheer</Link>
      </div>

      {/* Kopieer-blok */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Volledige prompt (kopieerbaar)</h2>
          <CopyButton text={promptText} />
        </div>
        <pre className="bg-gray-50 border border-gray-100 rounded p-4 text-xs text-gray-700 font-mono whitespace-pre-wrap max-h-[400px] overflow-y-auto leading-relaxed">
          {promptText}
        </pre>
      </div>

      {/* Leesbare versie */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Gebruik deze prompt om de volledige applicatie opnieuw te genereren met <Bold>Claude Code</Bold> of
            een vergelijkbare AI-assistent. Kopieer de volledige prompt hierboven of gebruik de leesbare versie
            hieronder als referentie.
          </p>
        </div>

        <Section title="Opdracht">
          <p className="text-sm text-gray-600">
            Bouw een <Bold>Voorzieningencatalogus</Bold> voor de Nederlandse gemeentelijke sector.
            Een webapplicatie waarmee gemeenten hun softwarepakketten, leveranciers, standaarden en
            koppelingen kunnen beheren en vergelijken, gebaseerd op het GEMMA-referentiemodel van VNG.
          </p>
        </Section>

        <Section title="Technische stack">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              ["Framework", "Next.js 16"],
              ["Taal", "TypeScript"],
              ["Styling", "Tailwind CSS v4"],
              ["Database", "PostgreSQL (Neon) + Prisma 7"],
              ["Auth", "NextAuth v5"],
              ["E-mail", "Resend"],
              ["Editor", "TipTap"],
              ["Kaarten", "Leaflet"],
              ["Import", "csv-parse, xlsx"],
              ["Docs", "docx"],
              ["Deploy", "Vercel"],
              ["Tests", "Vitest"],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded px-3 py-2">
                <div className="text-xs text-gray-400">{label}</div>
                <div className="text-sm font-medium text-gray-800">{value}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Datamodel (26 entiteiten)">
          {[
            {
              groep: "Kern-entiteiten",
              kleur: "bg-orange-50 border-orange-200",
              items: ["Leverancier", "Pakket", "Pakketversie", "PakketContact", "ExternPakket"],
            },
            {
              groep: "GEMMA-domein",
              kleur: "bg-blue-50 border-blue-200",
              items: ["Referentiecomponent", "Standaard", "Standaardversie", "Applicatiefunctie", "GemmaView"],
            },
            {
              groep: "Gemeente-domein",
              kleur: "bg-green-50 border-green-200",
              items: ["Gemeente", "Samenwerking", "SamenwerkingGemeente"],
            },
            {
              groep: "Integratie-domein",
              kleur: "bg-amber-50 border-amber-200",
              items: ["Koppeling", "Addendum", "LeverancierAddendum"],
            },
            {
              groep: "Koppeltabellen",
              kleur: "bg-purple-50 border-purple-200",
              items: ["GemeentePakket", "PvReferentiecomponent", "PvStandaard", "PvApplicatiefunctie", "PvTechnologie"],
            },
            {
              groep: "Gebruikers & Content",
              kleur: "bg-teal-50 border-teal-200",
              items: ["User", "PasswordResetToken", "Pagina", "Begrip", "AuditLog"],
            },
          ].map((g) => (
            <div key={g.groep} className={`border rounded px-3 py-2 mb-2 ${g.kleur}`}>
              <span className="text-xs font-semibold text-gray-600">{g.groep}: </span>
              <span className="text-xs text-gray-500">
                {g.items.map((item, i) => (
                  <span key={item}>
                    <Code>{item}</Code>
                    {i < g.items.length - 1 && ", "}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </Section>

        <Section title="Pagina's en routes (40+)">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SubSection title="Publiek">
              <ul className="space-y-0.5 list-none">
                {["/", "/pakketten", "/leveranciers", "/gemeenten", "/standaarden",
                  "/referentiecomponenten", "/samenwerkingen", "/koppelingen",
                  "/compliancy", "/begrippen", "/kaart", "/inkoop", "/zoeken",
                  "/dashboard", "/info/[slug]"].map((r) => (
                  <Li key={r}><Code>{r}</Code></Li>
                ))}
              </ul>
            </SubSection>
            <SubSection title="Beheer (ADMIN)">
              <ul className="space-y-0.5 list-none">
                {["/admin", "/admin/gebruikers", "/admin/registraties",
                  "/admin/gemeenten/samenvoegen", "/admin/auditlog",
                  "/admin/statistieken", "/admin/pve-analyse",
                  "/admin/datamodel", "/admin/prompt", "/upload"].map((r) => (
                  <Li key={r}><Code>{r}</Code></Li>
                ))}
              </ul>
            </SubSection>
            <SubSection title="REST API (v1)">
              <ul className="space-y-0.5 list-none">
                {["/api/v1/gemeenten", "/api/v1/leveranciers",
                  "/api/v1/referentiecomponenten", "/api/v1/standaarden",
                  "/api/v1/begrippen", "/api/v1/openapi", "/api/v1/docs"].map((r) => (
                  <Li key={r}><Code>{r}</Code></Li>
                ))}
              </ul>
            </SubSection>
          </div>
        </Section>

        <Section title="Externe integraties">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm font-semibold text-gray-700">GEMMA ArchiMate API</div>
              <div className="text-xs text-gray-500">gemmaonline.nl &mdash; Referentiecomponenten, standaarden, applicatiefuncties, views</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm font-semibold text-gray-700">NL-SBB SKOS/Skosmos API</div>
              <div className="text-xs text-gray-500">begrippenxl.nl &mdash; Begrippen/termen voor het begrippenkader</div>
            </div>
          </div>
        </Section>

        <Section title="Bijzonderheden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              ["Begrippen-tooltips", "GlossaryHighlighter markeert automatisch termen in tekst"],
              ["Compliancy-monitor", "Matrix van pakketten vs standaarden met vinkjes/kruisjes"],
              ["Inkoopondersteuning", "Selecteer applicatiefuncties, vergelijk pakketten"],
              ["Kaartweergave", "Leaflet + SVG-kaart van Nederland"],
              ["Gemeente samenvoegen", "Data-migratie bij herindelingen"],
              ["PvE-analyse", "104 eisen en wensen geanalyseerd"],
              ["Audit log", "Alle mutaties worden bijgehouden"],
              ["API-authenticatie", "Bearer tokens via API_USER rol"],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-2 text-sm">
                <span className="text-[#1a6ca8] font-semibold whitespace-nowrap">{title}:</span>
                <span className="text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <div className="border-t border-gray-200 pt-4 mt-6">
          <p className="text-xs text-gray-400">
            Bronbestand: <Code>PROMPT.md</Code> in de project root.
            Zie ook <Link href="/admin/datamodel" className="text-[#1a6ca8] hover:underline">Datamodel (MIM)</Link> voor
            het volledige informatiemodel.
          </p>
        </div>
      </div>
    </div>
  );
}

