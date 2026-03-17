import KaartWrapper from "./KaartWrapper";

export default function NederlandKaartPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#1a6ca8] mb-2">
        Gebruik Voorzieningencatalogus
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Alle gemeenten hebben één of meerdere inlogaccounts waarmee ze het
        gemeentelijk applicatieportfolio kunnen invoeren. De kaart toont de
        voortgang per gemeente op basis van voortgangssterren.
      </p>

      <KaartWrapper />

      <p className="mt-3 text-xs text-gray-400">
        Gemeentegrenzen: CBS / Kadaster, {new Date().getFullYear()}. Klik op een
        gemeente voor meer informatie.
      </p>
    </div>
  );
}
