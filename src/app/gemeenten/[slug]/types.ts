// ─── Types ───────────────────────────────────────────────────────────────────

export type SuggestieData = {
  nieuwePakketten: { leverancier: string; pakketversie: string; pakketSlug: string; datum: string }[];
  nieuweVersies: { leverancier: string; pakketNaam: string; pakketSlug: string; huidigeVersie: string; nieuweVersie: string; datum: string }[];
  buitengemeentelijkeKoppelingen: { voorziening: string; standaard: string; transportprotocol: string; datum: string; bron: string }[];
};

export type PakketRow = {
  pakketversieId: string;
  leverancier: string;
  pakketNaam: string;
  pakketSlug: string;
  versie: string;
  status: string | null;
  datumIngangStatus: Date | null;
  gebruiktVoor: string[];
  hasCompliancy: boolean;
  standaardNamen: string[];
  testrapportStandaarden: string[];
  // Edit fields
  technologie: string | null;
  verantwoordelijke: string | null;
  licentievorm: string | null;
  aantalGebruikers: number | null;
  maatwerk: string | null;
};
