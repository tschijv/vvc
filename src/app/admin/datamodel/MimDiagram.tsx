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

  // Compute orthogonal relation lines with bendpoints
  type Line = {
    points: { x: number; y: number }[];
    label?: string;
    cardVan?: string;
    cardNaar?: string;
  };
  const lines: Line[] = [];
  const usedOffsets = new Map<string, number>(); // prevent overlapping lines

  for (const rel of relaties) {
    const from = boxPositions.get(rel.van);
    const to = boxPositions.get(rel.naar);
    if (!from || !to) continue;

    // Determine best connection sides
    const key = `${rel.van}-${rel.naar}`;
    const offset = (usedOffsets.get(key) || 0);
    usedOffsets.set(key, offset + 12);

    // Decide: connect bottom→top if target is below, else right→left
    const fromCx = from.x + from.w / 2 + offset;
    const fromCy = from.y + from.h / 2;
    const toCx = to.x + to.w / 2 + offset;
    const toCy = to.y + to.h / 2;

    const dx = Math.abs(fromCx - toCx);
    const dy = Math.abs(fromCy - toCy);

    let points: { x: number; y: number }[];

    if (dy > dx * 0.5) {
      // Vertical: exit bottom, enter top (orthogonal with horizontal segment)
      const x1 = fromCx;
      const y1 = from.y + from.h;
      const x2 = toCx;
      const y2 = to.y;
      const midY = (y1 + y2) / 2;
      points = [
        { x: x1, y: y1 },
        { x: x1, y: midY },
        { x: x2, y: midY },
        { x: x2, y: y2 },
      ];
    } else {
      // Horizontal: exit right, enter left (orthogonal with vertical segment)
      const goRight = toCx > fromCx;
      const x1 = goRight ? from.x + from.w : from.x;
      const y1 = fromCy;
      const x2 = goRight ? to.x : to.x + to.w;
      const y2 = toCy;
      const midX = (x1 + x2) / 2;
      points = [
        { x: x1, y: y1 },
        { x: midX, y: y1 },
        { x: midX, y: y2 },
        { x: x2, y: y2 },
      ];
    }

    lines.push({ points, label: rel.label, cardVan: rel.cardVan, cardNaar: rel.cardNaar });
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalW} ${totalH}`}
      className="w-full"
      style={{ minWidth: 900 }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
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
        .rel-label { font-size: 9px; fill: #334155; font-weight: 500; }
        .rel-card { font-size: 9px; fill: #1a6ca8; font-weight: 700; }
        .kk-box-title { font-size: 9px; font-weight: 600; fill: #5b2d8e; }
        .kk-box-sub { font-size: 8px; fill: #94a3b8; }
      `}</style>

      <rect width={totalW} height={totalH} fill="#fafafa" rx="8" />

      {/* Relation lines (behind boxes) — orthogonal with bendpoints */}
      {lines.map((l, i) => {
        const pts = l.points;
        const pathD = pts.map((p, j) => `${j === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        const first = pts[0];
        const last = pts[pts.length - 1];
        // Label at midpoint of middle segment
        const mid1 = pts[Math.floor(pts.length / 2) - 1];
        const mid2 = pts[Math.floor(pts.length / 2)];
        const labelX = (mid1.x + mid2.x) / 2;
        const labelY = (mid1.y + mid2.y) / 2;

        return (
          <g key={`rel-${i}`}>
            <path
              d={pathD}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
            />
            {l.label && (
              <>
                <rect
                  x={labelX - l.label.length * 2.8 - 4}
                  y={labelY - 10}
                  width={l.label.length * 5.6 + 8}
                  height={14}
                  rx="3"
                  fill="white"
                  fillOpacity="0.9"
                />
                <text x={labelX} y={labelY} textAnchor="middle" className="rel-label">
                  {l.label}
                </text>
              </>
            )}
            {l.cardVan && (
              <text x={first.x + 8} y={first.y + 14} className="rel-card">{l.cardVan}</text>
            )}
            {l.cardNaar && (
              <text x={last.x + 8} y={last.y - 8} className="rel-card">{l.cardNaar}</text>
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
