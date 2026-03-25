/**
 * Dynamisch MIM UML-klassendiagram als SVG.
 * Genereert het diagram uit de domeinen/koppelklassen/relaties data-arrays.
 * Geen hardcoded SVG-bestand nodig — altijd in sync met het datamodel.
 */

import type { Domein, Koppelklasse, Relatie } from "./datamodel-data";

const COLORS: Record<string, { bg: string; border: string; header: string }> = {
  Pakketdomein:        { bg: "#e8f0fe", border: "#2171B5", header: "#1a6ca8" },
  "Domein referentie-architectuur": { bg: "#e8f0fe", border: "#2171B5", header: "#1a6ca8" },
  Organisatiedomein:   { bg: "#e0f5e0", border: "#41AB5D", header: "#16813d" },
  Integratiedomein:    { bg: "#fff3cd", border: "#FFA500", header: "#b87a00" },
  Gebruikersdomein:    { bg: "#f0e0ff", border: "#7A3DB8", header: "#5b2d8e" },
  Contentdomein:       { bg: "#e0f5f0", border: "#2d9d78", header: "#1a7a5c" },
  Auditdomein:         { bg: "#f0f0f0", border: "#888888", header: "#555555" },
  Configuratiedomein:  { bg: "#fff0e0", border: "#e35b10", header: "#c44b0a" },
};

const BOX_W = 260;
const BOX_HEADER_H = 28;
const ATTR_LINE_H = 16;
const BOX_PAD = 8;
const GAP_X = 30;
const GAP_Y = 20;
const COLS = 3;

function boxHeight(attrs: string, hasStereo: boolean): number {
  const attrCount = attrs.split(",").length;
  return BOX_HEADER_H + BOX_PAD * 2 + attrCount * ATTR_LINE_H + (hasStereo ? 16 : 0) + 4;
}

type BoxPos = { naam: string; x: number; y: number; w: number; h: number };

export default function MimDiagram({
  domeinen,
  koppelklassen,
  relaties,
}: {
  domeinen: Domein[];
  koppelklassen: Koppelklasse[];
  relaties: Relatie[];
}) {
  const DOMAIN_W = BOX_W * 2 + GAP_X + 40;
  const colHeights = Array(COLS).fill(0) as number[];
  const boxPositions = new Map<string, BoxPos>();

  // Layout domains in columns
  for (const d of domeinen) {
    const shortestCol = colHeights.indexOf(Math.min(...colHeights));
    const dx = shortestCol * (DOMAIN_W + GAP_X) + 20;
    let dy = (colHeights[shortestCol] as number) + 20;

    // Domain header
    const domainY = dy;
    dy += 36;

    let rowStartY = dy;
    for (let i = 0; i < d.objecttypen.length; i++) {
      const ot = d.objecttypen[i];
      const col = i % 2;
      if (i > 0 && col === 0) {
        const prevRow = d.objecttypen.slice(Math.max(0, i - 2), i);
        const maxH = Math.max(...prevRow.map((o) => boxHeight(o.attrs, !!o.stereotype)));
        rowStartY += maxH + GAP_Y;
      }
      const bx = dx + 16 + col * (BOX_W + GAP_X);
      const bh = boxHeight(ot.attrs, !!ot.stereotype);
      boxPositions.set(ot.naam, { naam: ot.naam, x: bx, y: rowStartY, w: BOX_W, h: bh });
    }

    // Compute domain height
    const lastOt = d.objecttypen[d.objecttypen.length - 1];
    const lastPos = lastOt ? boxPositions.get(lastOt.naam) : null;
    const domainH = lastPos ? (lastPos.y + lastPos.h - domainY + 16) : 60;
    colHeights[shortestCol] = domainY + domainH;
  }

  // Also position koppelklassen as small boxes
  const kkStartY = Math.max(...colHeights) + 40;
  for (let i = 0; i < koppelklassen.length; i++) {
    const kk = koppelklassen[i];
    const col = i % 3;
    const row = Math.floor(i / 3);
    const bx = 20 + col * (BOX_W + GAP_X + 30);
    const by = kkStartY + row * 50;
    boxPositions.set(kk.naam, { naam: kk.naam, x: bx, y: by, w: BOX_W, h: 36 });
  }

  const totalW = COLS * (DOMAIN_W + GAP_X) + 20;
  const kkRows = Math.ceil(koppelklassen.length / 3);
  const totalH = kkStartY + kkRows * 50 + 40;

  // Compute relation lines
  const lines: { x1: number; y1: number; x2: number; y2: number; label?: string; cardVan?: string; cardNaar?: string }[] = [];
  for (const rel of relaties) {
    const from = boxPositions.get(rel.van);
    const to = boxPositions.get(rel.naar);
    if (!from || !to) continue;

    // Connect from center-right/bottom of source to center-left/top of target
    const x1 = from.x + from.w / 2;
    const y1 = from.y + from.h;
    const x2 = to.x + to.w / 2;
    const y2 = to.y;

    lines.push({ x1, y1, x2, y2, label: rel.label, cardVan: rel.cardVan, cardNaar: rel.cardNaar });
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalW} ${totalH}`}
      className="w-full"
      style={{ minWidth: 900 }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
        </marker>
        <marker id="diamond" markerWidth="10" markerHeight="8" refX="0" refY="4" orient="auto">
          <polygon points="5 0, 10 4, 5 8, 0 4" fill="white" stroke="#94a3b8" strokeWidth="1" />
        </marker>
      </defs>

      <style>{`
        text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .domain-title { font-size: 13px; font-weight: 700; }
        .box-title { font-size: 10px; font-weight: 600; fill: white; }
        .box-attr { font-size: 9px; fill: #475569; }
        .box-stereo { font-size: 8px; fill: #94a3b8; font-style: italic; }
        .rel-label { font-size: 8px; fill: #64748b; }
        .rel-card { font-size: 8px; fill: #1a6ca8; font-weight: 600; }
        .kk-box-title { font-size: 9px; font-weight: 600; fill: #5b2d8e; }
        .kk-box-sub { font-size: 8px; fill: #94a3b8; }
      `}</style>

      <rect width={totalW} height={totalH} fill="#fafafa" rx="8" />

      {/* Relation lines (behind boxes) */}
      {lines.map((l, i) => {
        const midY = (l.y1 + l.y2) / 2;
        return (
          <g key={`rel-${i}`}>
            <path
              d={`M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1"
              markerEnd="url(#arrowhead)"
            />
            {l.label && (
              <text x={(l.x1 + l.x2) / 2} y={midY - 4} textAnchor="middle" className="rel-label">
                {l.label}
              </text>
            )}
            {l.cardVan && (
              <text x={l.x1 + 6} y={l.y1 + 12} className="rel-card">{l.cardVan}</text>
            )}
            {l.cardNaar && (
              <text x={l.x2 + 6} y={l.y2 - 6} className="rel-card">{l.cardNaar}</text>
            )}
          </g>
        );
      })}

      {/* Domain groups + boxes */}
      {domeinen.map((d) => {
        const colors = COLORS[d.naam] || COLORS.Configuratiedomein;
        const otPositions = d.objecttypen.map((ot) => boxPositions.get(ot.naam)!).filter(Boolean);
        if (otPositions.length === 0) return null;

        const minX = Math.min(...otPositions.map((p) => p.x)) - 16;
        const minY = Math.min(...otPositions.map((p) => p.y)) - 36;
        const maxX = Math.max(...otPositions.map((p) => p.x + p.w)) + 16;
        const maxY = Math.max(...otPositions.map((p) => p.y + p.h)) + 12;

        return (
          <g key={d.naam}>
            <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} rx="6" fill={colors.bg} stroke={colors.border} strokeWidth="1.5" opacity="0.5" />
            <text x={minX + 12} y={minY + 20} className="domain-title" fill={colors.header}>{d.naam}</text>

            {d.objecttypen.map((ot) => {
              const pos = boxPositions.get(ot.naam);
              if (!pos) return null;
              const attrs = ot.attrs.split(",").map((a) => a.trim());

              return (
                <g key={ot.naam}>
                  <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx="3" fill="white" stroke={colors.border} strokeWidth="1" />
                  <rect x={pos.x} y={pos.y} width={pos.w} height={BOX_HEADER_H} rx="3" fill={colors.header} />
                  <rect x={pos.x} y={pos.y + BOX_HEADER_H - 3} width={pos.w} height={3} fill={colors.header} />
                  <text x={pos.x + pos.w / 2} y={pos.y + 17} textAnchor="middle" className="box-title">
                    «Objecttype» {ot.naam}
                  </text>
                  {ot.stereotype && (
                    <text x={pos.x + pos.w / 2} y={pos.y + BOX_HEADER_H + 12} textAnchor="middle" className="box-stereo">
                      {ot.stereotype}
                    </text>
                  )}
                  {attrs.map((attr, ai) => (
                    <text
                      key={ai}
                      x={pos.x + 8}
                      y={pos.y + BOX_HEADER_H + BOX_PAD + (ot.stereotype ? 16 : 0) + (ai + 1) * ATTR_LINE_H}
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

      {/* Koppelklassen as small boxes */}
      {koppelklassen.map((kk) => {
        const pos = boxPositions.get(kk.naam);
        if (!pos) return null;
        return (
          <g key={kk.naam}>
            <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx="3" fill="#f8f0ff" stroke="#7A3DB8" strokeWidth="1" />
            <text x={pos.x + 8} y={pos.y + 15} className="kk-box-title">«Koppelklasse» {kk.naam}</text>
            <text x={pos.x + 8} y={pos.y + 28} className="kk-box-sub">{kk.tussen}</text>
          </g>
        );
      })}
    </svg>
  );
}
