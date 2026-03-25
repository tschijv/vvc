#!/bin/bash
set -e

echo "=== Voorzieningencatalogus Setup ==="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "Node.js is niet geinstalleerd. Installeer Node.js 22+ via https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "Node.js $NODE_VERSION gevonden, maar 20+ is vereist."
  exit 1
fi
echo "Node.js $(node -v)"

# Check npm
echo "npm $(npm -v)"

# Install dependencies
echo ""
echo "Installeren van dependencies..."
npm install

# Check .env
if [ ! -f .env ]; then
  echo ""
  echo "Geen .env bestand gevonden. Kopieer het voorbeeld:"
  cat > .env.example << 'EOF'
# Database (Neon of lokale PostgreSQL)
DATABASE_URL="postgresql://vvc:vvc@localhost:5432/vvc"

# Auth
AUTH_SECRET="genereer-met-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optioneel
# ANTHROPIC_API_KEY="sk-..."          # AI-adviseur
# RESEND_API_KEY="re_..."             # E-mail
# MATOMO_URL="https://..."            # Analytics
# MATOMO_SITE_ID="1"
# BASIC_AUTH_USER="admin"             # Wachtwoordbeveiliging
# BASIC_AUTH_PASS="..."
EOF
  cp .env.example .env
  echo ""
  echo "  .env.example gekopieerd naar .env"
  echo "  Pas de DATABASE_URL aan naar je eigen database."
  echo ""
  echo "  Voor Neon (cloud): https://console.neon.tech"
  echo "  Voor Docker (lokaal): docker compose up -d"
  echo ""
fi

# Generate Prisma client
echo "Prisma client genereren..."
npx prisma generate

# Check database connection
echo ""
echo "Database verbinding testen..."
if npx prisma db push --accept-data-loss 2>/dev/null; then
  echo "Database is gesynchroniseerd."
else
  echo ""
  echo "  Kan niet verbinden met de database."
  echo "  Controleer DATABASE_URL in .env"
  echo ""
  echo "  Lokale database starten:"
  echo "    docker compose up -d"
  echo ""
  echo "  Daarna opnieuw: npx prisma db push"
  exit 1
fi

echo ""
echo "=== Setup voltooid! ==="
echo ""
echo "Start de applicatie met:"
echo "  npm run dev"
echo ""
echo "Open http://localhost:3000"
echo ""
echo "Andere commando's:"
echo "  npm run build         # Productie build"
echo "  npx vitest run        # Unit tests"
echo "  npx playwright test   # E2E tests"
echo "  npx prisma studio     # Database browser"
echo ""
