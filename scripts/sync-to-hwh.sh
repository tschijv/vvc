#!/bin/bash
# Sync generieke code van VVC naar HWH
# Gebruik: ./scripts/sync-to-hwh.sh

set -e
VVC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HWH_DIR="$VVC_DIR/../hwh"

if [ ! -d "$HWH_DIR" ]; then
  echo "❌ HWH directory niet gevonden: $HWH_DIR"
  exit 1
fi

echo "🔄 Syncing VVC → HWH..."

# Generieke bestanden synchroniseren
SYNC_DIRS=(
  "src/service"
  "src/process"
  "src/integration"
  "src/ui/components"
  "src/data"
  "prisma"
  "src/app/api"
  "src/app/pakketten"
  "src/app/pakketversies"
  "src/app/leveranciers"
  "src/app/standaarden"
  "src/app/referentiecomponenten"
  "src/app/applicatiefuncties"
  "src/app/begrippen"
  "src/app/koppelingen"
  "src/app/compliancy"
  "src/app/marktverdeling"
  "src/app/dienstverleners"
  "src/app/cloudproviders"
  "src/app/zoeken"
  "src/app/addenda"
  "src/app/samenwerkingen"
  "src/app/inkoop"
  "src/app/help"
  "src/app/auth"
  "src/app/profiel"
  "src/app/favorieten"
  "src/app/notificaties"
  "src/app/dashboard"
  "src/app/kaart"
  "src/app/admin"
  "helm"
)

SYNC_FILES=(
  "middleware.ts"
  "next.config.ts"
  "tsconfig.json"
  "vitest.config.ts"
  "Dockerfile"
  ".dockerignore"
  "publiccode.yml"
  "PROMPT.md"
)

for dir in "${SYNC_DIRS[@]}"; do
  if [ -d "$VVC_DIR/$dir" ]; then
    mkdir -p "$HWH_DIR/$dir"
    rsync -a --delete "$VVC_DIR/$dir/" "$HWH_DIR/$dir/"
  fi
done

for file in "${SYNC_FILES[@]}"; do
  if [ -f "$VVC_DIR/$file" ]; then
    cp "$VVC_DIR/$file" "$HWH_DIR/$file"
  fi
done

# NIET synchroniseren (HWH-specifiek):
# - tenant.config.ts
# - .env
# - public/data/ (GeoJSON)
# - public/logo.svg
# - src/app/page.tsx (homepage kan afwijken)
# - tenants/ (bevat beide configs)
# - package.json (naam verschilt)

echo "✅ Sync voltooid. ${#SYNC_DIRS[@]} directories + ${#SYNC_FILES[@]} bestanden."
echo "⚠️  Vergeet niet: cd ../hwh && npm run build && git add -A && git commit && git push"
