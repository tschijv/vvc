"use client";

import { useState, useRef } from "react";

type DataPoint = {
  id: string;
  naam: string;
  aantalKlanten: number;
  aantalRefcomps: number;
  aantalPakketten: number;
};

type Props = {
  data: DataPoint[];
};

const CHART_W = 900;
const CHART_H = 500;
const PAD = { top: 30, right: 30, bottom: 50, left: 60 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;
const MIN_R = 5;
const MAX_R = 40;

export default function MarktverdelingChart({ data }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        Geen data beschikbaar
      </div>
    );
  }

  const maxX = Math.max(...data.map((d) => d.aantalRefcomps), 1);
  const maxY = Math.max(...data.map((d) => d.aantalKlanten), 1);
  const maxPakketten = Math.max(...data.map((d) => d.aantalPakketten), 1);

  // Nice round axis max
  const niceMax = (v: number) => {
    if (v <= 5) return v + 1;
    const mag = Math.pow(10, Math.floor(Math.log10(v)));
    return Math.ceil(v / mag) * mag;
  };
  const axisMaxX = niceMax(maxX);
  const axisMaxY = niceMax(maxY);

  const scaleX = (v: number) => PAD.left + (v / axisMaxX) * INNER_W;
  const scaleY = (v: number) => PAD.top + INNER_H - (v / axisMaxY) * INNER_H;
  const scaleR = (v: number) =>
    MIN_R + ((v - 1) / Math.max(maxPakketten - 1, 1)) * (MAX_R - MIN_R);

  // Grid lines
  const xTicks = Array.from({ length: 6 }, (_, i) =>
    Math.round((axisMaxX / 5) * i),
  );
  const yTicks = Array.from({ length: 6 }, (_, i) =>
    Math.round((axisMaxY / 5) * i),
  );

  // Sort by pakketaantal descending so small bubbles render on top
  const sorted = [...data].sort(
    (a, b) => b.aantalPakketten - a.aantalPakketten,
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full"
        style={{ maxHeight: 520 }}
      >
        {/* Grid lines */}
        {xTicks.map((t) => (
          <line
            key={`gx-${t}`}
            x1={scaleX(t)}
            y1={PAD.top}
            x2={scaleX(t)}
            y2={PAD.top + INNER_H}
            stroke="#f1f5f9"
            strokeWidth={1}
          />
        ))}
        {yTicks.map((t) => (
          <line
            key={`gy-${t}`}
            x1={PAD.left}
            y1={scaleY(t)}
            x2={PAD.left + INNER_W}
            y2={scaleY(t)}
            stroke="#f1f5f9"
            strokeWidth={1}
          />
        ))}

        {/* Axes */}
        <line
          x1={PAD.left}
          y1={PAD.top + INNER_H}
          x2={PAD.left + INNER_W}
          y2={PAD.top + INNER_H}
          stroke="#94a3b8"
          strokeWidth={1}
        />
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + INNER_H}
          stroke="#94a3b8"
          strokeWidth={1}
        />

        {/* X-axis ticks */}
        {xTicks.map((t) => (
          <text
            key={`xt-${t}`}
            x={scaleX(t)}
            y={PAD.top + INNER_H + 20}
            textAnchor="middle"
            fontSize={11}
            fill="#64748b"
          >
            {t}
          </text>
        ))}

        {/* Y-axis ticks */}
        {yTicks.map((t) => (
          <text
            key={`yt-${t}`}
            x={PAD.left - 10}
            y={scaleY(t) + 4}
            textAnchor="end"
            fontSize={11}
            fill="#64748b"
          >
            {t}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={PAD.left + INNER_W / 2}
          y={CHART_H - 5}
          textAnchor="middle"
          fontSize={12}
          fill="#475569"
          fontWeight={600}
        >
          Unieke referentiecomponenten
        </text>
        <text
          x={15}
          y={PAD.top + INNER_H / 2}
          textAnchor="middle"
          fontSize={12}
          fill="#475569"
          fontWeight={600}
          transform={`rotate(-90, 15, ${PAD.top + INNER_H / 2})`}
        >
          Aantal klanten (gemeenten)
        </text>

        {/* Bubbles */}
        {sorted.map((d) => {
          const cx = scaleX(d.aantalRefcomps);
          const cy = scaleY(d.aantalKlanten);
          const r = scaleR(d.aantalPakketten);
          const isHovered = hover === d.id;

          return (
            <g
              key={d.id}
              onMouseEnter={() => setHover(d.id)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={isHovered ? "#e35b10" : "#1a6ca8"}
                fillOpacity={isHovered ? 0.85 : 0.6}
                stroke={isHovered ? "#c44b0a" : "#1a6ca8"}
                strokeWidth={isHovered ? 2 : 1}
              />
              {/* Label for larger bubbles or hovered */}
              {(isHovered || (d.aantalPakketten >= 3 && r > 12)) && (
                <text
                  x={cx}
                  y={cy - r - 4}
                  textAnchor="middle"
                  fontSize={isHovered ? 12 : 10}
                  fontWeight={isHovered ? 700 : 400}
                  fill={isHovered ? "#c44b0a" : "#334155"}
                >
                  {d.naam}
                </text>
              )}
            </g>
          );
        })}

        {/* Tooltip for hovered */}
        {hover && (() => {
          const d = data.find((d) => d.id === hover);
          if (!d) return null;
          const tx = Math.min(scaleX(d.aantalRefcomps) + 15, CHART_W - 180);
          const ty = Math.max(scaleY(d.aantalKlanten) - 20, PAD.top + 10);
          return (
            <g>
              <rect
                x={tx}
                y={ty}
                width={170}
                height={68}
                rx={6}
                fill="white"
                stroke="#e2e8f0"
                strokeWidth={1}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              />
              <text x={tx + 8} y={ty + 18} fontSize={12} fontWeight={700} fill="#1e293b">
                {d.naam.length > 22 ? d.naam.slice(0, 22) + "…" : d.naam}
              </text>
              <text x={tx + 8} y={ty + 34} fontSize={11} fill="#64748b">
                Klanten: {d.aantalKlanten}
              </text>
              <text x={tx + 8} y={ty + 48} fontSize={11} fill="#64748b">
                Ref.componenten: {d.aantalRefcomps}
              </text>
              <text x={tx + 8} y={ty + 62} fontSize={11} fill="#64748b">
                Pakketten: {d.aantalPakketten}
              </text>
            </g>
          );
        })()}

        {/* Size legend */}
        <g transform={`translate(${CHART_W - 120}, ${PAD.top + 10})`}>
          <text fontSize={10} fill="#94a3b8" fontWeight={600}>
            Pakketten
          </text>
          {[1, Math.ceil(maxPakketten / 2), maxPakketten].map((v, i) => (
            <g key={v} transform={`translate(0, ${20 + i * 28})`}>
              <circle
                cx={MAX_R / 2}
                cy={0}
                r={scaleR(v)}
                fill="#1a6ca8"
                fillOpacity={0.3}
                stroke="#1a6ca8"
                strokeWidth={0.5}
              />
              <text
                x={MAX_R + 8}
                y={4}
                fontSize={10}
                fill="#64748b"
              >
                {v}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
