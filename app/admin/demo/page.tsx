import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import { demoSections as sections } from "@/lib/demo-sections";
import DemoStartButton from "./DemoStartButton";

export default async function DemoDraaiboekPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const totalMinutes = sections.reduce((sum, s) => {
    const m = parseInt(s.duur);
    return sum + (isNaN(m) ? 0 : m);
  }, 0);

  return (
    <div className="max-w-4xl">
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Demo draaiboek", href: "/admin/demo" },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Demo Draaiboek
      </h1>
      <p className="text-gray-500 mb-6">
        Geschatte duur: {totalMinutes} minuten &middot; Inloggen als admin voor
        volledige toegang &middot; {sections.length} onderdelen
      </p>

      {/* Geautomatiseerde demo */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">Geautomatiseerde demo met spraak</h2>
            <p className="text-sm text-gray-600 mb-3">
              Start een automatische rondleiding door alle {sections.length} onderdelen.
              De applicatie navigeert zelf en leest de toelichting voor met ondertiteling.
            </p>
            <DemoStartButton />
            <p className="text-xs text-gray-500 mt-3">
              Bediening: <strong>Spatie</strong> = pauze/hervat &middot; <strong>&rarr;</strong> = volgende &middot; <strong>Esc</strong> = stop
            </p>
          </div>
          <div className="text-xs text-gray-500 max-w-xs">
            <strong className="text-gray-700">Onderhoud</strong>
            <p className="mt-1">
              De demo-secties staan centraal in <code className="bg-gray-100 px-1 rounded">lib/demo-sections.ts</code>.
              Pas dat bestand aan om secties toe te voegen, te wijzigen of te verwijderen.
              Zowel deze pagina als het CLI-script (<code className="bg-gray-100 px-1 rounded">scripts/run-demo.ts</code>) gebruiken dezelfde bron.
            </p>
            <p className="mt-1">
              CLI alternatief: <code className="bg-gray-100 px-1 rounded text-[11px]">npx tsx scripts/run-demo.ts</code>
            </p>
          </div>
        </div>
      </div>

      {/* Inhoudsopgave */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
        <h2 className="font-semibold text-gray-800 mb-3">Inhoudsopgave</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {sections.map((s) => (
            <a
              key={s.nr}
              href={`#sectie-${s.nr}`}
              className="text-sm text-[#1a6ca8] hover:underline flex items-center gap-2"
            >
              <span className="text-gray-400 font-mono w-5 text-right">
                {s.nr}.
              </span>
              <span>{s.titel}</span>
              <span className="text-gray-400 text-xs">({s.duur})</span>
              {s.highlight && (
                <span className="text-orange-500 text-xs">&#9733;</span>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Tip box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-sm text-blue-800">
        <strong>Tips voor de demo:</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>
            Inloggen voor de demo &mdash; veel features zijn alleen zichtbaar
            voor ingelogde gebruikers
          </li>
          <li>
            Begin met de homepage &mdash; laat de structuur zien voordat je
            inzoomt
          </li>
          <li>
            AI-adviseur als hoogtepunt &mdash; bewaar dit voor het midden of
            einde van de demo
          </li>
          <li>
            Vergelijkingstool &mdash; visueel aantrekkelijk, goed voor
            discussie
          </li>
          <li>
            PvE-analyse &mdash; toont de volwassenheid van het platform
            (realisatiegraad)
          </li>
        </ul>
      </div>

      {/* Secties */}
      <div className="space-y-6">
        {sections.map((s) => (
          <div
            key={s.nr}
            id={`sectie-${s.nr}`}
            className={`bg-white border rounded-lg p-5 ${
              s.highlight
                ? "border-orange-300 ring-1 ring-orange-200"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="bg-[#1a6ca8] text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  {s.nr}
                </span>
                <h2 className="text-lg font-semibold text-gray-900">
                  {s.titel}
                  {s.highlight && (
                    <span className="ml-2 text-orange-500">&#9733;</span>
                  )}
                </h2>
              </div>
              <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                {s.duur}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-3">{s.toelichting}</p>

            {s.actie && (
              <div className="bg-green-50 border border-green-200 rounded px-3 py-2 mb-3">
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Demo-actie
                </span>
                <p className="text-sm text-green-800 mt-0.5">{s.actie}</p>
              </div>
            )}

            {s.vereist && (
              <p className="text-xs text-orange-600 mb-3">
                &#9888; Vereist: {s.vereist}
              </p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={s.link}
                className="inline-flex items-center gap-1.5 bg-[#1a6ca8] text-white text-sm font-medium px-4 py-1.5 rounded hover:bg-[#15587f] transition-colors"
                target="_blank"
              >
                Openen &rarr;
              </Link>
              {s.extraLinks?.map((el) => (
                <Link
                  key={el.href}
                  href={el.href}
                  className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm font-medium px-4 py-1.5 rounded hover:bg-gray-200 transition-colors"
                  target="_blank"
                >
                  {el.label} &rarr;
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 mb-12 text-center text-sm text-gray-400">
        VNG Voorzieningencatalogus &middot; Demo Draaiboek &middot;{" "}
        {sections.length} onderdelen &middot; ~{totalMinutes} minuten
      </div>
    </div>
  );
}
