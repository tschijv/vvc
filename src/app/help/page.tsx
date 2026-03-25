import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Help — Voorzieningencatalogus",
  description: "Gebruikershandleiding voor de VNG Voorzieningencatalogus",
};

const tocItems = [
  { id: "introductie", label: "Wat is de Voorzieningencatalogus?" },
  { id: "navigatie", label: "Navigatie" },
  { id: "pakketten", label: "Pakketten" },
  { id: "pakketversies", label: "Pakketversies" },
  { id: "leveranciers", label: "Leveranciers" },
  { id: "addenda", label: "Addenda" },
  { id: "gemeenten", label: "Gemeenten" },
  { id: "dashboard", label: "Dashboard" },
  { id: "vergelijken", label: "Gemeenten vergelijken" },
  { id: "vergelijkbaar", label: "Vergelijkbare gemeenten" },
  { id: "standaarden", label: "Standaarden & Referentiecomponenten" },
  { id: "compliancy", label: "Compliancy Monitor" },
  { id: "inkoop", label: "Inkoopondersteuning" },
  { id: "begrippen", label: "Begrippen" },
  { id: "zoeken", label: "Zoeken" },
  { id: "kaart", label: "Kaart" },
  { id: "ai-adviseur", label: "AI-adviseur" },
  { id: "favorieten", label: "Favorieten" },
  { id: "notificaties", label: "Notificaties" },
  { id: "dark-mode", label: "Dark mode" },
  { id: "rss", label: "RSS Feed" },
  { id: "afdrukken", label: "Afdrukken" },
  { id: "keyboard", label: "Keyboard shortcuts" },
  { id: "qr-codes", label: "QR-codes" },
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
          {linkLabel || "Ga naar pagina"} &rarr;
        </Link>
      )}
    </section>
  );
}

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: "Help", href: "/help" }]} />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Handleiding</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Functionele handleiding voor gebruikers van de Voorzieningencatalogus.
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
        <Section id="introductie" title="Wat is de Voorzieningencatalogus?">
          <p>
            De VNG Voorzieningencatalogus is het centrale register waarin gemeenten, leveranciers en samenwerkingsverbanden
            hun softwarepakketten, standaarden en koppelingen bijhouden. Het platform biedt inzicht in welke software er
            binnen de gemeentelijke markt beschikbaar is en helpt bij inkoop- en compliancy-beslissingen.
          </p>
          <p>
            De catalogus is ontwikkeld door VNG Realisatie en wordt gebruikt door honderden gemeenten en tientallen leveranciers
            in Nederland.
          </p>
        </Section>

        <Section id="navigatie" title="Navigatie">
          <p>
            Op de homepage vindt u drie rijen tegels. De <strong className="text-[#e35b10]">oranje tegels</strong> zijn
            functionaliteiten (Dashboard, Inkoopondersteuning, Compliancy Monitor). De <strong className="text-[#1a6ca8]">blauwe tegels</strong> geven
            toegang tot data (Pakketten, Leveranciers, Gemeenten, etc.). De <strong className="text-green-600">groene tegels</strong> verwijzen
            naar dienstverleners en cloudproviders.
          </p>
          <p>
            Gebruik de zoekbalk op de homepage om snel te zoeken in alle categorieën. Het hoofdmenu bovenin bevat
            dropdowns met links naar alle onderdelen van de catalogus.
          </p>
        </Section>

        <Section id="pakketten" title="Pakketten" link="/pakketten" linkLabel="Ga naar Pakketten">
          <p>
            Op de pakkettenlijst kunt u zoeken op naam, filteren op leverancier, referentiecomponent of status, en de
            resultaten exporteren als CSV-bestand. Klik op een pakket voor de detailpagina met versies, standaarden en
            de gemeenten die het pakket gebruiken.
          </p>
          <p>
            Elk pakket bevat informatie over de leverancier, beschikbare versies en aan welke referentiecomponenten
            het voldoet.
          </p>
        </Section>

        <Section id="pakketversies" title="Pakketversies" link="/pakketversies" linkLabel="Ga naar Pakketversies">
          <p>
            Het pakketversie-overzicht toont alle versies van alle pakketten. U kunt filteren op status
            (In gebruik, In distributie, Uit distributie) om te zien welke versies nog actief worden ondersteund.
          </p>
          <p>
            Elke versie is gekoppeld aan een pakket en kan een eigen set standaarden en compliancy-informatie bevatten.
          </p>
        </Section>

        <Section id="leveranciers" title="Leveranciers" link="/leveranciers" linkLabel="Ga naar Leveranciers">
          <p>
            Het leveranciersoverzicht toont alle softwareleveranciers die deelnemen aan de catalogus. Op de detailpagina
            van een leverancier vindt u de pakketten die zij aanbieden en eventuele addenda.
          </p>
          <p>
            Leveranciers kunnen zelf inloggen om hun pakketten en addenda bij te werken.
          </p>
        </Section>

        <Section id="addenda" title="Addenda" link="/addenda" linkLabel="Ga naar Addenda">
          <p>
            Addenda zijn aanvullende afspraken tussen een leverancier en VNG Realisatie over het voldoen aan standaarden.
            U kunt filteren op leverancier of status. Leveranciers met een inlog kunnen hun addenda bewerken.
          </p>
          <p>
            Op de detailpagina van een addendum ziet u de gekoppelde pakketten en de status van de ondertekening.
          </p>
        </Section>

        <Section id="gemeenten" title="Gemeenten" link="/gemeenten" linkLabel="Ga naar Gemeenten">
          <p>
            Het gemeentenoverzicht toont alle deelnemende gemeenten. U kunt zoeken op naam en filteren op provincie.
            Elke gemeente heeft een sterren-score (0-5 sterren) die de voortgang aangeeft in het bijhouden van hun
            softwareportfolio.
          </p>
          <p>
            De score is gebaseerd op het percentage ingevulde gegevens: 0% = 0 sterren, 1-20% = 1 ster, enzovoort
            tot 81-100% = 5 sterren. Klik op een gemeente voor het volledige dashboard.
          </p>
        </Section>

        <Section id="dashboard" title="Dashboard" link="/dashboard" linkLabel="Ga naar Dashboard">
          <p>
            Het gemeente-dashboard bevat 6 KPI-kaarten: Compliant pakketversies, Einde ondersteuning leverancier,
            SaaS alternatieven, Inkoopondersteuning, Pakketten met meer mogelijkheden, en Referentiecomponenten
            met meerdere pakketten. Elke kaart toont een aantal en een directe link naar de relevante gegevens.
          </p>
          <p>
            Onder de KPI-kaarten vindt u tabbladen voor Pakketten (het softwareportfolio), Koppelingen,
            Suggesties (nieuwe pakketten en versies) en de AI-adviseur.
          </p>
        </Section>

        <Section id="vergelijken" title="Gemeenten vergelijken" link="/gemeenten/vergelijk" linkLabel="Ga naar Vergelijken">
          <p>
            Op de vergelijkpagina kunt u tot 4 gemeenten naast elkaar zetten om hun softwareportfolio te vergelijken.
            Selecteer gemeenten via de dropdowns en bekijk welke pakketten ze gemeen hebben en welke uniek zijn.
          </p>
          <p>
            De Jaccard-similariteit wordt berekend als het aantal gedeelde pakketten gedeeld door het totaal aantal
            unieke pakketten van beide gemeenten. Een score van 1.0 betekent een identiek portfolio.
          </p>
        </Section>

        <Section id="vergelijkbaar" title="Vergelijkbare gemeenten">
          <p>
            Op het dashboard van elke gemeente wordt automatisch een top-5 van vergelijkbare gemeenten getoond.
            De overlap wordt berekend op basis van de Jaccard-similariteit van het pakketportfolio.
          </p>
          <p>
            Klik op &quot;Alle vergelijkbare gemeenten&quot; voor een uitgebreid overzicht met tot 500 gemeenten,
            sorteerbaar op overlap-percentage.
          </p>
        </Section>

        <Section id="standaarden" title="Standaarden & Referentiecomponenten" link="/standaarden" linkLabel="Ga naar Standaarden">
          <p>
            Standaarden beschrijven de technische afspraken waaraan software moet voldoen (bijv. StUF, ZDS, ZGW).
            Referentiecomponenten zijn de logische bouwblokken van de gemeentelijke informatievoorziening
            (bijv. Zaakregistratiecomponent, Documentregistratiecomponent).
          </p>
          <p>
            Elk pakket is gekoppeld aan een of meer referentiecomponenten en elke pakketversie kan aangeven welke
            standaardversies worden ondersteund.
          </p>
        </Section>

        <Section id="compliancy" title="Compliancy Monitor" link="/compliancy" linkLabel="Ga naar Compliancy Monitor">
          <p>
            De Compliancy Monitor toont een matrix van standaardversies en pakketversies. Per standaard ziet u welke
            softwarepakketten compliant zijn, zodat gemeenten weloverwogen keuzes kunnen maken.
          </p>
          <p>
            De monitor wordt bijgehouden op basis van de gegevens die leveranciers invoeren bij hun pakketversies.
          </p>
        </Section>

        <Section id="inkoop" title="Inkoopondersteuning" link="/inkoop" linkLabel="Ga naar Inkoopondersteuning">
          <p>
            De inkoopondersteuning helpt gemeenten bij het selecteren van software. Selecteer een of meer
            referentiecomponenten om te zien welke pakketten beschikbaar zijn en aan welke standaarden ze voldoen.
          </p>
          <p>
            Dit overzicht kan worden gebruikt als input voor een programma van eisen bij een aanbesteding.
          </p>
        </Section>

        <Section id="begrippen" title="Begrippen">
          <p>
            Begrippen in de catalogus worden live opgehaald uit SKOSMOS, het begrippenkader van VNG Realisatie.
            Wanneer u met de muis over een gemarkeerd woord beweegt, verschijnt een tooltip met de definitie.
          </p>
          <p>
            Het begrippenkader bevat definities van termen uit de gemeentelijke informatievoorziening. De begrippen
            worden gecached voor snelle weergave.
          </p>
        </Section>

        <Section id="zoeken" title="Zoeken" link="/zoeken" linkLabel="Ga naar Zoeken">
          <p>
            De zoekfunctie doorzoekt 6 contenttypen: pakketten, pakketversies, leveranciers, gemeenten, standaarden
            en referentiecomponenten. De zoekmachine gebruikt fuzzy matching, zodat kleine typefouten geen probleem zijn.
          </p>
          <p>
            Gebruik filterchips om de resultaten te beperken tot een specifiek type. De zoekbalk is ook bereikbaar
            via de keyboard shortcut &apos;/&apos;.
          </p>
        </Section>

        <Section id="kaart" title="Kaart" link="/kaart/nederland" linkLabel="Ga naar Kaart">
          <p>
            De interactieve kaart toont alle deelnemende gemeenten op een kaart van Nederland. Klik op een gemeente
            om naar de detailpagina te navigeren. De kleurcodering geeft de voortgang aan.
          </p>
        </Section>

        <Section id="ai-adviseur" title="AI-adviseur">
          <p>
            De AI-adviseur is beschikbaar op het dashboard van elke gemeente en kan vragen beantwoorden over het
            softwareportfolio. Er worden voorgestelde vragen getoond, maar u kunt ook eigen vragen stellen.
          </p>
          <p>
            De adviseur heeft toegang tot de gegevens van de geselecteerde gemeente en kan advies geven over
            compliancy, alternatieven en optimalisatie van het applicatielandschap.
          </p>
        </Section>

        <Section id="favorieten" title="Favorieten" link="/favorieten" linkLabel="Ga naar Favorieten">
          <p>
            Klik op het hart-icoon op een detailpagina om een pakket, leverancier of gemeente aan uw favorieten
            toe te voegen. Uw favorieten worden lokaal opgeslagen en zijn terug te vinden op de favorietenpagina.
          </p>
        </Section>

        <Section id="notificaties" title="Notificaties" link="/notificaties" linkLabel="Ga naar Notificaties">
          <p>
            Het bel-icoon in de navigatiebalk toont het aantal ongelezen notificaties. Klik erop om de
            notificatiepagina te openen met een overzicht van recente wijzigingen die relevant zijn voor uw account.
          </p>
        </Section>

        <Section id="dark-mode" title="Dark mode">
          <p>
            Schakel dark mode in via het zon/maan-icoon in de navigatiebalk. De instelling wordt opgeslagen in uw
            browser en volgt standaard de systeeminstelling van uw besturingssysteem.
          </p>
        </Section>

        <Section id="rss" title="RSS Feed" link="/api/feed" linkLabel="Abonneer op RSS Feed">
          <p>
            De catalogus biedt een RSS- en Atom-feed aan met de laatste wijzigingen. Gebruik een RSS-lezer om op
            de hoogte te blijven van nieuwe pakketten, versies en andere updates.
          </p>
        </Section>

        <Section id="afdrukken" title="Afdrukken">
          <p>
            Alle pagina&apos;s hebben een print-vriendelijke weergave. Gebruik Ctrl+P (of Cmd+P op Mac) om de huidige
            pagina af te drukken. Navigatie-elementen en knoppen worden automatisch verborgen in de afdruk.
          </p>
        </Section>

        <Section id="keyboard" title="Keyboard shortcuts">
          <p>
            Druk op <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-xs font-mono">/</kbd> om
            direct naar de zoekbalk te springen. Druk op <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-xs font-mono">Escape</kbd> om
            een geopend dialoogvenster of zoekresultaat te sluiten.
          </p>
        </Section>

        <Section id="qr-codes" title="QR-codes">
          <p>
            Op detailpagina&apos;s van pakketten, leveranciers en gemeenten wordt een QR-code getoond die naar de
            huidige pagina linkt. Dit is handig voor presentaties of om snel een link te delen met collega&apos;s.
          </p>
        </Section>
      </div>
    </div>
  );
}
