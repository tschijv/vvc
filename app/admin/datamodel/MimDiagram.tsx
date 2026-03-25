/**
 * Dynamisch MIM UML-klassendiagram als SVG.
 * Genereert het diagram uit de domeinen/koppelklassen data-arrays.
 * Geen hardcoded SVG-bestand nodig — altijd in sync met het datamodel.
 */

const COLORS: Record<string, { bg: string; border: string; header: string }> = {
  Pakketdomein:        { bg: "#e8f0fe", border: "#2171B5", header: "#1a6ca8" },
  "GEMMA-domein":      { bg: "#e8f0fe", border: "#2171B5", header: "#1a6ca8" },
  Organisatiedomein:   { bg: "#e0f5e0", border: "#41AB5D", header: "#16813d" },
  Integratiedomein:    { bg: "#fff3cd", border: "#FFA500", header: "#b87a00" },
  Gebruikersdomein:    { bg: "#f0e0ff", border: "#7A3DB8", header: "#5b2d8e" },
  Contentdomein:       { bg: "#e0f5f0", border: "#2d9d78", header: "#1a7a5c" },
  Auditdomein:         { bg: "#f0f0f0", border: "#888888", header: "#555555" },
  Configuratiedomein:  { bg: "#fff0e0", border: "#e35b10", header: "#c44b0a" },
};

type Objecttype = { naam: string; attrs: string; stereotype?: string };
type Domein = { naam: string; objecttypen: Objecttype[] };
type Koppelklasse = { naam: string; tussen: string; attrs: string };

const BOX_W = 260;
const BOX_HEADER_H = 28;
const ATTR_LINE_H = 16;
const BOX_PAD = 8;
const GAP_X = 30;
const GAP_Y = 20;
const COLS = 3;

function boxHeight(ot: Objecttype): number {
  const attrCount = ot.attrs.split(",").length;
  return BOX_HEADER_H + BOX_PAD * 2 + attrCount * ATTR_LINE_H + 4;
}

function domeinHeight(d: Domein): number {
  const rows = Math.ceil(d.objecttypen.length / 2);
  let maxRowH = 0;
  for (let r = 0; r < rows; r++) {
    const items = d.objecttypen.slice(r * 2, r * 2 + 2);
    maxRowH += Math.max(...items.map(boxHeight)) + GAP_Y;
  }
  return maxRowH + 50; // header + padding
}

export default function MimDiagram({
  domeinen,
  koppelklassen,
}: {
  domeinen: Domein[];
  koppelklassen: Koppelklasse[];
}) {
  // Layout: arrange domains in columns
  const colHeights = Array(COLS).fill(0);
  const domeinPositions: { d: Domein; x: number; y: number; w: number; h: number }[] = [];

  const DOMAIN_W = BOX_W * 2 + GAP_X + 40;

  for (const d of domeinen) {
    const shortestCol = colHeights.indexOf(Math.min(...colHeights));
    const x = shortestCol * (DOMAIN_W + GAP_X) + 20;
    const y = colHeights[shortestCol] + 20;
    const h = domeinHeight(d);
    domeinPositions.push({ d, x, y, w: DOMAIN_W, h });
    colHeights[shortestCol] += h + GAP_Y;
  }

  const totalW = COLS * (DOMAIN_W + GAP_X) + 20;
  const totalH = Math.max(...colHeights) + 80;

  // Koppelklassen section below
  const kkY = totalH;
  const kkH = koppelklassen.length * 24 + 60;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalW} ${totalH + kkH}`}
      className="w-full"
      style={{ minWidth: 900 }}
    >
      <style>{`
        text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .domain-title { font-size: 14px; font-weight: 700; }
        .box-title { font-size: 11px; font-weight: 600; fill: white; }
        .box-attr { font-size: 10px; fill: #475569; }
        .box-stereo { font-size: 9px; fill: #94a3b8; font-style: italic; }
        .kk-title { font-size: 13px; font-weight: 700; fill: #334155; }
        .kk-text { font-size: 10px; fill: #475569; }
        .kk-name { font-size: 10px; fill: #1a6ca8; font-weight: 600; }
      `}</style>

      {/* Background */}
      <rect width={totalW} height={totalH + kkH} fill="#fafafa" rx="8" />

      {/* Domain groups */}
      {domeinPositions.map(({ d, x, y, w, h }) => {
        const colors = COLORS[d.naam] || COLORS.Configuratiedomein;
        let boxY = y + 36;

        return (
          <g key={d.naam}>
            {/* Domain background */}
            <rect x={x} y={y} width={w} height={h} rx="6" fill={colors.bg} stroke={colors.border} strokeWidth="1.5" opacity="0.6" />
            <text x={x + 12} y={y + 22} className="domain-title" fill={colors.header}>{d.naam}</text>

            {/* Object types */}
            {d.objecttypen.map((ot, i) => {
              const col = i % 2;
              if (i > 0 && col === 0) {
                // New row — advance Y
                const prevRow = d.objecttypen.slice(Math.max(0, i - 2), i);
                boxY += Math.max(...prevRow.map(boxHeight)) + GAP_Y;
              }
              const bx = x + 16 + col * (BOX_W + GAP_X);
              const by = col === 0 || i === 0 ? boxY : boxY; // same row
              const bh = boxHeight(ot);
              const attrs = ot.attrs.split(",").map((a) => a.trim());

              return (
                <g key={ot.naam}>
                  {/* Box */}
                  <rect x={bx} y={by} width={BOX_W} height={bh} rx="4" fill="white" stroke={colors.border} strokeWidth="1" />
                  {/* Header */}
                  <rect x={bx} y={by} width={BOX_W} height={BOX_HEADER_H} rx="4" fill={colors.header} />
                  <rect x={bx} y={by + BOX_HEADER_H - 4} width={BOX_W} height={4} fill={colors.header} />
                  <text x={bx + BOX_W / 2} y={by + 18} textAnchor="middle" className="box-title">
                    «Objecttype» {ot.naam}
                  </text>
                  {/* Stereotype */}
                  {ot.stereotype && (
                    <text x={bx + BOX_W / 2} y={by + BOX_HEADER_H + 14} textAnchor="middle" className="box-stereo">
                      {ot.stereotype}
                    </text>
                  )}
                  {/* Attributes */}
                  {attrs.map((attr, ai) => (
                    <text
                      key={ai}
                      x={bx + 10}
                      y={by + BOX_HEADER_H + BOX_PAD + (ot.stereotype ? 16 : 0) + (ai + 1) * ATTR_LINE_H}
                      className="box-attr"
                    >
                      {attr}
                    </text>
                  ))}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Koppelklassen section */}
      <rect x={20} y={kkY} width={totalW - 40} height={kkH} rx="6" fill="#f8f0ff" stroke="#7A3DB8" strokeWidth="1" opacity="0.5" />
      <text x={32} y={kkY + 24} className="kk-title">Koppelklassen (relatieobjecten)</text>
      {koppelklassen.map((kk, i) => (
        <g key={kk.naam}>
          <text x={32} y={kkY + 50 + i * 24} className="kk-name">{kk.naam}</text>
          <text x={220} y={kkY + 50 + i * 24} className="kk-text">{kk.tussen}</text>
          <text x={520} y={kkY + 50 + i * 24} className="kk-text">{kk.attrs}</text>
        </g>
      ))}
    </svg>
  );
}
