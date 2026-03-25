type ReviewStatsProps = {
  avg: number;
  count: number;
  avgGebruiksgemak: number;
  avgOndersteuning: number;
  avgPrijsKwaliteit: number;
  avgStandaardenSupport: number;
  distribution: [number, number, number, number, number];
};

function Stars({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${score} van ${max} sterren`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(score);
        const half = !filled && i < score;
        return (
          <svg
            key={i}
            className={`w-4 h-4 ${filled ? "text-[#e35b10]" : half ? "text-[#e35b10]" : "text-gray-300 dark:text-gray-600"}`}
            fill={filled || half ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
      })}
    </span>
  );
}

function SubScoreBar({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  const pct = (value / 5) * 100;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-32 text-gray-600 dark:text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1a6ca8] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-gray-700 dark:text-gray-300 font-medium">{value}</span>
    </div>
  );
}

/**
 * Server component displaying aggregated review statistics.
 * Shows average score, star distribution bars, and sub-score progress bars.
 */
export default function ReviewStats({
  avg,
  count,
  avgGebruiksgemak,
  avgOndersteuning,
  avgPrijsKwaliteit,
  avgStandaardenSupport,
  distribution,
}: ReviewStatsProps) {
  if (count === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
        Nog geen reviews voor dit pakket.
      </div>
    );
  }

  const maxDist = Math.max(...distribution);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: overall score + distribution */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl font-bold text-[#1a6ca8] dark:text-blue-400">{avg}</span>
          <div>
            <Stars score={avg} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {count} {count === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        {/* Star distribution bars */}
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const starCount = distribution[star - 1];
            const pct = maxDist > 0 ? (starCount / maxDist) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-right text-gray-600 dark:text-gray-400">{star}</span>
                <svg className="w-3.5 h-3.5 text-[#e35b10]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#e35b10] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-gray-500 dark:text-gray-400 text-xs">
                  {starCount}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: sub-scores */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Deelscores
        </h4>
        <SubScoreBar label="Gebruiksgemak" value={avgGebruiksgemak} />
        <SubScoreBar label="Ondersteuning" value={avgOndersteuning} />
        <SubScoreBar label="Prijs/kwaliteit" value={avgPrijsKwaliteit} />
        <SubScoreBar label="Standaarden" value={avgStandaardenSupport} />
      </div>
    </div>
  );
}

export { Stars };
