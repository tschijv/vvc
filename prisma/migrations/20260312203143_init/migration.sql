-- CreateTable
CREATE TABLE "Referentiecomponent" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "guid" TEXT,
    "beschrijving" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referentiecomponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Standaard" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "guid" TEXT,
    "beschrijving" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Standaard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Standaardversie" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "guid" TEXT,
    "status" TEXT,
    "compliancyMonitor" BOOLEAN NOT NULL DEFAULT false,
    "standaardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Standaardversie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicatiefunctie" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "guid" TEXT,
    "beschrijving" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Applicatiefunctie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leverancier" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "contactpersoon" TEXT,
    "email" TEXT,
    "telefoon" TEXT,
    "website" TEXT,
    "heeftGeldigConvenant" BOOLEAN NOT NULL DEFAULT false,
    "aanmaakdatum" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leverancier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Addendum" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "beschrijving" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Addendum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeverancierAddendum" (
    "leverancierId" TEXT NOT NULL,
    "addendumId" TEXT NOT NULL,

    CONSTRAINT "LeverancierAddendum_pkey" PRIMARY KEY ("leverancierId","addendumId")
);

-- CreateTable
CREATE TABLE "Pakket" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "beschrijving" TEXT,
    "urlProductpagina" TEXT,
    "aantalGemeenten" INTEGER NOT NULL DEFAULT 0,
    "mutatiedatum" TIMESTAMP(3),
    "leverancierId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pakket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pakketversie" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "beschrijving" TEXT,
    "startOntwikkeling" TIMESTAMP(3),
    "startTest" TIMESTAMP(3),
    "startDistributie" TIMESTAMP(3),
    "aantalGemeenten" INTEGER NOT NULL DEFAULT 0,
    "mutatiedatum" TIMESTAMP(3),
    "pakketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pakketversie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PakketversieReferentiecomponent" (
    "pakketversieId" TEXT NOT NULL,
    "referentiecomponentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "aantalGemeenten" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PakketversieReferentiecomponent_pkey" PRIMARY KEY ("pakketversieId","referentiecomponentId","type")
);

-- CreateTable
CREATE TABLE "PakketversieStandaard" (
    "pakketversieId" TEXT NOT NULL,
    "standaardversieId" TEXT NOT NULL,
    "compliancy" BOOLEAN,
    "testrappportUrl" TEXT,
    "compliancyIndicated" BOOLEAN,

    CONSTRAINT "PakketversieStandaard_pkey" PRIMARY KEY ("pakketversieId","standaardversieId")
);

-- CreateTable
CREATE TABLE "PakketversieApplicatiefunctie" (
    "pakketversieId" TEXT NOT NULL,
    "applicatiefunctieId" TEXT NOT NULL,
    "ondersteund" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PakketversieApplicatiefunctie_pkey" PRIMARY KEY ("pakketversieId","applicatiefunctieId")
);

-- CreateTable
CREATE TABLE "PakketversieTechnologie" (
    "pakketversieId" TEXT NOT NULL,
    "technologie" TEXT NOT NULL,

    CONSTRAINT "PakketversieTechnologie_pkey" PRIMARY KEY ("pakketversieId","technologie")
);

-- CreateTable
CREATE TABLE "Gemeente" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "cbsCode" TEXT,
    "contactpersoon" TEXT,
    "email" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gemeente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GemeentePakket" (
    "gemeenteId" TEXT NOT NULL,
    "pakketversieId" TEXT NOT NULL,
    "status" TEXT,
    "datumIngangStatus" TIMESTAMP(3),
    "technologie" TEXT,
    "mutatiedatum" TIMESTAMP(3),

    CONSTRAINT "GemeentePakket_pkey" PRIMARY KEY ("gemeenteId","pakketversieId")
);

-- CreateTable
CREATE TABLE "Samenwerking" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "type" TEXT,
    "contactpersoon" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Samenwerking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SamenwerkingGemeente" (
    "samenwerkingId" TEXT NOT NULL,
    "gemeenteId" TEXT NOT NULL,

    CONSTRAINT "SamenwerkingGemeente_pkey" PRIMARY KEY ("samenwerkingId","gemeenteId")
);

-- CreateTable
CREATE TABLE "ExternPakket" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "leverancierNaam" TEXT,
    "versie" TEXT,
    "beschrijving" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternPakket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Applicatiefunctie_naam_key" ON "Applicatiefunctie"("naam");

-- CreateIndex
CREATE UNIQUE INDEX "Leverancier_slug_key" ON "Leverancier"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Addendum_naam_key" ON "Addendum"("naam");

-- CreateIndex
CREATE UNIQUE INDEX "Pakket_slug_key" ON "Pakket"("slug");

-- AddForeignKey
ALTER TABLE "Standaardversie" ADD CONSTRAINT "Standaardversie_standaardId_fkey" FOREIGN KEY ("standaardId") REFERENCES "Standaard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeverancierAddendum" ADD CONSTRAINT "LeverancierAddendum_leverancierId_fkey" FOREIGN KEY ("leverancierId") REFERENCES "Leverancier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeverancierAddendum" ADD CONSTRAINT "LeverancierAddendum_addendumId_fkey" FOREIGN KEY ("addendumId") REFERENCES "Addendum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pakket" ADD CONSTRAINT "Pakket_leverancierId_fkey" FOREIGN KEY ("leverancierId") REFERENCES "Leverancier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pakketversie" ADD CONSTRAINT "Pakketversie_pakketId_fkey" FOREIGN KEY ("pakketId") REFERENCES "Pakket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PakketversieReferentiecomponent" ADD CONSTRAINT "PakketversieReferentiecomponent_pakketversieId_fkey" FOREIGN KEY ("pakketversieId") REFERENCES "Pakketversie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PakketversieReferentiecomponent" ADD CONSTRAINT "PakketversieReferentiecomponent_referentiecomponentId_fkey" FOREIGN KEY ("referentiecomponentId") REFERENCES "Referentiecomponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PakketversieStandaard" ADD CONSTRAINT "PakketversieStandaard_pakketversieId_fkey" FOREIGN KEY ("pakketversieId") REFERENCES "Pakketversie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PakketversieStandaard" ADD CONSTRAINT "PakketversieStandaard_standaardversieId_fkey" FOREIGN KEY ("standaardversieId") REFERENCES "Standaardversie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PakketversieApplicatiefunctie" ADD CONSTRAINT "PakketversieApplicatiefunctie_pakketversieId_fkey" FOREIGN KEY ("pakketversieId") REFERENCES "Pakketversie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PakketversieApplicatiefunctie" ADD CONSTRAINT "PakketversieApplicatiefunctie_applicatiefunctieId_fkey" FOREIGN KEY ("applicatiefunctieId") REFERENCES "Applicatiefunctie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PakketversieTechnologie" ADD CONSTRAINT "PakketversieTechnologie_pakketversieId_fkey" FOREIGN KEY ("pakketversieId") REFERENCES "Pakketversie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GemeentePakket" ADD CONSTRAINT "GemeentePakket_gemeenteId_fkey" FOREIGN KEY ("gemeenteId") REFERENCES "Gemeente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GemeentePakket" ADD CONSTRAINT "GemeentePakket_pakketversieId_fkey" FOREIGN KEY ("pakketversieId") REFERENCES "Pakketversie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SamenwerkingGemeente" ADD CONSTRAINT "SamenwerkingGemeente_samenwerkingId_fkey" FOREIGN KEY ("samenwerkingId") REFERENCES "Samenwerking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SamenwerkingGemeente" ADD CONSTRAINT "SamenwerkingGemeente_gemeenteId_fkey" FOREIGN KEY ("gemeenteId") REFERENCES "Gemeente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
