import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://voorzieningencatalogus.vng.nl";
const CHANNEL_TITLE = "VNG Voorzieningencatalogus";
const CHANNEL_DESCRIPTION =
  "Laatste pakketversies in de VNG Voorzieningencatalogus — overzicht van pakketten, leveranciers, standaarden en referentiecomponenten.";

async function getRecentPakketversies() {
  return prisma.pakketversie.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      pakket: {
        include: {
          leverancier: true,
        },
      },
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildRss(
  items: Awaited<ReturnType<typeof getRecentPakketversies>>
): string {
  const now = new Date().toUTCString();
  const itemsXml = items
    .map((pv) => {
      const title = `${pv.pakket.naam} ${pv.naam}`;
      const description = `Leverancier: ${pv.pakket.leverancier.naam}`;
      const link = `${SITE_URL}/pakketten/${pv.pakket.slug}`;
      const pubDate = pv.createdAt.toUTCString();
      return `    <item>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(pv.id)}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(CHANNEL_TITLE)}</title>
    <description>${escapeXml(CHANNEL_DESCRIPTION)}</description>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/api/feed" rel="self" type="application/rss+xml" />
    <language>nl</language>
    <lastBuildDate>${now}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;
}

function buildAtom(
  items: Awaited<ReturnType<typeof getRecentPakketversies>>
): string {
  const now = new Date().toISOString();
  const entriesXml = items
    .map((pv) => {
      const title = `${pv.pakket.naam} ${pv.naam}`;
      const summary = `Leverancier: ${pv.pakket.leverancier.naam}`;
      const link = `${SITE_URL}/pakketten/${pv.pakket.slug}`;
      const updated = pv.createdAt.toISOString();
      return `  <entry>
    <title>${escapeXml(title)}</title>
    <summary>${escapeXml(summary)}</summary>
    <link href="${escapeXml(link)}" />
    <id>urn:uuid:${pv.id}</id>
    <updated>${updated}</updated>
  </entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(CHANNEL_TITLE)}</title>
  <subtitle>${escapeXml(CHANNEL_DESCRIPTION)}</subtitle>
  <link href="${SITE_URL}" />
  <link href="${SITE_URL}/api/feed?format=atom" rel="self" type="application/atom+xml" />
  <id>${SITE_URL}/</id>
  <updated>${now}</updated>
${entriesXml}
</feed>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  try {
    const items = await getRecentPakketversies();

    if (format === "atom") {
      const xml = buildAtom(items);
      return new Response(xml, {
        headers: {
          "Content-Type": "application/atom+xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    const xml = buildRss(items);
    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Feed generation error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
