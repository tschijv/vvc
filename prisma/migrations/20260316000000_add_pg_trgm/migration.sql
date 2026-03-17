-- Enable pg_trgm extension for fuzzy/trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add GIN indexes for trigram similarity on frequently searched columns
CREATE INDEX IF NOT EXISTS idx_pakket_naam_trgm ON "Pakket" USING GIN (naam gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leverancier_naam_trgm ON "Leverancier" USING GIN (naam gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_gemeente_naam_trgm ON "Gemeente" USING GIN (naam gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_standaard_naam_trgm ON "Standaard" USING GIN (naam gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_referentiecomponent_naam_trgm ON "Referentiecomponent" USING GIN (naam gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_begrip_term_trgm ON "Begrip" USING GIN (term gin_trgm_ops);
