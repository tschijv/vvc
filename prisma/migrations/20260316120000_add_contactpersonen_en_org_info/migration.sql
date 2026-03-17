-- Eis 68: Aanvullende organisatie-info op Leverancier
ALTER TABLE "Leverancier" ADD COLUMN "beschrijvingDiensten" TEXT;
ALTER TABLE "Leverancier" ADD COLUMN "supportPortalUrl" TEXT;
ALTER TABLE "Leverancier" ADD COLUMN "documentatieUrl" TEXT;
ALTER TABLE "Leverancier" ADD COLUMN "kennisbankUrl" TEXT;

-- Eis 67: Contactpersonen per pakket
CREATE TABLE "PakketContact" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "email" TEXT,
    "telefoon" TEXT,
    "rol" TEXT,
    "pakketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PakketContact_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PakketContact" ADD CONSTRAINT "PakketContact_pakketId_fkey" FOREIGN KEY ("pakketId") REFERENCES "Pakket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
