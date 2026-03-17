import Link from "next/link";

/* ── Link-icoon SVG ── */
function DemoLink({ href, title }: { href: string; title?: string }) {
  return (
    <Link href={href} className="demo-link" title={title || "Bekijk demo"}>
      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" /><path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" /></svg>
    </Link>
  );
}

/* ── Types ── */
type Prio = "eis" | "wens" | "could" | "nvt";
type Status = "yes" | "partial" | "no" | "nvt";

interface Row {
  id: string;
  naam: string;
  prio: Prio;
  status: Status;
  toelichting: string;
  peter?: string;
  link?: string;
  linkTitle?: string;
}

interface Section {
  title: string;
  subtitle?: string;
  rows: Row[];
}

const prioLabel: Record<Prio, [string, string]> = {
  eis: ["Eis", "tag-eis"],
  wens: ["Wens", "tag-wens"],
  could: ["Could", "tag-could"],
  nvt: ["n.v.t.", "tag-nvt"],
};

const statusIcon: Record<Status, string> = {
  yes: "\u2705",
  partial: "\u26A0",
  no: "\u274C",
  nvt: "",
};

/* ── Alle eisen en wensen ── */
const sections: Section[] = [
  {
    title: "1. Aanbod (Functioneel)",
    subtitle: "Eisen",
    rows: [
      { id: "1", naam: "Zoeken/filteren op standaarden", prio: "eis", status: "yes", toelichting: "Standaardenpagina met versies en pakketfiltering. Compliancy-monitor toont compliance per standaard.", link: "/standaarden", linkTitle: "Standaarden" },
      { id: "2", naam: "Zoeken/filteren op referentiecomponenten", prio: "eis", status: "yes", toelichting: "Referentiecomponentenpagina met zoekfunctie en pakkettellingen. Inkoop-pagina filtert op referentiecomponent.", link: "/referentiecomponenten", linkTitle: "Referentiecomponenten" },
      { id: "3", naam: "Registreren pakketten", prio: "eis", status: "yes", toelichting: "Upload-functie voor leveranciers (CSV/JSON/Excel). Admin kan ook pakketten beheren.", link: "/upload", linkTitle: "Data importeren" },
      { id: "4", naam: "Registreren koppelingen bij pakket", prio: "eis", status: "yes", toelichting: "Koppelingen-systeem met bron/doel, richting, protocol, standaard. Ondersteunt externe pakketten en tussenliggende systemen.", link: "/koppelingen", linkTitle: "Koppelingen" },
      { id: "5", naam: "Beheren content & configuratie", prio: "eis", status: "yes", toelichting: "CMS-systeem (Pagina model) met TipTap editor. Admin kan pagina's aanmaken en bewerken.", link: "/info/handleiding", linkTitle: "CMS-pagina" },
      { id: "6", naam: "Data-migratie", prio: "eis", status: "partial", toelichting: "Import-functionaliteit aanwezig (CSV/JSON/Excel upload), maar specifieke migratie van oude softwarecatalogus-data is niet als aparte feature gebouwd.", link: "/upload", linkTitle: "Upload / import" },
    ],
  },
  {
    title: "",
    subtitle: "Wensen",
    rows: [
      { id: "7", naam: "Registreren dienstverleners", prio: "wens", status: "no", toelichting: "Placeholder-pagina aanwezig. Nog niet geimplementeerd.", link: "/dienstverleners", linkTitle: "Dienstverleners (placeholder)" },
      { id: "8", naam: "Registreren cloud-providers", prio: "wens", status: "no", toelichting: "Placeholder-pagina aanwezig. Nog niet geimplementeerd.", link: "/cloudproviders", linkTitle: "Cloud-providers (placeholder)" },
      { id: "9", naam: "Raadplegen review scores", prio: "wens", status: "no", toelichting: "Geen review/score-systeem voor pakketten." },
    ],
  },
  {
    title: "2. Aanbod en Gebruik Wensen",
    rows: [
      { id: "10", naam: "AI-advisering", prio: "wens", status: "yes", toelichting: "AI-adviseur op gemeente-detailpagina. Analyseert portfolio, standaarden en koppelingen via Claude API.", link: "/gemeenten", linkTitle: "Gemeenten (detail)" },
      { id: "11", naam: "Registreren business rules", prio: "wens", status: "no", toelichting: "Geen business rules engine." },
      { id: "12\u201315", naam: "Adviseren Common Ground, SaaS", prio: "wens", status: "no", toelichting: "Geen automatische advisering op basis van CG/SaaS criteria." },
      { id: "16", naam: "Statistieken gebruik", prio: "wens", status: "yes", toelichting: "Admin statistiekenpagina met platformbrede tellingen, top-10 pakketten/leveranciers en recente activiteit.", link: "/admin/statistieken", linkTitle: "Statistieken" },
    ],
  },
  {
    title: "3. Common Ground Wensen",
    rows: [
      { id: "17\u201320", naam: "Common Ground registratie/filtering", prio: "wens", status: "no", toelichting: "Geen CG-laag concept, geen CG-compliance tracking." },
    ],
  },
  {
    title: "4. Gebruik (Functioneel)",
    subtitle: "Eisen",
    rows: [
      { id: "21", naam: "Beheren applicatielandschap gemeente", prio: "eis", status: "yes", toelichting: "Dashboard met pakketoverzicht, upload-functie, koppelingen-beheer.", link: "/dashboard", linkTitle: "Dashboard" },
      { id: "22", naam: "Vergelijken gebruik (gemeente vs gemeente)", prio: "eis", status: "yes", toelichting: "Vergelijkfunctie met side-by-side tabel, gemeenschappelijke/unieke pakketten.", link: "/gemeenten/vergelijk", linkTitle: "Gemeente vergelijken" },
      { id: "23", naam: "Vergelijken gebruik (gemeente vs aanbod)", prio: "eis", status: "partial", toelichting: "Compliancy-monitor vergelijkt gebruik met standaarden. Geen directe vergelijking gemeente-portfolio vs totaal aanbod.", link: "/compliancy", linkTitle: "Compliancy-monitor" },
      { id: "24", naam: "Exporteren gebruik", prio: "eis", status: "yes", toelichting: "Export-API met CSV, IBD-foto en AMEFF XML formaten.", link: "/dashboard", linkTitle: "Dashboard (export)" },
      { id: "25", naam: "Ontsluiten gebruik", prio: "eis", status: "yes", toelichting: "Gemeente-detailpagina toont portfolio, koppelingen, voortgang. Rolgebaseerde zichtbaarheid.", link: "/gemeenten", linkTitle: "Gemeenten" },
      { id: "26", naam: "Raadplegen gebruik", prio: "eis", status: "yes", toelichting: "Gemeenten-overzicht met zoek/filter, sterren-systeem, paginering.", link: "/gemeenten", linkTitle: "Gemeenten" },
    ],
  },
  {
    title: "",
    subtitle: "Wensen",
    rows: [
      { id: "27", naam: "Registreren maatwerk bij pakket", prio: "wens", status: "yes", toelichting: "GemeentePakket heeft maatwerk-veld. Zichtbaar op gemeente-detailpagina.", link: "/gemeenten", linkTitle: "Gemeenten (detail)" },
      { id: "28", naam: "Registreren verantwoordelijke bij pakket", prio: "wens", status: "yes", toelichting: "GemeentePakket heeft verantwoordelijke-veld. Zichtbaar op gemeente-detailpagina.", link: "/gemeenten", linkTitle: "Gemeenten (detail)" },
      { id: "29", naam: "Registreren licentievorm bij pakket", prio: "wens", status: "yes", toelichting: "GemeentePakket heeft licentievorm-veld. Zichtbaar op gemeente-detailpagina.", link: "/gemeenten", linkTitle: "Gemeenten (detail)" },
      { id: "30", naam: "Registreren gebruikersaantallen", prio: "wens", status: "yes", toelichting: "GemeentePakket heeft aantalGebruikers-veld. Zichtbaar op gemeente-detailpagina.", link: "/gemeenten", linkTitle: "Gemeenten (detail)" },
      { id: "31", naam: "Wijzigingshistorie bijhouden", prio: "wens", status: "yes", toelichting: "AuditLog registreert portfolio-wijzigingen (upload, replace, merge). Historie zichtbaar op gemeente-detailpagina.", link: "/gemeenten", linkTitle: "Gemeenten (detail)" },
    ],
  },
  {
    title: "5. GT Inkoop Wensen",
    rows: [
      { id: "32\u201335", naam: "Contractbeheer, verloopdatums, BIO compliance", prio: "wens", status: "no", toelichting: "Geen contractbeheerfunctionaliteit. Inkoop-pagina bevat alleen referentiecomponent-selectie en GEMMA/GIBIT richtlijnen.", link: "/inkoop", linkTitle: "Inkoopondersteuning" },
      { id: "36", naam: "Exporteren inkoop-gegevens", prio: "wens", status: "no", toelichting: "Geen specifieke inkoop-export." },
    ],
  },
  {
    title: "6. IBD Wensen",
    rows: [
      { id: "37\u201344", naam: "BIO compliance, DPIA verplichting, SLA-criteria", prio: "wens", status: "no", toelichting: "Geen BIO/DPIA/SLA tracking." },
      { id: "45\u201348", naam: "Pen-test resultaten, DigiD-assessments", prio: "wens", status: "no", toelichting: "Geen beveiligingsbeoordelingen-module." },
      { id: "49\u201353", naam: "Verklaringen/overeenkomsten delen en fiatteren", prio: "wens", status: "no", toelichting: "Geen document-sharing/fiatteringsworkflow." },
      { id: "54\u201355", naam: "Register van verwerkingen genereren", prio: "wens", status: "no", toelichting: "Geen AVG register. Vereist ook GEMMA-uitbreiding." },
      { id: "56\u201358", naam: "Kwetsbaarheden notificatie, NIST CVE", prio: "wens", status: "no", toelichting: "Geen vulnerability tracking/notification." },
    ],
  },
  {
    title: "7. Management Informatie",
    rows: [
      { id: "59", naam: "Database-toegang voor rapportages", prio: "eis", status: "partial", toelichting: "Database is PostgreSQL en technisch toegankelijk. Geen specifieke rapportage-interface, maar data is via API beschikbaar.", link: "/api/v1/docs", linkTitle: "API documentatie" },
    ],
  },
  {
    title: "8. Organisatie",
    subtitle: "Eisen",
    rows: [
      { id: "60", naam: "Zelf organisatiegegevens registreren (concept)", prio: "eis", status: "yes", toelichting: "Publieke registratiepagina. Registraties landen als concept (actief=false) en worden door admin beoordeeld.", link: "/auth/registreren", linkTitle: "Registreren" },
      { id: "61", naam: "Fiatteren concept-organisaties", prio: "eis", status: "yes", toelichting: "Admin-goedkeuringsworkflow. Goedkeuren (rollen + organisatie toewijzen) en afwijzen (met reden).", link: "/admin/registraties", linkTitle: "Registraties beheren" },
      { id: "62", naam: "Samenvoegen organisaties (herindeling)", prio: "eis", status: "yes", toelichting: "Admin kan gemeenten samenvoegen. Portfolio, gebruikers, koppelingen en samenwerkingen worden automatisch overgenomen. Preview toont impact.", link: "/admin/gemeenten/samenvoegen", linkTitle: "Gemeenten samenvoegen" },
      { id: "63", naam: "Aanmaken organisaties + accounts", prio: "eis", status: "yes", toelichting: "Admin kan gebruikers aanmaken met gemeente/leverancier-koppeling.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
      { id: "64", naam: "Gebruik-beheerder registreert aanbieder", prio: "eis", status: "partial", toelichting: "Niet direct mogelijk; admin moet leverancier aanmaken. Upload-functie accepteert wel nieuwe namen." },
      { id: "65", naam: "Overzicht aanbiedende organisaties", prio: "eis", status: "yes", toelichting: "Leveranciers-pagina met zoek/filter en paginering.", link: "/leveranciers", linkTitle: "Leveranciers" },
      { id: "66", naam: "Overzicht gebruikende organisaties", prio: "eis", status: "yes", toelichting: "Gemeenten-pagina met zoek/filter, sterren, paginering.", link: "/gemeenten", linkTitle: "Gemeenten", peter: "Peter: gemeenten zien elkaars landschappen; leveranciers alleen hun eigen pakketten." },
      { id: "67", naam: "Contactpersonen per pakket", prio: "eis", status: "yes", toelichting: "PakketContact model: meerdere contactpersonen per pakket met naam, e-mail, telefoon en rol.", link: "/pakketten", linkTitle: "Pakketten (detail)" },
      { id: "68", naam: "Aanvullende organisatie-info, links", prio: "eis", status: "yes", toelichting: "Leverancier heeft diensten-omschrijving, supportportaal, documentatie- en kennisbank-URL's.", link: "/leveranciers", linkTitle: "Leveranciers (detail)" },
    ],
  },
  {
    title: "9. Referentiearchitectuur",
    rows: [
      { id: "69", naam: "Exporteren ArchiMate (AMEFF)", prio: "eis", status: "yes", toelichting: "AMEFF XML export beschikbaar via /api/export?format=ameff.", link: "/dashboard", linkTitle: "Dashboard (export)" },
      { id: "70", naam: "Importeren ArchiMate", prio: "eis", status: "yes", toelichting: "GEMMA sync via admin panel. Import van ArchiMate model.", link: "/admin", linkTitle: "Beheer (GEMMA sync)" },
      { id: "71", naam: "Ontsluiten architectuurconcepten", prio: "eis", status: "yes", toelichting: "Referentiecomponenten, standaarden, applicatiefuncties. GEMMA Views met domein/volgorde.", link: "/referentiecomponenten", linkTitle: "Referentiecomponenten" },
      { id: "72", naam: "GEMMA-concepten uitleggen (Glossary)", prio: "eis", status: "yes", toelichting: "Begrippen-module met NL-SBB/NORA termen. GlossaryHighlighter markeert termen automatisch.", link: "/begrippen", linkTitle: "Begrippenkader" },
      { id: "73", naam: "Doorverwijzen naar GEMMA online", prio: "eis", status: "yes", toelichting: "Deep-links naar GEMMA Online vanuit referentiecomponenten (via GUID). Begrippen hebben externe URI's.", link: "/referentiecomponenten", linkTitle: "Referentiecomponenten" },
      { id: "74", naam: "Plotten op GEMMA views (SVG download)", prio: "eis", status: "yes", toelichting: "Kaart-functionaliteit met GEMMA Views, interactief.", link: "/kaart", linkTitle: "Kaart / GEMMA views" },
    ],
  },
  {
    title: "10. Toegangsbeveiliging",
    subtitle: "Eisen",
    rows: [
      { id: "75", naam: "Collega's toegang geven (beheerder)", prio: "eis", status: "partial", toelichting: "Admin kan gebruikers aanmaken. Organisatie-beheerders kunnen dit niet zelf.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
      { id: "76", naam: "Meerdere gebruikersrollen met rechten", prio: "eis", status: "yes", toelichting: "10 rollen gedefinieerd (ADMIN, LEVERANCIER, GEMEENTE_BEHEERDER, etc.). Rolgebaseerde toegangscontrole.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
      { id: "77", naam: "Eerste account aanmaken/fiatteren", prio: "eis", status: "yes", toelichting: "Admin maakt eerste account aan voor organisatie.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
      { id: "78", naam: "Gebruiker gekoppeld aan organisatie", prio: "eis", status: "yes", toelichting: "User model heeft gemeenteId en leverancierId. Ongekoppelde gebruiker = bezoeker.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
      { id: "79", naam: "Nieuwe gebruikers aanmelden bij organisatie", prio: "eis", status: "no", toelichting: "Geen zelf-aanmeldflow met fiatteringsproces." },
      { id: "80", naam: "Multi-organisatie toegang", prio: "eis", status: "no", toelichting: "User heeft een gemeenteId. Kan niet schakelen tussen meerdere organisaties." },
      { id: "81", naam: "Leveranciers zien geen gemeente-landschappen", prio: "eis", status: "yes", toelichting: "filterGemeentePakketten() filtert leveranciers tot alleen hun eigen pakketten.", link: "/gemeenten", linkTitle: "Gemeenten", peter: "Peter bevestigt: leveranciers zien alleen hun eigen aanbod en gebruik." },
    ],
  },
  {
    title: "",
    subtitle: "Wensen",
    rows: [
      { id: "82", naam: "Impersonatie (functioneel beheerder)", prio: "wens", status: "yes", toelichting: "Admin kan als andere gebruiker inloggen via gebruikersbeheer. Amber banner toont impersonatie-status.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer" },
    ],
  },
  {
    title: "11. API's (Functioneel)",
    rows: [
      { id: "100", naam: "Raadplegen aanbod API", prio: "eis", status: "yes", toelichting: "Publieke API v1 met leveranciers, pakketten, standaarden, begrippen. OpenAPI documentatie.", link: "/api/v1/docs", linkTitle: "API documentatie" },
      { id: "101", naam: "Raadplegen gebruik API", prio: "wens", status: "yes", toelichting: "API v1 endpoints voor gemeenten en hun pakketten. Beveiligd met rolcontrole.", link: "/api/v1/docs", linkTitle: "API documentatie" },
      { id: "102", naam: "Registreren aanbod API", prio: "could", status: "no", toelichting: "Geen write-API voor aanbod. Alleen upload via UI." },
      { id: "103", naam: "Registreren gebruik API", prio: "could", status: "no", toelichting: "Geen write-API voor gebruik. Alleen upload via UI." },
    ],
  },
  {
    title: "12. Non-functionele Eisen",
    rows: [
      { id: "83", naam: "API standaarden (OpenAPI, REST)", prio: "eis", status: "yes", toelichting: "OpenAPI spec, REST endpoints, Swagger UI.", link: "/api/v1/docs", linkTitle: "Swagger UI" },
      { id: "84", naam: "Betrouwbaarheid / beheerorganisatie", prio: "wens", status: "nvt", toelichting: "Organisatorische eis, niet technisch." },
      { id: "85", naam: "Gebruikersvriendelijkheid", prio: "eis", status: "yes", toelichting: "Intuitive UI, formuliervalidatie, foutmeldingen. Mobiel responsive.", link: "/", linkTitle: "Homepage" },
      { id: "86", naam: "Digitoegankelijkheid", prio: "eis", status: "yes", toelichting: "Skip-link, landmark roles, aria-labels, role=\"search\". Semantic HTML, dark mode met contrast.", link: "/", linkTitle: "Homepage" },
      { id: "87", naam: "Logging activiteiten", prio: "wens", status: "yes", toelichting: "AuditLog model met registratie van logins, merges en admin-acties.", link: "/admin/auditlog", linkTitle: "Audit log" },
      { id: "88", naam: "Internetstandaarden (nl.internet.nl 100%)", prio: "eis", status: "partial", toelichting: "Afhankelijk van hosting-configuratie. Applicatie gebruikt HTTPS." },
      { id: "89", naam: "2FA / RBAC", prio: "eis", status: "partial", toelichting: "RBAC is geimplementeerd (10 rollen). 2FA/TOTP is NIET geimplementeerd. Alleen email+wachtwoord.", link: "/admin/gebruikers", linkTitle: "Gebruikersbeheer (rollen)" },
      { id: "90", naam: "Informatiemodel voorzieningencatalogus", prio: "eis", status: "partial", toelichting: "Prisma schema volgt conceptueel het informatiemodel maar wijkt mogelijk af in details.", link: "/admin/datamodel", linkTitle: "Datamodel (MIM)", peter: "Peter: naam wordt \"Voorzieningencatalogus\"." },
      { id: "91", naam: "E-mail standaarden (DKIM/DMARC)", prio: "eis", status: "yes", toelichting: "E-mailfunctionaliteit via Resend (registratie-notificaties, goedkeuring/afwijzing, wachtwoord-reset).", link: "/auth/wachtwoord-vergeten", linkTitle: "Wachtwoord vergeten" },
      { id: "92", naam: "Open source (EUPL licentie)", prio: "eis", status: "yes", toelichting: "Broncode in git repository met EUPL v1.2 licentie." },
      { id: "93", naam: "Modulariteit", prio: "eis", status: "yes", toelichting: "Next.js App Router structuur, gescheiden API/UI, Prisma als data-laag.", link: "/admin/datamodel", linkTitle: "Datamodel" },
      { id: "94", naam: "Webstatistieken (Matomo)", prio: "eis", status: "yes", toelichting: "Matomo-integratie ingebouwd. Tracking wordt automatisch geladen wanneer MATOMO_URL en MATOMO_SITE_ID zijn geconfigureerd." },
      { id: "95", naam: "Toekomstvaste techniek", prio: "eis", status: "yes", toelichting: "Next.js 16, TypeScript, React, Tailwind CSS, PostgreSQL \u2014 mainstream stack.", link: "/admin/prompt", linkTitle: "Regeneratie-prompt" },
      { id: "96", naam: "Open source componenten", prio: "wens", status: "yes", toelichting: "Volledig gebouwd op open source: Next.js, Prisma, PostgreSQL, Tailwind." },
      { id: "97", naam: "Containerisatie / CI/CD", prio: "eis", status: "yes", toelichting: "Dockerfile met multi-stage build (Node 22 Alpine). Standalone output geconfigureerd." },
      { id: "98", naam: "OTAP omgevingen", prio: "eis", status: "no", toelichting: "Geen meervoudige omgevingen geconfigureerd." },
      { id: "99", naam: "Foutmeldingen", prio: "eis", status: "yes", toelichting: "Error handling, formuliervalidatie, lege-staat berichten.", link: "/", linkTitle: "Homepage" },
      { id: "100", naam: "Testen", prio: "eis", status: "no", toelichting: "Geen geautomatiseerde tests (unit/integration/e2e)." },
    ],
  },
];

/* ── Render helpers ── */
function PveTable({ rows, header }: { rows: Row[]; header?: string }) {
  return (
    <table className="detail">
      <thead>
        <tr>
          <th>ID</th>
          <th>{header || "Functionaliteit"}</th>
          <th>Prio</th>
          <th>Status</th>
          <th>Toelichting</th>
          <th aria-label="Demo" title="Link naar demo"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const [label, cls] = prioLabel[r.prio];
          const icon = r.status === "nvt"
            ? <span className="tag tag-nvt">n.v.t.</span>
            : statusIcon[r.status];
          return (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.naam}</td>
              <td><span className={`tag ${cls}`}>{label}</span></td>
              <td>{icon}</td>
              <td className="toelichting">
                {r.toelichting}
                {r.peter && <span className="peter">{"\uD83D\uDCCC"} {r.peter}</span>}
              </td>
              <td>{r.link ? <DemoLink href={r.link} title={r.linkTitle} /> : null}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function PveDetailTables() {
  return (
    <>
      {sections.map((s, i) => (
        <div key={i}>
          {s.title && <h2 className="section-title">{s.title}</h2>}
          {s.subtitle && <h3 className="section-subtitle">{s.subtitle}</h3>}
          <PveTable
            rows={s.rows}
            header={s.title === "12. Non-functionele Eisen" ? "Categorie" : undefined}
          />
        </div>
      ))}
    </>
  );
}
