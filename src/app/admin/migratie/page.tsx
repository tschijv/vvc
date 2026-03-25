import { redirect } from "next/navigation";
import { getSessionUser } from "@/process/auth-helpers";
import Link from "next/link";
import Breadcrumbs from "@/ui/components/Breadcrumbs";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">{title}</h2>
      {children}
    </div>
  );
}

function Chip({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
    teal: "bg-teal-100 text-teal-700",
    amber: "bg-amber-100 text-amber-700",
    gray: "bg-gray-100 text-gray-600",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span className={`${colors[color] || colors.gray} px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap`}>
      {children}
    </span>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>;
}

/* ── Mapping data types ── */
interface ColumnMapping {
  csv: string;
  prisma: string;
  type: string;
  notes?: string;
}

interface CsvSource {
  bestand: string;
  delimiter: string;
  encoding: string;
  entities: string[];
  color: string;
  columns: ColumnMapping[];
  specialHandling?: string[];
}

/* ── Alle mappings ── */
const sources: CsvSource[] = [
  {
    bestand: "leveranciers_*.csv",
    delimiter: ";",
    encoding: "UTF-8",
    entities: ["Leverancier", "Addendum", "LeverancierAddendum"],
    color: "orange",
    columns: [
      { csv: "Leverancier id", prisma: "Leverancier.id", type: "UUID → String @id" },
      { csv: "Supplier Name", prisma: "Leverancier.naam", type: "String" },
      { csv: "Supplier Url", prisma: "Leverancier.website", type: "String?" },
      { csv: "Supplier Contact", prisma: "Leverancier.contactpersoon", type: "String?" },
      { csv: "Supplier E-mailadres", prisma: "Leverancier.email", type: "String?" },
      { csv: "Supplier Telefoon", prisma: "Leverancier.telefoon", type: "String?" },
      { csv: "Aanmaakdatum", prisma: "Leverancier.aanmaakdatum", type: "DD-MM-YY → DateTime?", notes: "Parsen als datum (26-03-14 = 2014-03-26)" },
      { csv: "Number of products", prisma: "—", type: "Int (afgeleid)", notes: "Niet importeren, berekend via relatie Pakket[]" },
      { csv: "Signed Addenda", prisma: "Addendum + LeverancierAddendum", type: "Multi-value comma-separated", notes: "Splitsen op komma. Per unieke naam een Addendum aanmaken, daarna koppelrecords." },
      { csv: "Supplier Last activity", prisma: "Leverancier.lastActivity", type: "DD-MM-YY → DateTime?" },
    ],
    specialHandling: [
      "slug genereren uit naam (slugify)",
      "Signed Addenda is comma-separated: eerst dedupliceren naar Addendum-tabel, daarna LeverancierAddendum koppelrecords",
      "Lege velden als null opslaan, niet als lege string",
    ],
  },
  {
    bestand: "leveranciers_pakketten_*.csv",
    delimiter: ";",
    encoding: "UTF-8",
    entities: ["Pakket", "Pakketversie", "PakketReferentiecomponent", "PakketStandaard", "PakketTechnologie"],
    color: "blue",
    columns: [
      { csv: "Leverancier Naam", prisma: "— (lookup)", type: "String", notes: "Match op Leverancier.naam voor FK" },
      { csv: "Leverancier ID", prisma: "Pakket.leverancierId", type: "UUID → String" },
      { csv: "Pakket Naam", prisma: "Pakket.naam", type: "String" },
      { csv: "Pakket ID", prisma: "Pakket.id", type: "UUID → String @id" },
      { csv: "Pakket Beschrijving", prisma: "Pakket.beschrijving", type: "String?", notes: "Kan meerregelig zijn (newlines in quoted field)" },
      { csv: "Pakket URL productpagina", prisma: "Pakket.urlProductpagina", type: "String?" },
      { csv: "Pakket aantal gemeenten", prisma: "Pakket.aantalGemeenten", type: "String → Int" },
      { csv: "Mutatiedatum pakket", prisma: "Pakket.mutatiedatum", type: "DD-MM-YY → DateTime?" },
      { csv: "Pakketversie Naam", prisma: "Pakketversie.naam", type: "String", notes: "Let op: soms voorloopspatie (trimmen)" },
      { csv: "Pakketversie ID", prisma: "Pakketversie.id", type: "UUID → String @id" },
      { csv: "Pakketversie Status", prisma: "Pakketversie.status", type: "String", notes: "Waarden: In distributie, In ontwikkeling, In test, Einde ondersteuning" },
      { csv: "Pakketversie Beschrijving", prisma: "Pakketversie.beschrijving", type: "String?" },
      { csv: "Start ontwikkeling", prisma: "Pakketversie.startOntwikkeling", type: "DD-MM-YY → DateTime?" },
      { csv: "Start test", prisma: "Pakketversie.startTest", type: "DD-MM-YY → DateTime?" },
      { csv: "Start distributie", prisma: "Pakketversie.startDistributie", type: "DD-MM-YY → DateTime?" },
      { csv: "Pakketversie aantal gemeenten", prisma: "Pakketversie.aantalGemeenten", type: "String → Int" },
      { csv: "Mutatiedatum pakketversie", prisma: "Pakketversie.mutatiedatum", type: "DD-MM-YY → DateTime?" },
      { csv: "Referentiecomponenten leverancier", prisma: "PakketReferentiecomponent (type=leverancier)", type: "Multi-value", notes: "Comma-separated namen. Match op Referentiecomponent.naam" },
      { csv: "Referentiecomponenten leverancier UUID", prisma: "PakketReferentiecomponent.referentiecomponentId", type: "Multi-value UUIDs", notes: "Comma-separated UUIDs, 1-op-1 met namen" },
      { csv: "Referentiecomponenten gemeente", prisma: "PakketReferentiecomponent (type=gemeente)", type: "Multi-value", notes: "Idem, maar type=gemeente" },
      { csv: "Referentiecomponenten gemeente UUID", prisma: "PakketReferentiecomponent.referentiecomponentId", type: "Multi-value UUIDs" },
      { csv: "Referentiecomponent ID leverancier", prisma: "— (zie UUID kolom)", type: "Multi-value", notes: "Alternatief ID-formaat, gebruik UUID-kolom" },
      { csv: "Referentiecomponenten ID gemeente", prisma: "— (zie UUID kolom)", type: "Multi-value" },
      { csv: "Pakketversie Ondersteunde technologieën", prisma: "PakketTechnologie.technologie", type: "Multi-value", notes: "Comma-separated. Per waarde een PakketTechnologie record" },
      { csv: "Ondersteuning standaardversies", prisma: "PakketStandaard", type: "Multi-value", notes: "Comma-separated standaardversie-namen. Match op Standaardversie.naam" },
      { csv: "Pakketversie ID Fout", prisma: "—", type: "String?", notes: "Negeren (data-quality vlag uit bronsysteem)" },
    ],
    specialHandling: [
      "Pakket dedupliceren op Pakket ID (meerdere versie-rijen per pakket)",
      "Multi-value velden splitsen op ', ' (komma+spatie)",
      "Referentiecomponent UUIDs matchen met GEMMA-sync data",
      "Standaardversie-namen matchen op Standaardversie.naam (fuzzy match nodig)",
      "Beschrijvingen kunnen newlines bevatten binnen quoted fields",
    ],
  },
  {
    bestand: "Gemeenten_applicatieportfolio_*.csv",
    delimiter: ";",
    encoding: "UTF-8",
    entities: ["Gemeente", "Samenwerking", "SamenwerkingGemeente", "GemeentePakket", "PakketReferentiecomponent"],
    color: "green",
    columns: [
      { csv: "Gemeente ID", prisma: "Gemeente.id", type: "UUID → String @id" },
      { csv: "Gemeente naam", prisma: "Gemeente.naam", type: "String" },
      { csv: "Gemeente CBS", prisma: "Gemeente.cbsCode", type: "String?" },
      { csv: "Samenwerking ID", prisma: "Samenwerking.id", type: "UUID → String @id", notes: "Kan leeg zijn (gemeente zonder samenwerking)" },
      { csv: "Samenwerking", prisma: "Samenwerking.naam", type: "String" },
      { csv: "Samenwerking gemeente id", prisma: "SamenwerkingGemeente", type: "Multi-value UUIDs", notes: "Comma-separated gemeente-IDs die lid zijn van de samenwerking" },
      { csv: "Gebruik Status", prisma: "GemeentePakket.status", type: "String?", notes: "Waarden: In productie, In test, etc." },
      { csv: "Gebruik omschrijving", prisma: "—", type: "String?", notes: "Niet in Prisma-model (optioneel toevoegen)" },
      { csv: "Gebruik Datum ingang status", prisma: "GemeentePakket.datumIngangStatus", type: "DD-MM-YY → DateTime?" },
      { csv: "Leverancier ID", prisma: "— (via Pakket)", type: "UUID", notes: "Niet direct nodig, FK loopt via Pakketversie" },
      { csv: "Leverancier Naam", prisma: "— (verificatie)", type: "String" },
      { csv: "Pakket ID", prisma: "— (via Pakketversie)", type: "UUID" },
      { csv: "Pakket Naam", prisma: "— (verificatie)", type: "String" },
      { csv: "Pakketversie ID", prisma: "GemeentePakket.pakketversieId", type: "UUID → String" },
      { csv: "Pakketversie Naam", prisma: "— (verificatie)", type: "String" },
      { csv: "Pakketversie gebruik technologie", prisma: "GemeentePakket.technologie", type: "String?" },
      { csv: "Mutatiedatum applicatieportfolio", prisma: "GemeentePakket.mutatiedatum", type: "DD-MM-YY → DateTime?" },
      { csv: "Referentiecomponenten ID", prisma: "PakketReferentiecomponent", type: "UUID", notes: "Gemeente-perspectief referentiecomponenten" },
      { csv: "Referentiecomponenten naam", prisma: "— (verificatie)", type: "String" },
    ],
    specialHandling: [
      "Sterk gedenormaliseerd: elke rij = 1 gemeente + 1 pakketversie + 1 referentiecomponent",
      "Gemeente dedupliceren op Gemeente ID",
      "Samenwerking dedupliceren op Samenwerking ID",
      "SamenwerkingGemeente: parse comma-separated gemeente-IDs per samenwerking",
      "GemeentePakket composite key: (gemeenteId, pakketversieId) — dedupliceren",
      "Pakketversie ID kan leeg zijn als pakketversie-naam = pakket-naam (versie onbekend)",
    ],
  },
  {
    bestand: "Koppelingen_*.csv",
    delimiter: ";",
    encoding: "UTF-8",
    entities: ["Koppeling"],
    color: "amber",
    columns: [
      { csv: "Koppeling ID", prisma: "Koppeling.id", type: "String → String @id", notes: "Numeriek ID, converteren naar UUID of behouden" },
      { csv: "Organisation", prisma: "— (lookup)", type: "String", notes: "Match op Gemeente.naam" },
      { csv: "Organisatie ID", prisma: "Koppeling.gemeenteId", type: "UUID → String" },
      { csv: "Samenwerking", prisma: "—", type: "String?", notes: "Informatief, niet in Koppeling model" },
      { csv: "Samenwerking ID", prisma: "—", type: "UUID?", notes: "Informatief" },
      { csv: "Status", prisma: "Koppeling.status", type: "String?" },
      { csv: "Datum ingang status", prisma: "Koppeling.datumIngangStatus", type: "DD-MM-YY → DateTime?" },
      { csv: "Pakket ID 1", prisma: "— (lookup)", type: "UUID", notes: "Lookup Pakket, dan juiste Pakketversie vinden" },
      { csv: "Pakket Naam 1", prisma: "— (verificatie)", type: "String" },
      { csv: "Pakketversie ID 1", prisma: "Koppeling.bronPakketversieId", type: "UUID → String?" },
      { csv: "Pakketversie Naam 1", prisma: "— (verificatie)", type: "String" },
      { csv: "Leverancier 1", prisma: "— (verificatie)", type: "String" },
      { csv: "Leverancier ID 1", prisma: "— (verificatie)", type: "UUID" },
      { csv: "Koppeling richting", prisma: "Koppeling.richting", type: "Enum-mapping", notes: "left_to_right → heen, right_to_left → weer, bidirection → beide, unknown → beide" },
      { csv: "Pakket ID 2", prisma: "— (lookup)", type: "UUID" },
      { csv: "Pakket Naam 2", prisma: "— (verificatie)", type: "String" },
      { csv: "Pakketversie ID 2", prisma: "Koppeling.doelPakketversieId", type: "UUID → String?" },
      { csv: "Pakketversie Naam 2", prisma: "— (verificatie)", type: "String" },
      { csv: "Leverancier 2", prisma: "— (verificatie)", type: "String" },
      { csv: "Leverancier ID 2", prisma: "— (verificatie)", type: "UUID" },
      { csv: "Standaard of maatwerk", prisma: "Koppeling.standaard", type: "String?", notes: "norm / custom / unknown → bijv. standaard / maatwerk / onbekend" },
      { csv: "Standaardversie", prisma: "Koppeling.standaard (naam)", type: "String?", notes: "Naam van standaardversie, opslaan als tekstveld" },
      { csv: "Standaardversie ID", prisma: "—", type: "UUID?", notes: "Optioneel: FK naar Standaardversie als gewenst" },
      { csv: "Transportprotocol", prisma: "Koppeling.transportprotocol", type: "String?" },
      { csv: "Transportprotocol ID", prisma: "—", type: "String?", notes: "Numeriek ID, niet nodig" },
      { csv: "Aanvullende informatie", prisma: "Koppeling.aanvullendeInformatie", type: "String?" },
      { csv: "Pakketversie Naam Intermediair", prisma: "— (lookup)", type: "String?", notes: "Zoek Pakketversie op naam" },
      { csv: "Pakketversie ID Intermediair", prisma: "Koppeling.intermediairPakketversieId", type: "UUID → String?" },
    ],
    specialHandling: [
      "Koppeling ID is numeriek (niet UUID) — nieuw UUID genereren of converteren",
      "Richting-mapping: left_to_right=heen, right_to_left=weer, bidirection=beide",
      "Pakketversie IDs matchen met eerder geïmporteerde Pakketversies",
      "Niet alle pakketversies bestaan misschien in de Pakketversie-tabel → ExternPakket gebruiken",
      "Standaardversie-naam opslaan als tekst in standaard-veld, optioneel FK koppelen",
    ],
  },
  {
    bestand: "Samenwerkingen_*.csv",
    delimiter: ";",
    encoding: "UTF-8",
    entities: ["Samenwerking", "SamenwerkingGemeente"],
    color: "teal",
    columns: [
      { csv: "Collaboration ID", prisma: "Samenwerking.id", type: "UUID → String @id" },
      { csv: "Collaboration Name", prisma: "Samenwerking.naam", type: "String" },
      { csv: "Collaboration type", prisma: "Samenwerking.type", type: "String?" },
      { csv: "Contact Name", prisma: "Samenwerking.contactpersoon", type: "String?" },
      { csv: "Contact Email", prisma: "Samenwerking.email", type: "String?" },
      { csv: "Organisations Name", prisma: "— (verificatie)", type: "Multi-value", notes: "Comma-separated gemeentenamen, ter controle" },
      { csv: "Organisations ID", prisma: "SamenwerkingGemeente.gemeenteId", type: "Multi-value UUIDs", notes: "Comma-separated. Per UUID een SamenwerkingGemeente record aanmaken" },
    ],
    specialHandling: [
      "Organisations ID splitsen op ', ' (komma+spatie)",
      "Per organisatie-UUID een SamenwerkingGemeente record met samenwerkingId + gemeenteId",
      "Controleer dat alle gemeente-UUIDs bestaan in de Gemeente-tabel",
      "Dedupliceren met samenwerkingen uit Gemeenten_applicatieportfolio CSV",
    ],
  },
  {
    bestand: "GEMMA standaardenlijst - GEMMA Online.csv",
    delimiter: ",",
    encoding: "UTF-8",
    entities: ["Standaard"],
    color: "purple",
    columns: [
      { csv: "Standaard", prisma: "Standaard.naam", type: "String", notes: "Geen UUID in bron — genereren bij import" },
      { csv: "Definitie", prisma: "Standaard.beschrijving", type: "String?" },
      { csv: "Beheerder", prisma: "—", type: "String", notes: "Niet in Prisma-model (optioneel toevoegen als veld)" },
      { csv: "GEMMA status", prisma: "—", type: "String", notes: "Waarden: In gebruik, Aanbevolen, etc. Niet in Standaard-model" },
    ],
    specialHandling: [
      "Let op: komma-gescheiden (niet puntkomma zoals de andere bestanden)",
      "Geen UUIDs — nieuwe UUIDs genereren bij import",
      "Standaardversies niet in dit bestand — komen uit leveranciers_pakketten CSV",
      "Match standaardnamen met Ondersteuning standaardversies uit pakketten-CSV",
      "GEMMA-sync kan deze data ook leveren — dedupliceren met API-data",
    ],
  },
];

/* ── Import volgorde ── */
const importOrder = [
  { stap: 1, entiteit: "Referentiecomponent", bron: "GEMMA API sync", notes: "Eerst via GEMMA ArchiMate API synchroniseren" },
  { stap: 2, entiteit: "Standaard + Standaardversie", bron: "GEMMA standaardenlijst CSV + GEMMA API", notes: "CSV voor namen, API voor versies" },
  { stap: 3, entiteit: "Leverancier + Addendum", bron: "leveranciers_*.csv", notes: "Addenda dedupliceren uit Signed Addenda kolom" },
  { stap: 4, entiteit: "Pakket + Pakketversie", bron: "leveranciers_pakketten_*.csv", notes: "Dedupliceren op Pakket ID" },
  { stap: 5, entiteit: "PakketReferentiecomponent", bron: "leveranciers_pakketten_*.csv", notes: "Na stap 1 + 4, match op UUID" },
  { stap: 6, entiteit: "PakketStandaard", bron: "leveranciers_pakketten_*.csv", notes: "Na stap 2 + 4, match op naam" },
  { stap: 7, entiteit: "PakketTechnologie", bron: "leveranciers_pakketten_*.csv", notes: "Na stap 4" },
  { stap: 8, entiteit: "Gemeente", bron: "Gemeenten_applicatieportfolio_*.csv", notes: "Dedupliceren op Gemeente ID" },
  { stap: 9, entiteit: "Samenwerking + SamenwerkingGemeente", bron: "Samenwerkingen_*.csv + applicatieportfolio", notes: "Dedupliceren uit beide bronnen" },
  { stap: 10, entiteit: "GemeentePakket", bron: "Gemeenten_applicatieportfolio_*.csv", notes: "Composite key (gemeenteId, pakketversieId)" },
  { stap: 11, entiteit: "Koppeling", bron: "Koppelingen_*.csv", notes: "Na stap 4 + 8, richting-mapping" },
];

export default async function MigratiePage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Datamigratie", href: "/admin/migratie" },
      ]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datamigratie-mapping</h1>
          <p className="text-sm text-gray-500 mt-1">
            Mapping van Drupal Softwarecatalogus CSV-exports naar Prisma-schema
          </p>
        </div>
      </div>

      {/* Overzicht */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          Deze pagina documenteert hoe de 6 CSV-exports uit de huidige Drupal-gebaseerde Softwarecatalogus
          worden gemapt naar het nieuwe Prisma-datamodel. Alle bestanden gebruiken puntkomma als scheidingsteken,
          behalve de GEMMA standaardenlijst (komma).
        </p>
      </div>

      {/* Bronbestanden overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Bronbestanden</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sources.map((s) => (
            <div key={s.bestand} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <Code>{s.bestand}</Code>
                <Chip color={s.color}>{s.delimiter === ";" ? "puntkomma" : "komma"}</Chip>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {s.entities.map((e) => (
                  <Chip key={e} color={s.color}>{e}</Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import volgorde */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Import-volgorde</h2>
        <p className="text-sm text-gray-500 mb-3">
          De volgorde is belangrijk vanwege foreign key-afhankelijkheden.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th scope="col" className="py-2 pr-3 text-gray-500 font-medium w-12">#</th>
              <th scope="col" className="py-2 pr-3 text-gray-500 font-medium">Entiteit(en)</th>
              <th scope="col" className="py-2 pr-3 text-gray-500 font-medium">Bron</th>
              <th scope="col" className="py-2 text-gray-500 font-medium">Opmerkingen</th>
            </tr>
          </thead>
          <tbody>
            {importOrder.map((row) => (
              <tr key={row.stap} className="border-b border-gray-50">
                <td className="py-2 pr-3 text-gray-400 font-mono">{row.stap}</td>
                <td className="py-2 pr-3 font-medium text-gray-800">
                  <Code>{row.entiteit}</Code>
                </td>
                <td className="py-2 pr-3 text-gray-600">{row.bron}</td>
                <td className="py-2 text-gray-500">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail per CSV */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Kolom-mapping per bronbestand</h2>

        {sources.map((source) => (
          <Section key={source.bestand} title={source.bestand}>
            <div className="flex items-center gap-2 mb-3">
              <Chip color={source.color}>Delimiter: {source.delimiter === ";" ? "puntkomma (;)" : "komma (,)"}</Chip>
              <Chip color="gray">{source.encoding}</Chip>
              {source.entities.map((e) => (
                <Chip key={e} color={source.color}>{e}</Chip>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th scope="col" className="py-2 pr-3 text-gray-500 font-medium whitespace-nowrap">CSV-kolom</th>
                    <th scope="col" className="py-2 pr-3 text-gray-500 font-medium whitespace-nowrap">Prisma-veld</th>
                    <th scope="col" className="py-2 pr-3 text-gray-500 font-medium whitespace-nowrap">Type / conversie</th>
                    <th scope="col" className="py-2 text-gray-500 font-medium">Opmerkingen</th>
                  </tr>
                </thead>
                <tbody>
                  {source.columns.map((col) => (
                    <tr key={col.csv} className="border-b border-gray-50">
                      <td className="py-1.5 pr-3">
                        <code className="bg-orange-50 text-orange-800 px-1 py-0.5 rounded text-xs font-mono">{col.csv}</code>
                      </td>
                      <td className="py-1.5 pr-3">
                        {col.prisma === "—" || col.prisma.startsWith("—") ? (
                          <span className="text-gray-500 italic">{col.prisma}</span>
                        ) : (
                          <code className="bg-blue-50 text-blue-800 px-1 py-0.5 rounded text-xs font-mono">{col.prisma}</code>
                        )}
                      </td>
                      <td className="py-1.5 pr-3 text-gray-600 whitespace-nowrap">{col.type}</td>
                      <td className="py-1.5 text-gray-500">{col.notes || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {source.specialHandling && source.specialHandling.length > 0 && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3">
                <span className="text-xs font-semibold text-amber-700">Bijzonderheden:</span>
                <ul className="mt-1 space-y-0.5">
                  {source.specialHandling.map((note, i) => (
                    <li key={i} className="text-xs text-amber-800 flex gap-1.5">
                      <span className="text-amber-400 mt-0.5">&#x2022;</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        ))}
      </div>

      {/* Datumformaat */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Conventies en transformaties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Datumformaat</h3>
            <p className="text-xs text-gray-600">
              Alle datums in de CSV-bestanden gebruiken het formaat <Code>DD-MM-YY</Code> (bijv.{" "}
              <Code>26-03-14</Code> = 26 maart 2014). Parsen met 2-digit jaargetal: 00-30 = 2000-2030, 31-99 = 1931-1999.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Multi-value velden</h3>
            <p className="text-xs text-gray-600">
              Velden met meerdere waarden (referentiecomponenten, standaarden, organisatie-IDs)
              zijn gescheiden door <Code>, </Code> (komma + spatie). Elke waarde wordt een apart koppelrecord.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">UUID-strategie</h3>
            <p className="text-xs text-gray-600">
              De meeste entiteiten hebben bestaande UUIDs die behouden worden. Uitzonderingen: Koppeling (numeriek ID
              → nieuw UUID), Standaard uit GEMMA-lijst (geen UUID → genereren), Addendum (geen UUID → genereren).
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Slugs</h3>
            <p className="text-xs text-gray-600">
              <Code>Leverancier.slug</Code> en <Code>Pakket.slug</Code> bestaan niet in de CSV-data en worden
              gegenereerd via slugify (lowercase, diacritics verwijderen, spaties → hyphens).
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-6">
        <p className="text-xs text-gray-400">
          Laatste update: maart 2026. Brondata: exports uit{" "}
          <span className="font-medium">softwarecatalogus.commonground.nl</span> (Drupal).
        </p>
      </div>
    </div>
  );
}
