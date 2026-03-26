import KaartWrapper from "./KaartWrapper";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import { tenant } from "@/process/tenant-config";

export default function NederlandKaartPage() {
  return (
    <div className="max-w-7xl">
      <Breadcrumbs items={[
        { label: "Kaart", href: "/kaart" },
        { label: "Nederland", href: "/kaart/nederland" },
      ]} />
      <h1 className="text-2xl font-bold text-[#1a6ca8] mb-2">
        Gebruik Voorzieningencatalogus
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Alle {tenant.organisatieType.meervoud} hebben één of meerdere inlogaccounts waarmee ze het
        applicatieportfolio kunnen invoeren. De kaart toont de
        voortgang per {tenant.organisatieType.enkelvoud} op basis van voortgangssterren.
      </p>

      <KaartWrapper />

      <p className="mt-3 text-xs text-gray-400">
        Grenzen: CBS / Kadaster, {new Date().getFullYear()}. Klik op een
        {tenant.organisatieType.enkelvoud} voor meer informatie.
      </p>
    </div>
  );
}
