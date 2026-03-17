// Scrape applicatiefuncties from softwarecatalogus.nl
const BASE = 'https://www.softwarecatalogus.nl';

async function scrapePakket(url) {
  const resp = await fetch(BASE + url);
  if (resp.status !== 200) return [];
  const html = await resp.text();

  const match = html.match(/Applicatiefunctie[\s\S]*?<\/table>/g);
  if (!match) return [];

  const rowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/g;
  const results = [];
  let m;
  while ((m = rowRegex.exec(match[0])) !== null) {
    const refcomp = m[1].replace(/<[^>]+>/g, '').trim();
    const functie = m[2].replace(/<[^>]+>/g, '').trim();
    if (functie && functie !== 'Applicatiefunctie' && refcomp !== 'Referentiecomponent') {
      results.push({ refcomp, functie });
    }
  }
  return results;
}

async function getAllPakketLinks() {
  // Fetch the pakketten page to get all links
  const resp = await fetch(BASE + '/pakketten');
  const html = await resp.text();
  const linkRegex = /href="(\/pakket\/[^"]+)"/g;
  const links = new Set();
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    if (!m[1].includes('?')) links.add(m[1]);
  }
  return [...links];
}

async function main() {
  console.log('Fetching package list...');
  const links = await getAllPakketLinks();
  console.log(`Found ${links.length} packages to scrape`);

  const allFuncties = new Map(); // functie -> Set<refcomp>
  let scraped = 0;
  let withFuncties = 0;

  // Process in batches of 5
  for (let i = 0; i < links.length; i += 5) {
    const batch = links.slice(i, i + 5);
    const results = await Promise.all(batch.map(url => scrapePakket(url)));

    for (const functies of results) {
      scraped++;
      if (functies.length > 0) withFuncties++;
      for (const { refcomp, functie } of functies) {
        if (!allFuncties.has(functie)) allFuncties.set(functie, new Set());
        allFuncties.get(functie).add(refcomp);
      }
    }

    if (scraped % 50 === 0) {
      console.log(`  Scraped ${scraped}/${links.length}, found ${allFuncties.size} unique functies so far...`);
    }
  }

  console.log(`\nDone! Scraped ${scraped} packages, ${withFuncties} had applicatiefuncties.`);
  console.log(`Found ${allFuncties.size} unique applicatiefuncties.\n`);

  // Output as JSON
  const output = [...allFuncties.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, refcomps]) => ({ naam: name, referentiecomponenten: [...refcomps].sort() }));

  const fs = await import('fs');
  fs.writeFileSync('/tmp/swc_exports/applicatiefuncties.json', JSON.stringify(output, null, 2));
  console.log(`Saved to /tmp/swc_exports/applicatiefuncties.json`);

  // Print summary
  for (const item of output) {
    console.log(`  ${item.naam} [${item.referentiecomponenten.join(', ')}]`);
  }
}

main().catch(console.error);
