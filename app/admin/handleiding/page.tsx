import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Technische Handleiding — Beheer",
  description: "Technische documentatie voor beheerders van de Voorzieningencatalogus",
};

const tocItems = [
  { id: "architectuur", label: "Architectuur" },
  { id: "datamodel", label: "Datamodel" },
  { id: "gebruikersbeheer", label: "Gebruikersbeheer" },
  { id: "gemma-sync", label: "GEMMA Synchronisatie" },
  { id: "begrippen", label: "Begrippen (SKOSMOS)" },
  { id: "data-import", label: "Data importeren" },
  { id: "linked-data", label: "Linked Data (RDF)" },
  { id: "rest-api", label: "REST API" },
  { id: "deployment", label: "Deployment" },
  { id: "database", label: "Database" },
  { id: "monitoring", label: "Monitoring & Logging" },
  { id: "beveiliging", label: "Beveiliging" },
  { id: "performance", label: "Performance" },
  { id: "e2e-tests", label: "E2E Tests" },
  { id: "faq", label: "Veelgestelde vragen" },
];

function Section({
  id,
  title,
  children,
  link,
  linkLabel,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <section id={id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-5 scroll-mt-24">
      <h2 className="text-lg font-semibold text-[#1a6ca8] mb-2">{title}</h2>
      <div className="text-sm text-gray-700 dark:text-slate-300 space-y-2">{children}</div>
      {link && (
        <Link href={link} className="inline-block mt-3 text-sm text-[#1a6ca8] hover:underline font-medium">
          {linkLabel || "Bekijken"} &rarr;
        </Link>
      )}
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-xs font-mono">
      {children}
    </code>
  );
}

export default async function HandleidingPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="max-w-4xl">
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Technische handleiding", href: "/admin/handleiding" },
      ]} />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Technische Handleiding</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Technische documentatie voor beheerders en ontwikkelaars van de Voorzieningencatalogus.
      </p>

      {/* Table of contents */}
      <nav className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-5 mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Inhoud</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          {tocItems.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-sm text-[#1a6ca8] hover:underline">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6">
        <Section id="architectuur" title="Architectuur">
          <p>
            De Voorzieningencatalogus is gebouwd met <strong>Next.js 16</strong> (App Router met Turbopack),
            <strong> TypeScript</strong> (strict mode), <strong>Prisma ORM</strong> met PostgreSQL (Neon),
            <strong> Tailwind CSS v4</strong> en <strong>NextAuth.js</strong> voor authenticatie.
          </p>
          <p>
            De architectuur volgt een gelaagde opzet: Pages &rarr; Services (<Code>lib/services/</Code>) &rarr; Prisma.
            Server Components worden standaard gebruikt; Client Components alleen waar interactiviteit nodig is.
          </p>
          <p>
            De codebase is geëxtraheerd naar een <strong>Generieke Voorzieningencatalogus (GVC)</strong> library
            die hergebruik voor andere domeinen (waterschappen, provincies) mogelijk maakt via tenant-configuratie.
          </p>

          <h4 className="text-sm font-bold text-gray-700 mt-4 mb-2">Technische componenten</h4>
          <table className="w-full text-sm border-collapse border border-gray-200 mb-4">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="py-2 px-3 text-left font-semibold text-gray-700 border-b border-gray-200 w-1/4">Component</th>
                <th scope="col" className="py-2 px-3 text-left font-semibold text-gray-700 border-b border-gray-200 w-1/3">Wat het is</th>
                <th scope="col" className="py-2 px-3 text-left font-semibold text-gray-700 border-b border-gray-200">Reden</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Next.js 16", "React framework met SSR", "Eén framework voor frontend + backend + API routes"],
                ["TypeScript", "JavaScript met type-checking", "Vangt fouten op vóór runtime"],
                ["React 19", "UI library", "Industrie-standaard, grootste ecosysteem"],
                ["Tailwind CSS v4", "Utility-first CSS", "Snelle styling, consistente design tokens"],
                ["Prisma 7", "Database ORM", "Type-safe queries, schema-as-code"],
                ["PostgreSQL", "Relationele database", "Robuust, open source, fuzzy search (pg_trgm)"],
                ["Neon", "Hosted PostgreSQL (serverless)", "Gratis tier, serverless, werkt met Vercel"],
                ["NextAuth v5", "Authenticatie", "Standaard auth voor Next.js, sessions + rollen"],
                ["Vercel", "Hosting platform", "Zero-config deploy, CDN, serverless functions"],
                ["TipTap", "Rich text editor", "Open source WYSIWYG voor CMS-pagina's"],
                ["Leaflet", "Kaart library", "Open source, geen API key nodig"],
                ["Resend", "E-mail service", "Transactionele e-mails (registratie, wachtwoord reset)"],
                ["Claude API", "AI (Anthropic)", "AI-adviseur: portfolio-analyse en advies"],
                ["Playwright", "E2E test framework", "Browser-automatisatie, betrouwbaarder dan Selenium"],
                ["N3.js", "RDF serialisatie", "Linked Data (JSON-LD, Turtle, RDF/XML)"],
                ["OpenAI TTS", "Spraaksynthese", "HD Nederlandse stemmen voor demo (MP3)"],
                ["DOMPurify", "HTML sanitizer", "Voorkomt XSS bij AI-output"],
                ["pg_trgm", "PostgreSQL extensie", "Fuzzy zoeken met typefouttolerantie"],
              ].map(([comp, wat, reden]) => (
                <tr key={comp} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-1.5 px-3 font-medium text-gray-800">{comp}</td>
                  <td className="py-1.5 px-3 text-gray-600">{wat}</td>
                  <td className="py-1.5 px-3 text-gray-500">{reden}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section id="datamodel" title="Datamodel" link="/admin/datamodel" linkLabel="Bekijk Datamodel (MIM)">
          <p>
            Het datamodel bevat 30 objecttypen verdeeld over de domeinen Software (Pakket, Pakketversie, Leverancier,
            PakketContact, ExternPakket, Testrapport, Addendum), Gemeenten (Gemeente, GemeentePakket, Koppeling, Samenwerking),
            GEMMA (Referentiecomponent, Standaard, Standaardversie, Applicatiefunctie, GemmaView),
            Koppeltabellen (PvReferentiecomponent, PvStandaard, PvApplicatiefunctie, PvTechnologie) en
            Systeem (User, PasswordResetToken, Pagina, Begrip, AuditLog, AppSetting, Notificatie, Favoriet).
          </p>
          <p>
            Het model is conform MIM 1.2 (Metamodel Informatiemodellering) gedocumenteerd op de datamodel-pagina.
          </p>
        </Section>

        <Section id="gebruikersbeheer" title="Gebruikersbeheer" link="/admin/gebruikers" linkLabel="Ga naar Gebruikersbeheer">
          <p>
            Er zijn vier rollen: <strong>ADMIN</strong> (volledige toegang), <strong>GEMEENTE</strong> (eigen portfolio
            beheren), <strong>LEVERANCIER</strong> (eigen pakketten en addenda beheren) en <strong>PUBLIEK</strong>
            (alleen-lezen voor openbare gegevens).
          </p>
          <p>
            Nieuwe accounts worden aangemaakt via het registratieformulier en moeten door een ADMIN worden goedgekeurd.
            Beheerders kunnen via het admin panel accounts activeren, blokkeren en rollen wijzigen.
          </p>
        </Section>

        <Section id="gemma-sync" title="GEMMA Synchronisatie">
          <p>
            De GEMMA-synchronisatie haalt referentiecomponenten, applicatiefuncties en standaarden op uit GEMMA Online
            (de landelijke referentiearchitectuur). De sync kan handmatig worden gestart via het admin panel onder
            &quot;Data &amp; Synchronisatie&quot;.
          </p>
          <p>
            Tijdens synchronisatie worden nieuwe objecten aangemaakt, bestaande bijgewerkt en verwijderde objecten
            gemarkeerd. Elke synchronisatie wordt gelogd in de audit log.
          </p>
        </Section>

        <Section id="begrippen" title="Begrippen (SKOSMOS)">
          <p>
            Begrippen worden live opgehaald via de SKOSMOS API en gecached (minimaal 1 uur). De vocabulaires zijn
            configureerbaar via de environment variable <Code>SKOSMOS_VOCABULARIES</Code> of via de AppSetting-tabel.
          </p>
          <p>
            De GlossaryProvider-component haalt begrippen op bij het laden van de pagina en de GlossaryHighlighter
            markeert overeenkomende termen in de tekst met een tooltip.
          </p>
        </Section>

        <Section id="data-import" title="Data importeren" link="/upload" linkLabel="Ga naar Data importeren">
          <p>
            Via de uploadpagina kunnen CSV- en Excel-bestanden worden geimporteerd. Er zijn templates beschikbaar
            voor pakketten, leveranciers en gemeenteportfolio&apos;s. De import valideert de data en toont een preview
            voordat de wijzigingen worden doorgevoerd.
          </p>
          <p>
            Voor de initiële migratie vanuit Drupal is er een apart migratiemechanisme dat 6 bronbestanden verwerkt.
            Zie de migratiepagina in het admin panel voor de mapping.
          </p>
        </Section>

        <Section id="linked-data" title="Linked Data (RDF)" link="/admin/linked-data" linkLabel="Bekijk Linked Data">
          <p>
            De catalogus publiceert data als Linked Data in drie formaten: JSON-LD, Turtle en RDF/XML. Content
            negotiation via de <Code>Accept</Code> header of <Code>?format=</Code> parameter wordt ondersteund.
          </p>
          <p>
            Er is een DCAT-catalogus beschikbaar die de datasets beschrijft conform de Nederlandse standaard voor
            open data. Persoonsgegevens en contactinformatie worden niet opgenomen in de publieke RDF-export.
          </p>
        </Section>

        <Section id="rest-api" title="REST API">
          <p>
            De REST API is beschikbaar onder <Code>/api/v1/</Code> en biedt endpoints voor pakketten, leveranciers,
            gemeenten, standaarden en referentiecomponenten. De OpenAPI-documentatie is bereikbaar via het admin panel.
          </p>
          <p>
            Rate limiting is geconfigureerd op 100 requests per minuut voor publieke endpoints, 10/min voor
            authenticatie en 30/min voor admin-endpoints. Authenticatie gaat via session cookies of API keys.
          </p>
        </Section>

        <Section id="deployment" title="Deployment">
          <p>
            De applicatie wordt gehost op Vercel. Deploy via <Code>npx vercel --prod --yes</Code> of via de
            Deploy-knop in het admin panel (alleen in development). De volgende environment variables zijn vereist:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><Code>DATABASE_URL</Code> — Neon PostgreSQL connection string</li>
            <li><Code>NEXTAUTH_SECRET</Code> — Random secret voor session-encryptie</li>
            <li><Code>NEXTAUTH_URL</Code> — Publieke URL van de applicatie</li>
            <li><Code>ANTHROPIC_API_KEY</Code> — API key voor de Claude AI-adviseur</li>
            <li><Code>BASIC_AUTH_USER</Code> / <Code>BASIC_AUTH_PASS</Code> — Optioneel voor Vercel preview-omgevingen</li>
            <li><Code>SKOSMOS_VOCABULARIES</Code> — Comma-separated lijst van SKOSMOS vocabulaires</li>
            <li><Code>MATOMO_URL</Code> / <Code>MATOMO_SITE_ID</Code> — Optioneel voor analytics</li>
          </ul>
        </Section>

        <Section id="database" title="Database">
          <p>
            De database is een PostgreSQL-instantie op Neon (serverless). Schema-migraties worden beheerd met
            Prisma Migrate. In productie: <Code>npx prisma migrate deploy</Code>. In development:
            <Code> npx prisma db push</Code>.
          </p>
          <p>
            Indexes zijn aangemaakt op veelgebruikte WHERE- en ORDER BY-kolommen (naam, slug, gemeenteId, leverancierId).
            Neon biedt automatische backups en point-in-time recovery.
          </p>
        </Section>

        <Section id="monitoring" title="Monitoring & Logging" link="/admin/auditlog" linkLabel="Bekijk Audit Log">
          <p>
            Alle mutaties worden gelogd in de AuditLog-tabel met actie, entiteit, details, gebruiker en tijdstip.
            De audit log is doorzoekbaar in het admin panel.
          </p>
          <p>
            Vercel biedt ingebouwde analytics en logging. Fouten worden gelogd via <Code>console.error</Code> en
            zijn zichtbaar in de Vercel-dashboard onder Functions logs.
          </p>
        </Section>

        <Section id="beveiliging" title="Beveiliging">
          <p>
            Authenticatie verloopt via NextAuth.js met credentials-provider (bcrypt-gehashte wachtwoorden).
            Elke beschermde pagina en API-route controleert <Code>getSessionUser()</Code> en de gebruikersrol.
          </p>
          <p>
            Rate limiting is actief op alle publieke API-endpoints. Voor Vercel preview-deployments is optioneel
            Basic Auth beschikbaar. Gevoelige data (contactgegevens gemeenten) is alleen zichtbaar voor
            geauthenticeerde gebruikers. Anonimisatie voor demo-doeleinden is beschikbaar via het admin panel.
          </p>
        </Section>

        <Section id="performance" title="Performance">
          <p>
            Performance-optimalisaties omvatten: database-indexes op veelgebruikte kolommen, <Code>Promise.all</Code> voor
            parallelle queries, <Code>select</Code>-clausules om alleen benodigde velden op te halen, lazy loading
            van zware componenten via <Code>next/dynamic</Code>, en caching van externe API-calls.
          </p>
          <p>
            Afbeeldingen worden via de Next.js Image-component geladen met lazy loading en WebP-formaat waar mogelijk.
            Elke lijstpagina is gepagineerd (25 items per pagina).
          </p>
        </Section>

        <Section id="e2e-tests" title="E2E Tests">
          <p>
            End-to-end tests draaien met Playwright. Er zijn 26 tests die de belangrijkste gebruikersflows dekken.
            Start de tests met <Code>npx playwright test</Code> of met de Playwright VS Code-extensie.
          </p>
          <p>
            De Playwright-configuratie staat in <Code>playwright.config.ts</Code> (uitgesloten van de TypeScript-compilatie).
            Tests draaien tegen een lokale development-server.
          </p>
        </Section>

        <Section id="faq" title="Veelgestelde vragen">
          <p><strong>GEMMA-synchronisatie faalt:</strong> Controleer of GEMMA Online bereikbaar is. De sync logt
            fouten in de browser-console en de audit log. Probeer het opnieuw na enkele minuten.</p>
          <p><strong>Begrippen laden niet:</strong> Controleer of de SKOSMOS API bereikbaar is en of
            <Code> SKOSMOS_VOCABULARIES</Code> correct is geconfigureerd. Begrippen worden gecached; wacht tot de
            cache verloopt of herstart de applicatie.</p>
          <p><strong>Deploy mislukt:</strong> Controleer of alle environment variables correct zijn ingesteld in
            Vercel. Let op: geen newlines of extra whitespace in waarden. Controleer de build logs voor TypeScript-fouten.</p>
          <p><strong>Database-migratie mislukt:</strong> Gebruik <Code>npx prisma migrate status</Code> om de
            huidige status te bekijken. Bij conflicten: <Code>npx prisma migrate resolve</Code>.</p>
          <p><strong>Gebruiker kan niet inloggen:</strong> Controleer of het account is goedgekeurd (status ACTIVE)
            in het gebruikersbeheer. Controleer of <Code>NEXTAUTH_SECRET</Code> en <Code>NEXTAUTH_URL</Code> correct zijn.</p>
        </Section>
      </div>
    </div>
  );
}
