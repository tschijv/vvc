import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { getSamenwerkingenForKaart } from "@/service/samenwerking-kaart";
import SamenwerkingKaartWrapper from "./SamenwerkingKaartWrapper";

export default async function SamenwerkingenKaartPage() {
  const samenwerkingen = await getSamenwerkingenForKaart();

  return (
    <div className="max-w-7xl">
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
        Selecteer een samenwerkingsverband om te zien welke gemeenten deelnemen.
        De deelnemende gemeenten worden blauw gemarkeerd op de kaart.
      </p>

      <SamenwerkingKaartWrapper samenwerkingen={samenwerkingen} />

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        Gemeentegrenzen: CBS / Kadaster, {new Date().getFullYear()}. Klik op een
        gemeente voor meer informatie.
      </p>
    </div>
  );
}
