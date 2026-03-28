"use client";

import { useState, useRef, useEffect } from "react";
const sanitize = (html: string, opts?: Record<string, unknown>) => {
  if (typeof window === "undefined") return html;
  const DOMPurify = require("dompurify");
  const fn = DOMPurify.default?.sanitize ?? DOMPurify.sanitize;
  return fn ? fn(html, opts) : html;
};
import { getAIAdvies } from "./actions";

const SUGGESTIES = [
  {
    label: "Einde ondersteuning",
    vraag: "Welke pakketten naderen einde ondersteuning?",
    icon: "⚠️",
    kleur: "bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100",
  },
  {
    label: "GEMMA-standaarden",
    vraag: "Hoe verhoudt ons portfolio zich tot de GEMMA-standaarden?",
    icon: "📊",
    kleur: "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100",
  },
  {
    label: "Ontbrekende standaarden",
    vraag: "Welke standaarden missen we?",
    icon: "🔍",
    kleur: "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100",
  },
  {
    label: "Pakketadvies",
    vraag: "Geef advies voor pakketvervanging of consolidatie.",
    icon: "💡",
    kleur: "bg-green-50 border-green-200 text-green-800 hover:bg-green-100",
  },
  {
    label: "Voortgang verbeteren",
    vraag: "Analyseer onze voortgang en geef concrete stappen om onze sterren-score te verhogen. Kijk naar het aantal referentiecomponenten, pakketversie-statussen, koppelingen en actualiteit van de gegevens.",
    icon: "⭐",
    kleur: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
  },
];

export default function AIAdviseur({
  organisatieId,
  organisatieNaam,
}: {
  organisatieId: string;
  organisatieNaam: string;
}) {
  const [vraag, setVraag] = useState("");
  const [antwoord, setAntwoord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gesteldeVraag, setGesteldeVraag] = useState("");
  const antwoordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (antwoord && antwoordRef.current) {
      antwoordRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [antwoord]);

  async function handleSubmit(tekst?: string) {
    const q = tekst || vraag;
    if (!q.trim() || loading) return;

    setLoading(true);
    setError("");
    setAntwoord("");
    setGesteldeVraag(q);

    try {
      const result = await getAIAdvies(organisatieId, q);
      if (result.ok) {
        setAntwoord(result.text);
      } else {
        const msg = result.error;
        if (msg.includes("overloaded") || msg.includes("529") || msg.includes("503")) {
          setError("De AI-adviseur is tijdelijk niet beschikbaar door hoge belasting. Probeer het over enkele minuten opnieuw.");
        } else if (msg.includes("rate") || msg.includes("429")) {
          setError("U heeft te veel vragen achter elkaar gesteld. Wacht even en probeer het opnieuw.");
        } else if (msg.includes("401") || msg.includes("403") || msg.includes("API key") || msg.includes("config")) {
          setError("De AI-adviseur is niet correct geconfigureerd. Neem contact op met de beheerder.");
        } else {
          setError(`Er ging iets mis: ${msg}`);
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Onverwachte fout: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#1a6ca8]/5 via-blue-50 to-white border-2 border-[#1a6ca8]/20 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="bg-[#1a6ca8] text-white w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            AI-adviseur
          </h2>
          <p className="text-sm text-gray-500">
            Intelligente analyse van het applicatieportfolio van {organisatieNaam}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-5 ml-[52px]">
        Klik op een vraag of stel je eigen vraag. De AI analyseert alle pakketten, versies, standaarden en koppelingen.
      </p>

      {/* Voorgestelde vragen als kaarten */}
      {!antwoord && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {SUGGESTIES.map((s) => (
            <button
              key={s.vraag}
              onClick={() => {
                setVraag(s.vraag);
                handleSubmit(s.vraag);
              }}
              className={`flex items-start gap-3 text-left border rounded-lg px-4 py-3 transition-all ${s.kleur}`}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{s.icon}</span>
              <div>
                <span className="font-semibold text-sm block">{s.label}</span>
                <span className="text-xs opacity-75 mt-0.5 block">{s.vraag}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Invoerveld */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={vraag}
          onChange={(e) => setVraag(e.target.value)}
          placeholder="Stel een eigen vraag over het applicatieportfolio..."
          className="flex-1 text-sm border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1a6ca8] focus:ring-2 focus:ring-[#1a6ca8]/20 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !vraag.trim()}
          className="bg-[#1a6ca8] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#15587f] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyseren...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              Vraag stellen
            </>
          )}
        </button>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="mt-5 bg-white border border-blue-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-[#1a6ca8] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">AI analyseert het portfolio...</p>
              <p className="text-xs text-gray-500">Pakketten, versies, standaarden en koppelingen worden bekeken</p>
            </div>
          </div>
          <div className="ml-11 space-y-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-5/6" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-4/6" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start gap-3">
          <span className="text-xl mt-0.5">&#9888;&#65039;</span>
          <div className="flex-1">
            <p className="font-semibold">AI-adviseur niet beschikbaar</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => { setError(""); if (gesteldeVraag) handleSubmit(gesteldeVraag); }}
              className="mt-3 px-4 py-1.5 bg-[#1a6ca8] text-white text-xs font-medium rounded hover:bg-[#155a8c] transition-colors"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      )}

      {/* Antwoord */}
      {antwoord && (
        <div ref={antwoordRef} className="mt-5">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[#1a6ca8] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">AI-advies</span>
              </div>
              <span className="text-xs text-gray-400">{gesteldeVraag}</span>
            </div>
            <div
              className="ai-advies-content p-5 text-sm text-gray-700 leading-relaxed dark:bg-gray-800 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: sanitize(antwoord) }}
            />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => {
                setAntwoord("");
                setVraag("");
                setGesteldeVraag("");
              }}
              className="inline-flex items-center gap-1.5 text-sm text-[#1a6ca8] hover:underline font-medium"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Nieuw advies vragen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
