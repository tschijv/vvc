"use client";

type RadarChartProps = {
  /** Average score for each of the 4 axes, 0-5 */
  gebruiksgemak: number;
  ondersteuning: number;
  prijsKwaliteit: number;
  standaardenSupport: number;
};

const LABELS = ["Gebruiksgemak", "Ondersteuning", "Prijs/kwaliteit", "Standaarden"];
const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 90;

/**
 * Calculate the (x, y) position for a value on a given axis.
 * @param axisIndex - 0-3 for the four axes
 * @param value - 0-5 score
 * @returns [x, y] coordinates
 */
function getPoint(axisIndex: number, value: number): [number, number] {
  const angle = (Math.PI * 2 * axisIndex) / 4 - Math.PI / 2;
  const r = (value / 5) * RADIUS;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

/**
 * Pure SVG radar/spider chart with 4 axes for review sub-scores.
 * Client component for potential future interactivity (tooltips, hover).
 */
export default function RadarChart({
  gebruiksgemak,
  ondersteuning,
  prijsKwaliteit,
  standaardenSupport,
}: RadarChartProps) {
  const values = [gebruiksgemak, ondersteuning, prijsKwaliteit, standaardenSupport];
  const hasData = values.some((v) => v > 0);

  if (!hasData) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center">
        Onvoldoende data voor een radargrafiek.
      </div>
    );
  }

  // Grid rings at 1, 2, 3, 4, 5
  const gridLevels = [1, 2, 3, 4, 5];

  // Data polygon points
  const dataPoints = values.map((v, i) => getPoint(i, v));
  const polygonStr = dataPoints.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div className="flex justify-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[240px] h-auto"
        role="img"
        aria-label="Radargrafiek van deelscores"
      >
        {/* Grid rings */}
        {gridLevels.map((level) => {
          const points = [0, 1, 2, 3].map((i) => getPoint(i, level));
          return (
            <polygon
              key={level}
              points={points.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="none"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Axis lines */}
        {[0, 1, 2, 3].map((i) => {
          const [x, y] = getPoint(i, 5);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-gray-300 dark:text-gray-600"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonStr}
          fill="rgba(26, 108, 168, 0.2)"
          stroke="#1a6ca8"
          strokeWidth={2}
        />

        {/* Data points */}
        {dataPoints.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill="#1a6ca8"
            stroke="white"
            strokeWidth={1}
          />
        ))}

        {/* Labels */}
        {LABELS.map((label, i) => {
          const [x, y] = getPoint(i, 6.2);
          const anchor = i === 0 || i === 2 ? "middle" : i === 1 ? "start" : "end";
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-gray-600 dark:fill-gray-400 text-[9px]"
            >
              {label}
            </text>
          );
        })}

        {/* Score labels on each data point */}
        {dataPoints.map(([x, y], i) => {
          if (values[i] === 0) return null;
          return (
            <text
              key={`val-${i}`}
              x={x}
              y={y - 8}
              textAnchor="middle"
              className="fill-[#1a6ca8] dark:fill-blue-400 text-[8px] font-bold"
            >
              {values[i]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
