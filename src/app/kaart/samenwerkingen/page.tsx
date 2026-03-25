import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { getSamenwerkingenMetStats } from "@/service/samenwerking-kaart";
import SamenwerkingKaartWrapper from "./SamenwerkingKaartWrapper";

export default async function SamenwerkingenKaartPage() {
  const samenwerkingen = await getSamenwerkingenMetStats();

  // Aggregate totals for the summary bar
  const totaalSamenwerkingen = samenwerkingen.length;
  const totaalDeelnemers = new Set(
    samenwerkingen.flatMap((s) => s.leden.map((l) => l.id))
  ).size;
  const totaalPakketten = samenwerkingen.reduce(
    (sum, s) => sum + s.stats.totaalPakketten,
    0
  );
  const totaalKoppelingen = samenwerkingen.reduce(
    (sum, s) => sum + s.stats.totaalKoppelingen,
    0
  );

  return (
    <div className="max-w-[1600px]">
      <Breadcrumbs
        items={[
          { label: "Kaart", href: "/kaart" },
          { label: "Samenwerkingsverbanden", href: "/kaart/samenwerkingen" },
        ]}
      />
      <h1 className="text-2xl font-bold text-[#1a6ca8] dark:text-blue-300 mb-2">
        Samenwerkingsverbanden op de kaart
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Overzicht van alle samenwerkingsverbanden en hun deelnemende gemeenten.
      </p>

      {/* Stats summary bar */}
      <div className="flex flex-wrap gap-4 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-5 py-3">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-[#1a6ca8] dark:text-blue-300">
            {totaalSamenwerkingen}
          </span>{" "}
          samenwerkingsverbanden
        </div>
        <div className="text-gray-300 dark:text-gray-600">|</div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-[#1a6ca8] dark:text-blue-300">
            {totaalDeelnemers}
          </span>{" "}
          deelnemende gemeenten
        </div>
        <div className="text-gray-300 dark:text-gray-600">|</div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-[#1a6ca8] dark:text-blue-300">
            {totaalPakketten.toLocaleString("nl-NL")}
          </span>{" "}
          pakketten
        </div>
        <div className="text-gray-300 dark:text-gray-600">|</div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-[#1a6ca8] dark:text-blue-300">
            {totaalKoppelingen.toLocaleString("nl-NL")}
          </span>{" "}
          koppelingen
        </div>
      </div>

      <SamenwerkingKaartWrapper samenwerkingen={samenwerkingen} />

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        Gemeentegrenzen: CBS / Kadaster, {new Date().getFullYear()}. Klik op een
        gemeente voor meer informatie.
      </p>
    </div>
  );
}
