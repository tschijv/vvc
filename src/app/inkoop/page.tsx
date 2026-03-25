import { prisma } from "@/data/prisma";
import InkoopClient from "./InkoopClient";
import Breadcrumbs from "@/ui/components/Breadcrumbs";
import GlossaryHighlighter from "@/ui/components/GlossaryHighlighter";
import HelpLink from "@/ui/components/HelpLink";

export const metadata = {
  title: "Inkoopondersteuning - Voorzieningencatalogus",
};

export default async function InkoopPage() {
  const referentiecomponenten = await prisma.referentiecomponent.findMany({
    select: { id: true, naam: true },
    orderBy: { naam: "asc" },
  });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Inkoopondersteuning", href: "/inkoop" }]} />
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#1a6ca8]">
          Inkoopondersteuning
        </h1>
        <HelpLink section="inkoop" label="Help over Inkoopondersteuning" />
      </div>
      <p className="text-sm text-gray-700 mb-2 max-w-3xl">
        <strong>
          Bestekteksten voor het toepassen van GEMMA bij aanschaf van software
        </strong>
      </p>
      <p className="text-sm text-gray-600 mb-4 max-w-3xl">
        <GlossaryHighlighter>Standaarden zijn belangrijk voor gemeenten. Pas standaarden toe bij inkoop en aanbesteding. VNG Realisatie raadt aan GIBIT als inkoopvoorwaarden voor ICT producten en diensten te hanteren om zo duurzame kwaliteitseisen te borgen op het gebied van architectuur, interoperabiliteit, beveiliging, toegankelijkheid, archivering, documentatie, dataportabiliteit en aansluiting op de nationale digitale infrastructuur.</GlossaryHighlighter>
      </p>
      <p className="text-sm text-gray-600 mb-6 max-w-3xl">
        <GlossaryHighlighter>Selecteer hieronder een of meer referentiecomponenten om het ICT-aanbod te raadplegen en de bijbehorende standaarden te bekijken.</GlossaryHighlighter>
      </p>

      <InkoopClient referentiecomponenten={referentiecomponenten} />
    </div>
  );
}
