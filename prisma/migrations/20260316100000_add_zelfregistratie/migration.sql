-- AlterTable
ALTER TABLE "User" ADD COLUMN "registratieBron" TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE "User" ADD COLUMN "organisatieType" TEXT;
ALTER TABLE "User" ADD COLUMN "organisatieNaam" TEXT;
ALTER TABLE "User" ADD COLUMN "afgewezen" BOOLEAN NOT NULL DEFAULT false;
