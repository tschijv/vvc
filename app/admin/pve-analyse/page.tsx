import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import type { Metadata } from "next";
import PveDetailTables from "./PveDetailTables";

export const metadata: Metadata = {
  title: "PvE-analyse",
};

export default async function PveAnalysePage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <>
      <style>{`
        .pve .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 1.5rem 0; }
        .pve .summary-card { background: white; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-left: 4px solid #e2e8f0; }
        .pve .summary-card.green { border-left-color: #16a34a; }
        .pve .summary-card.amber { border-left-color: #d97706; }
        .pve .summary-card.red { border-left-color: #dc2626; }
        .pve .summary-card.blue { border-left-color: #1a6ca8; }
        .pve .summary-card .label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .pve .summary-card .value { font-size: 1.75rem; font-weight: 700; margin: 0.25rem 0; }
        .pve .summary-card.green .value { color: #16a34a; }
        .pve .summary-card.amber .value { color: #d97706; }
        .pve .summary-card.red .value { color: #dc2626; }
        .pve .summary-card.blue .value { color: #1a6ca8; }
        .pve .summary-card .detail { font-size: 0.8rem; color: #94a3b8; }
        .pve .summary-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .pve .summary-table th { background: #1a6ca8; color: white; padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; font-weight: 600; }
        .pve .summary-table td { padding: 0.6rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
        .pve .summary-table tr:last-child td { border-bottom: none; font-weight: 700; background: #f8fafc; }
        .pve .summary-table td:not(:first-child) { text-align: center; }
        .pve .conclusion-box { background: linear-gradient(135deg, #eff6ff, #f0fdf4); border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 1.25rem 1.5rem; margin: 1.5rem 0; font-size: 0.95rem; }
        .pve .conclusion-box strong { color: #1a6ca8; }
        .pve .legend { display: flex; gap: 1.5rem; flex-wrap: wrap; margin: 1rem 0 2rem; padding: 1rem 1.25rem; background: white; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .pve .legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #475569; }
        .pve table.detail { width: 100%; border-collapse: collapse; margin: 1rem 0 2rem; background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); font-size: 0.88rem; }
        .pve table.detail th { background: #f1f5f9; color: #334155; padding: 0.6rem 0.75rem; text-align: left; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.03em; border-bottom: 2px solid #e2e8f0; }
        .pve table.detail td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .pve table.detail tr:hover { background: #f8fafc; }
        .pve table.detail td:nth-child(1) { width: 50px; color: #94a3b8; text-align: center; }
        .pve table.detail td:nth-child(3) { width: 80px; text-align: center; }
        .pve table.detail td:nth-child(4) { width: 60px; text-align: center; }
        .pve table.detail td:nth-child(5) { max-width: 45%; }
        .pve table.detail th:nth-child(6), .pve table.detail td:nth-child(6) { width: 36px; text-align: center; padding: 0.4rem; }
        .pve .demo-link { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 6px; background: #eff6ff; color: #1a6ca8; transition: all 0.15s; text-decoration: none; }
        .pve .demo-link:hover { background: #1a6ca8; color: white; }
        .pve .demo-link svg { width: 14px; height: 14px; }
        .dark .pve .demo-link { background: #1e3a5f; color: #93c5fd; }
        .dark .pve .demo-link:hover { background: #2563eb; color: white; }
        .pve .tag { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .pve .tag-eis { background: #dbeafe; color: #1e40af; }
        .pve .tag-wens { background: #fef3c7; color: #92400e; }
        .pve .tag-could { background: #f3e8ff; color: #7c3aed; }
        .pve .tag-nvt { background: #f1f5f9; color: #64748b; }
        .pve .toelichting { color: #475569; }
        .pve .peter { background: #fffbeb; border-left: 3px solid #e35b10; padding: 0.25rem 0.5rem; margin-top: 0.35rem; font-size: 0.82rem; color: #92400e; display: block; border-radius: 0 0.25rem 0.25rem 0; }
        .pve .opmerking-card { background: white; border-radius: 0.75rem; padding: 1.25rem 1.5rem; margin: 0.75rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .pve .opmerking-card h4 { color: #1a6ca8; font-size: 0.95rem; margin-bottom: 0.5rem; }
        .pve .opmerking-card p { font-size: 0.9rem; color: #475569; }
        .pve .points-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1.5rem 0; }
        .pve .points-card { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .pve .points-card h3 { margin-top: 0; }
        .pve .points-card ol { padding-left: 1.25rem; }
        .pve .points-card li { margin-bottom: 0.5rem; font-size: 0.9rem; color: #475569; }
        .pve .points-card li strong { color: #1e293b; }
        .pve .aanbeveling { background: linear-gradient(135deg, #1a6ca8, #0f4c75); color: white; border-radius: 0.75rem; padding: 1.5rem 2rem; margin: 2rem 0; }
        .pve .aanbeveling h3 { color: white; margin-top: 0; margin-bottom: 0.75rem; }
        .pve .aanbeveling ol { padding-left: 1.25rem; }
        .pve .aanbeveling li { margin-bottom: 0.4rem; font-size: 0.9rem; opacity: 0.95; }
        .pve .aanbeveling li strong { color: #93c5fd; }
        .pve .section-title { font-size: 1.35rem; color: #1a6ca8; margin-top: 2.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e2e8f0; }
        .pve .section-subtitle { font-size: 1.1rem; color: #334155; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        @media (max-width: 768px) {
          .pve .summary-grid { grid-template-columns: repeat(2, 1fr); }
          .pve .points-grid { grid-template-columns: 1fr; }
          .pve .legend { flex-direction: column; gap: 0.5rem; }
        }
        /* Dark mode */
        .dark .pve .summary-card, .dark .pve table.detail, .dark .pve .summary-table,
        .dark .pve .legend, .dark .pve .opmerking-card, .dark .pve .points-card { background: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .dark .pve .summary-table th { background: #0f4c75; }
        .dark .pve table.detail th { background: #334155; color: #e2e8f0; border-color: #475569; }
        .dark .pve table.detail td { border-color: #334155; color: #cbd5e1; }
        .dark .pve table.detail tr:hover { background: #334155; }
        .dark .pve .summary-table td { border-color: #334155; color: #cbd5e1; }
        .dark .pve .summary-table tr:last-child td { background: #0f172a; }
        .dark .pve .conclusion-box { background: linear-gradient(135deg, #1e3a5f, #14532d); border-color: #1e40af; }
        .dark .pve .conclusion-box strong { color: #60a5fa; }
        .dark .pve .toelichting { color: #94a3b8; }
        .dark .pve .legend-item { color: #94a3b8; }
        .dark .pve .opmerking-card h4 { color: #60a5fa; }
        .dark .pve .opmerking-card p { color: #94a3b8; }
        .dark .pve .points-card li { color: #94a3b8; }
        .dark .pve .points-card li strong { color: #e2e8f0; }
        .dark .pve .section-title { color: #60a5fa; border-color: #334155; }
        .dark .pve .section-subtitle { color: #cbd5e1; }
        .dark .pve .peter { background: #451a03; border-color: #f97316; color: #fdba74; }
        .dark .pve .tag-eis { background: #1e3a5f; color: #93c5fd; }
        .dark .pve .tag-wens { background: #451a03; color: #fbbf24; }
        .dark .pve .tag-could { background: #2e1065; color: #c4b5fd; }
        .dark .pve .summary-card .label { color: #94a3b8; }
        .dark .pve .summary-card .detail { color: #64748b; }
      `}</style>

      <div className="pve">
        <Link href="/admin" className="text-sm text-[#1a6ca8] hover:underline mb-4 inline-block">← Terug naar beheer</Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Analyse Programma van Eisen vs. Gerealiseerde Functionaliteit</h1>
        <p className="text-gray-500 text-sm mb-1">Voorzieningencatalogus <span className="text-gray-400">(voorheen Softwarecatalogus)</span></p>
        <p className="text-gray-400 text-xs mb-8">
          <strong className="text-gray-500">Datum:</strong> 16 maart 2026 &nbsp;·&nbsp;
          <strong className="text-gray-500">Bron:</strong> Bijlage 1.2 — Programma van Eisen (Peter Makkes) &nbsp;·&nbsp;
          <strong className="text-gray-500">Vergeleken met:</strong> Huidige applicatie (Next.js / Prisma / PostgreSQL)
        </p>

        {/* ─── SAMENVATTING ─── */}
        <h2 className="section-title">Samenvatting</h2>

        <div className="summary-grid">
          <div className="summary-card blue">
            <div className="label">Totaal eisen &amp; wensen</div>
            <div className="value">104</div>
            <div className="detail">68 eisen · 34 wensen · 2 could have</div>
          </div>
          <div className="summary-card green">
            <div className="label">Gerealiseerd ✅</div>
            <div className="value">54</div>
            <div className="detail">52% van totaal</div>
          </div>
          <div className="summary-card amber">
            <div className="label">Deels gerealiseerd ⚠</div>
            <div className="value">13</div>
            <div className="detail">13% van totaal</div>
          </div>
          <div className="summary-card red">
            <div className="label">Niet gerealiseerd ❌</div>
            <div className="value">37</div>
            <div className="detail">36% van totaal</div>
          </div>
        </div>

        <table className="summary-table">
          <thead><tr><th>Categorie</th><th>Aantal</th><th>✅ Gerealiseerd</th><th>⚠ Deels</th><th>❌ Niet</th></tr></thead>
          <tbody>
            <tr><td>Eisen (must have)</td><td>68</td><td>41</td><td>9</td><td>18</td></tr>
            <tr><td>Wensen (nice to have)</td><td>34</td><td>13</td><td>4</td><td>17</td></tr>
            <tr><td>Could have</td><td>2</td><td>0</td><td>0</td><td>2</td></tr>
            <tr><td>Totaal</td><td>104</td><td>54 (52%)</td><td>13 (13%)</td><td>37 (36%)</td></tr>
          </tbody>
        </table>

        <div className="conclusion-box">
          <strong>Conclusie:</strong> Circa <strong>64%</strong> van alle eisen en wensen is geheel of gedeeltelijk gerealiseerd. Van de 68 harde <strong>eisen</strong> is <strong>74%</strong> (50 van 68) geheel of deels gerealiseerd. <strong>60%</strong> van de eisen is volledig gerealiseerd. Van de 34 <strong>wensen</strong> is <strong>50%</strong> (17 van 34) geheel of deels gerealiseerd, waarvan 13 volledig.
        </div>

        {/* ─── LEGENDA ─── */}
        <div className="legend">
          <div className="legend-item">✅ <strong>Gerealiseerd</strong> — aanwezig en werkend</div>
          <div className="legend-item">⚠ <strong>Deels</strong> — basis aanwezig, niet volledig</div>
          <div className="legend-item">❌ <strong>Niet gerealiseerd</strong> — ontbreekt</div>
          <div className="legend-item">📌 <strong>Opmerking Peter</strong> — context uit mail</div>
        </div>

        {/* ═══ DETAIL TABELLEN ═══ */}
        <PveDetailTables />

        {/* ═══ OPMERKINGEN PETER ═══ */}
        <h2 className="section-title">Opmerkingen n.a.v. mail Peter Makkes</h2>

        <div className="opmerking-card">
          <h4>1. Naamswijziging</h4>
          <p>De applicatie heet nu &quot;GEMMA Softwarecatalogus&quot; en moet hernoemd worden naar <strong>&quot;Voorzieningencatalogus&quot;</strong>. Dit raakt layout, metadata, OG-image, en alle referenties in de code.</p>
        </div>
        <div className="opmerking-card">
          <h4>2. Rollenmodel</h4>
          <p>Peter beschrijft drie hoofdrollen:</p>
          <ul style={{ margin: "0.5rem 0 0 1.25rem", fontSize: "0.9rem", color: "#475569" }}>
            <li><strong>Aanbod-beheerder</strong> (leveranciers) — geïmplementeerd als LEVERANCIER rol</li>
            <li><strong>Gebruik-beheerder</strong> (gemeenten/samenwerkingen) — geïmplementeerd als GEMEENTE_BEHEERDER</li>
            <li><strong>Gebruik-raadpleger</strong> — geïmplementeerd als GEMEENTE_RAADPLEGER</li>
          </ul>
          <p style={{ marginTop: "0.5rem" }}>De huidige implementatie matcht redelijk maar mist het zelf-registratie en fiatteringsproces.</p>
        </div>
        <div className="opmerking-card">
          <h4>3. Autorisatie</h4>
          <ul style={{ margin: "0.5rem 0 0 1.25rem", fontSize: "0.9rem", color: "#475569" }}>
            <li><span style={{ color: "#16a34a" }}>✅</span> Gemeenten zien alles inclusief elkaars landschappen</li>
            <li><span style={{ color: "#16a34a" }}>✅</span> Leveranciers zien alleen hun eigen aanbod en gebruik</li>
            <li><span style={{ color: "#16a34a" }}>✅</span> Bezoekers zien alleen openbare info</li>
          </ul>
        </div>
        <div className="opmerking-card">
          <h4>4. Suite-concept</h4>
          <p>Peter geeft aan dat het suite-concept voorlopig is losgelaten. Geen actie nodig.</p>
        </div>
        <div className="opmerking-card">
          <h4>5. GEMMA Views</h4>
          <p>Peter verwijst naar <a href="https://vng-realisatie.github.io/Over-GEMMA-Archi-repository/?view=id-26040" target="_blank" rel="noopener noreferrer" style={{ color: "#1a6ca8" }}>GEMMA Archi repository view</a>. De kaart-functionaliteit (/kaart) biedt al GEMMA views, maar de specifieke view-structuur zou gevalideerd moeten worden.</p>
        </div>

        {/* ═══ CONCLUSIES ═══ */}
        <h2 className="section-title">Conclusies</h2>

        <div className="points-grid">
          <div className="points-card">
            <h3 style={{ color: "#16a34a" }}>✅ Sterke punten</h3>
            <ol>
              <li><strong>Kernfunctionaliteit aanbod &amp; gebruik</strong> — Pakketten, leveranciers, gemeenten, standaarden volledig uitgewerkt</li>
              <li><strong>GEMMA-integratie</strong> — Views, glossary, AMEFF export/import</li>
              <li><strong>Autorisatiemodel</strong> — 10 rollen, correct filteren per rol</li>
              <li><strong>Zelf-registratie &amp; fiattering</strong> — Concept-registratie, admin-goedkeuring workflow</li>
              <li><strong>E-mailfunctionaliteit</strong> — Registratie-notificaties, goedkeuring/afwijzing, wachtwoord-reset (Resend)</li>
              <li><strong>Organisatie-informatie</strong> — Contactpersonen per pakket, diensten-omschrijving, support/documentatie/kennisbank-links</li>
              <li><strong>API</strong> — Publieke REST API met OpenAPI docs</li>
              <li><strong>Vergelijkfunctie</strong> — Side-by-side gemeente-vergelijking</li>
              <li><strong>Fuzzy search</strong> — Typfouten-tolerant (pg_trgm)</li>
              <li><strong>Responsiveness &amp; Dark mode</strong></li>
            </ol>
          </div>
          <div className="points-card gaps">
            <h3 style={{ color: "#dc2626" }}>❌ Belangrijkste gaps</h3>
            <ol>
              <li><strong>2FA/TOTP</strong> — Alleen email + wachtwoord</li>
              <li><strong>Multi-organisatie toegang</strong> — User = 1 organisatie</li>
              <li><strong>Geautomatiseerde tests</strong> — Geen tests aanwezig</li>
              <li><strong>OTAP / CI/CD</strong> — Geen pipeline of omgevingen</li>
            </ol>
          </div>
        </div>

        <div className="conclusion-box" style={{ background: "linear-gradient(135deg, #fef3c7, #fff7ed)", borderColor: "#f59e0b" }}>
          <strong style={{ color: "#92400e" }}>IBD-wensen: volledig open terrein</strong><br />
          Alle IBD-gerelateerde wensen (BIO compliance, DPIA, pen-tests, DigiD, kwetsbaarheden, register van verwerkingen) zijn niet gerealiseerd. Dit is een groot functioneel domein dat aanzienlijke ontwikkeltijd vergt en deels afhankelijk is van GEMMA-uitbreidingen.
        </div>

        <div className="aanbeveling">
          <h3>Aanbeveling prioritering</h3>
          <p style={{ marginBottom: "0.75rem", opacity: 0.9 }}>De huidige applicatie dekt de kernfunctionaliteit goed af. Zelf-registratie, fiattering en e-mailfunctionaliteit zijn inmiddels gerealiseerd. De grootste resterende gaps zitten in:</p>
          <ol>
            <li><strong>Gebruikersbeheer-uitbreidingen</strong> — multi-organisatie toegang, zelf-beheer collega-accounts</li>
            <li><strong>Beveiligingseisen</strong> — 2FA/TOTP, audit logging</li>
            <li><strong>DevOps</strong> — testen, CI/CD, OTAP</li>
            <li><strong>IBD/compliance domein</strong> — volledig nieuw te bouwen</li>
          </ol>
          <p style={{ marginTop: "0.75rem", opacity: 0.85, fontSize: "0.85rem" }}>Prioritering zou moeten liggen bij de harde eisen die nog niet gerealiseerd zijn, met name de beveiligingseisen en DevOps-vereisten, aangezien deze randvoorwaardelijk zijn voor productie-gebruik.</p>
        </div>
      </div>
    </>
  );
}
