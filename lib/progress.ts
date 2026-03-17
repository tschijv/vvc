/**
 * Shared progress-to-stars utilities.
 * Centralises the star threshold logic used across kaart, dashboard, and gemeente pages.
 *
 * Thresholds: 0→1★, 25→2★, 50→3★, 75→4★, 100→5★
 */

/** Convert a progress percentage (0-100) to a 1-5 star count. */
export function progressToStars(progress: number): number {
  if (progress >= 100) return 5;
  if (progress >= 75) return 4;
  if (progress >= 50) return 3;
  if (progress >= 25) return 2;
  return 1;
}

/** Return an array of "★" / "☆" strings for visual display. */
export function sterrenDisplay(progress: number): string[] {
  const filled = progressToStars(progress);
  return Array.from({ length: 5 }, (_, i) => (i < filled ? "★" : "☆"));
}

/** Human-readable label for star count (Dutch). */
export const STAR_LABELS: Record<number, string> = {
  0: "Geen data",
  1: "1 ster",
  2: "2 sterren",
  3: "3 sterren",
  4: "4 sterren",
  5: "5 sterren",
};
