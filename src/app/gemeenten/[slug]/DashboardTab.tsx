import Link from "next/link";
import {
  type DashboardStats,
  type SimilarGemeente,
  type getGemeenteById,
} from "@/service/gemeente";
import HelpLink from "@/ui/components/HelpLink";

// ─── Dashboard tab ───────────────────────────────────────────────────────────

export default function DashboardTab({ stats, gemeenteId, similarGemeenten, similarTotalCount, samenwerkingen }: {
  stats: DashboardStats;
  gemeenteId: string;
  similarGemeenten: SimilarGemeente[];
  similarTotalCount: number;
  samenwerkingen: NonNullable<Awaited<ReturnType<typeof getGemeenteById>>>["samenwerkingen"];
}) {
  const cards = [
    {
      title: "Compliant pakketversies",
      hasInfo: true,
      icon: (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      count: stats.compliantCount,
      countLabel: "Pakketten",
      buttonLabel: "Toon compliant pakketversies",
      href: `/gemeenten/${gemeenteId}?tab=pakketten&compliancy=wel`,
    },
    {
      title: "Einde ondersteuning leverancier",
      hasInfo: true,
      icon: (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      count: stats.eindeOndersteuningCount,
      countLabel: "Pakketten",
      buttonLabel: "Toon pakketten zonder ondersteuning",
      href: `/gemeenten/${gemeenteId}?tab=pakketten`,
    },
    {
      title: "SaaS alternatieven",
      hasInfo: false,
      icon: (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      count: stats.saasAlternatievenCount,
      countLabel: "Pakketten met SaaS alternatieven",
      buttonLabel: "Toon pakketten met SaaS alternatieven",
      href: `/gemeenten/${gemeenteId}?tab=pakketten`,
    },
    {
      title: "Inkoopondersteuning",
      hasInfo: false,
      icon: (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: null,
      countLabel: null,
      description: "U gaat vanuit hier naar de algemene pagina voor inkoopondersteuning.",
      buttonLabel: "Inkoopondersteuning",
      href: "/info/voor-gemeenten",
    },
    {
      title: "Pakketten met meer mogelijkheden",
      hasInfo: false,
      icon: (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      count: stats.pakkettenMeerMogelijkheden,
      countLabel: "Referentiecomponenten",
      buttonLabel: "Toon referentiecomponenten",
      href: "/referentiecomponenten",
    },
    {
      title: "Referentiecomponenten met meerdere pakketten",
      hasInfo: false,
      icon: (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      count: stats.refcompMetMeerderePakketten,
      countLabel: "Referentiecomponenten",
      buttonLabel: "Toon referentiecomponenten",
      href: "/referentiecomponenten",
    },
  ];

  return (
    <>
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Dashboard</h2>
      <HelpLink section="dashboard" label="Help over het dashboard" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Card header */}
          <div className="flex items-start justify-between p-4 pb-2">
            <h3 className="text-[#e35b10] font-semibold text-base leading-tight pr-2">
              {card.title}
              {card.hasInfo && (
                <span className="inline-block ml-1.5 w-4 h-4 rounded-full bg-[#1a6ca8] text-white text-[10px] text-center leading-4 align-middle cursor-help" title="Meer informatie">
                  i
                </span>
              )}
            </h3>
            <div className="w-10 h-10 rounded bg-[#c44b0a] flex items-center justify-center flex-shrink-0">
              {card.icon}
            </div>
          </div>

          {/* Card body */}
          <div className="px-4 pb-2">
            {card.count !== null ? (
              <div className="flex items-center gap-2 my-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-green-600 text-white text-sm font-bold">
                  {card.count}
                </span>
                <span className="text-sm text-gray-700">{card.countLabel}</span>
              </div>
            ) : card.description ? (
              <p className="text-sm text-gray-600 my-3">{card.description}</p>
            ) : null}
          </div>

          {/* Card footer */}
          <div className="px-4 pb-4">
            <Link
              href={card.href}
              scroll={false}
              className="inline-block border border-[#1a6ca8] text-[#1a6ca8] text-sm px-3 py-1.5 rounded hover:bg-[#1a6ca8] hover:text-white transition-colors"
            >
              {card.buttonLabel}
            </Link>
          </div>
        </div>
      ))}
    </div>

    {/* Vergelijkbare gemeenten — volle breedte */}
    {similarGemeenten.length > 0 && (
      <div className="mt-8">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-start justify-between p-4 pb-2">
            <h3 className="text-[#e35b10] font-semibold text-base leading-tight pr-2">
              Vergelijkbare gemeenten
              <span
                className="inline-block ml-1.5 w-4 h-4 rounded-full bg-[#1a6ca8] text-white text-[10px] text-center leading-4 align-middle cursor-help"
                title="Jaccard-similariteit: overlap = gedeelde pakketten / totaal unieke pakketten. Hoe hoger het percentage, hoe meer overeenkomst in het applicatielandschap."
              >
                i
              </span>
            </h3>
            <div className="w-10 h-10 rounded bg-[#c44b0a] flex items-center justify-center flex-shrink-0">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 my-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-green-600 text-white text-sm font-bold">
                {similarGemeenten.length}
              </span>
              <span className="text-sm text-gray-700">Gemeenten met overlap</span>
            </div>
          </div>
          <div className="px-4 pb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th scope="col" className="pb-1.5 font-medium">Naam</th>
                  <th scope="col" className="pb-1.5 font-medium text-right">Gedeeld</th>
                  <th scope="col" className="pb-1.5 font-medium text-right">Totaal</th>
                  <th scope="col" className="pb-1.5 font-medium text-right">Overlap</th>
                  <th scope="col" className="pb-1.5 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                {similarGemeenten.map((sg) => (
                  <tr key={sg.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-1.5 pr-2">
                      <Link href={`/gemeenten/${sg.id}`} className="text-[#1a6ca8] hover:underline truncate block max-w-[180px]">
                        {sg.naam}
                      </Link>
                    </td>
                    <td className="py-1.5 text-right text-gray-600 tabular-nums">{sg.sharedCount}</td>
                    <td className="py-1.5 text-right text-gray-600 tabular-nums">{sg.totalPakketten}</td>
                    <td className="py-1.5 text-right">
                      <span className="inline-flex items-center justify-center min-w-[2rem] h-6 rounded bg-green-600 text-white text-xs font-bold px-1.5">
                        {sg.overlapPercentage}%
                      </span>
                    </td>
                    <td className="py-1.5 text-right pl-2">
                      <Link
                        href={`/gemeenten/vergelijk?a=${gemeenteId}&b=${sg.id}`}
                        className="text-xs border border-[#1a6ca8] text-[#1a6ca8] rounded px-2 py-0.5 hover:bg-[#1a6ca8] hover:text-white transition-colors whitespace-nowrap"
                      >
                        Vergelijk
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {similarTotalCount > similarGemeenten.length && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Link
                  href={`/gemeenten/${gemeenteId}/vergelijkbaar`}
                  className="text-sm text-[#1a6ca8] hover:underline font-medium"
                >
                  Alle vergelijkbare gemeenten ({similarTotalCount}) &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Samenwerkingsverbanden */}
    {samenwerkingen && samenwerkingen.length > 0 && (
      <div className="mt-5">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-start justify-between p-4 pb-2">
            <h3 className="text-[#e35b10] font-semibold text-base leading-tight pr-2">
              Samenwerkingsverbanden
            </h3>
            <div className="w-10 h-10 rounded bg-[#c44b0a] flex items-center justify-center flex-shrink-0">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 my-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-green-600 text-white text-sm font-bold">
                {samenwerkingen.length}
              </span>
              <span className="text-sm text-gray-700">Samenwerkingsverbanden</span>
            </div>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {samenwerkingen.map((sw) => (
              <div key={sw.samenwerking.id} className="flex items-center justify-between text-sm">
                <Link href={`/samenwerkingen/${sw.samenwerking.id}`} className="text-[#1a6ca8] hover:underline truncate mr-2">
                  {sw.samenwerking.naam}
                </Link>
                {sw.samenwerking.type && (
                  <span className="text-xs text-gray-400 flex-shrink-0">{sw.samenwerking.type}</span>
                )}
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <Link
              href="/samenwerkingen"
              className="inline-block border border-[#1a6ca8] text-[#1a6ca8] text-sm px-3 py-1.5 rounded hover:bg-[#1a6ca8] hover:text-white transition-colors"
            >
              Alle samenwerkingsverbanden
            </Link>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
