-- Move relation tables from Pakketversie to Pakket level

-- 1. Create new tables
CREATE TABLE "PakketReferentiecomponent" (
    "pakketId" TEXT NOT NULL,
    "referentiecomponentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "aantalGemeenten" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PakketReferentiecomponent_pkey" PRIMARY KEY ("pakketId","referentiecomponentId","type")
);

CREATE TABLE "PakketStandaard" (
    "pakketId" TEXT NOT NULL,
    "standaardversieId" TEXT NOT NULL,
    "compliancy" BOOLEAN,
    "testrappportUrl" TEXT,
    "compliancyIndicated" BOOLEAN,
    CONSTRAINT "PakketStandaard_pkey" PRIMARY KEY ("pakketId","standaardversieId")
);

CREATE TABLE "PakketApplicatiefunctie" (
    "pakketId" TEXT NOT NULL,
    "applicatiefunctieId" TEXT NOT NULL,
    "ondersteund" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PakketApplicatiefunctie_pkey" PRIMARY KEY ("pakketId","applicatiefunctieId")
);

CREATE TABLE "PakketTechnologie" (
    "pakketId" TEXT NOT NULL,
    "technologie" TEXT NOT NULL,
    CONSTRAINT "PakketTechnologie_pkey" PRIMARY KEY ("pakketId","technologie")
);

-- 2. Migrate data from old tables
INSERT INTO "PakketReferentiecomponent" ("pakketId", "referentiecomponentId", "type", "aantalGemeenten")
SELECT DISTINCT pv."pakketId", pvr."referentiecomponentId", pvr."type", pvr."aantalGemeenten"
FROM "PakketversieReferentiecomponent" pvr
JOIN "Pakketversie" pv ON pv.id = pvr."pakketversieId";

INSERT INTO "PakketStandaard" ("pakketId", "standaardversieId", "compliancy", "testrappportUrl", "compliancyIndicated")
SELECT DISTINCT ON (pv."pakketId", pvs."standaardversieId") pv."pakketId", pvs."standaardversieId", pvs."compliancy", pvs."testrappportUrl", pvs."compliancyIndicated"
FROM "PakketversieStandaard" pvs
JOIN "Pakketversie" pv ON pv.id = pvs."pakketversieId"
ORDER BY pv."pakketId", pvs."standaardversieId", pv."createdAt" DESC;

INSERT INTO "PakketApplicatiefunctie" ("pakketId", "applicatiefunctieId", "ondersteund")
SELECT DISTINCT pv."pakketId", pva."applicatiefunctieId", pva."ondersteund"
FROM "PakketversieApplicatiefunctie" pva
JOIN "Pakketversie" pv ON pv.id = pva."pakketversieId";

INSERT INTO "PakketTechnologie" ("pakketId", "technologie")
SELECT DISTINCT pv."pakketId", pvt."technologie"
FROM "PakketversieTechnologie" pvt
JOIN "Pakketversie" pv ON pv.id = pvt."pakketversieId";

-- 3. Add foreign keys and indexes
ALTER TABLE "PakketReferentiecomponent" ADD CONSTRAINT "PakketReferentiecomponent_pakketId_fkey" FOREIGN KEY ("pakketId") REFERENCES "Pakket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PakketReferentiecomponent" ADD CONSTRAINT "PakketReferentiecomponent_referentiecomponentId_fkey" FOREIGN KEY ("referentiecomponentId") REFERENCES "Referentiecomponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "PakketReferentiecomponent_referentiecomponentId_idx" ON "PakketReferentiecomponent"("referentiecomponentId");

ALTER TABLE "PakketStandaard" ADD CONSTRAINT "PakketStandaard_pakketId_fkey" FOREIGN KEY ("pakketId") REFERENCES "Pakket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PakketStandaard" ADD CONSTRAINT "PakketStandaard_standaardversieId_fkey" FOREIGN KEY ("standaardversieId") REFERENCES "Standaardversie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "PakketStandaard_standaardversieId_idx" ON "PakketStandaard"("standaardversieId");
CREATE INDEX "PakketStandaard_compliancy_idx" ON "PakketStandaard"("compliancy");

ALTER TABLE "PakketApplicatiefunctie" ADD CONSTRAINT "PakketApplicatiefunctie_pakketId_fkey" FOREIGN KEY ("pakketId") REFERENCES "Pakket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PakketApplicatiefunctie" ADD CONSTRAINT "PakketApplicatiefunctie_applicatiefunctieId_fkey" FOREIGN KEY ("applicatiefunctieId") REFERENCES "Applicatiefunctie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PakketTechnologie" ADD CONSTRAINT "PakketTechnologie_pakketId_fkey" FOREIGN KEY ("pakketId") REFERENCES "Pakket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Drop old tables
DROP TABLE "PakketversieTechnologie";
DROP TABLE "PakketversieApplicatiefunctie";
DROP TABLE "PakketversieStandaard";
DROP TABLE "PakketversieReferentiecomponent";
