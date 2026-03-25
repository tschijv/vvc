import { prisma } from "@/data/prisma";

// ─── Queries ────────────────────────────────────────────────────────────────────

/**
 * Get all reviews for a pakket, including organisatie name and user name.
 * @param pakketId - The pakket to fetch reviews for
 * @returns Array of reviews with related data
 */
export async function getReviewsForPakket(pakketId: string) {
  return prisma.pakketReview.findMany({
    where: { pakketId },
    include: {
      organisatie: { select: { id: true, naam: true } },
      user: { select: { id: true, naam: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get aggregated review statistics for a pakket.
 * @param pakketId - The pakket to calculate stats for
 * @returns Stats object with averages, count, and distribution
 */
export async function getReviewStats(pakketId: string) {
  const reviews = await prisma.pakketReview.findMany({
    where: { pakketId },
    select: {
      score: true,
      gebruiksgemak: true,
      ondersteuning: true,
      prijsKwaliteit: true,
      standaardenSupport: true,
    },
  });

  const count = reviews.length;
  if (count === 0) {
    return {
      avg: 0,
      count: 0,
      avgGebruiksgemak: 0,
      avgOndersteuning: 0,
      avgPrijsKwaliteit: 0,
      avgStandaardenSupport: 0,
      distribution: [0, 0, 0, 0, 0] as [number, number, number, number, number],
    };
  }

  const avg = reviews.reduce((sum, r) => sum + r.score, 0) / count;

  const withGebruiksgemak = reviews.filter((r) => r.gebruiksgemak !== null);
  const withOndersteuning = reviews.filter((r) => r.ondersteuning !== null);
  const withPrijsKwaliteit = reviews.filter((r) => r.prijsKwaliteit !== null);
  const withStandaardenSupport = reviews.filter((r) => r.standaardenSupport !== null);

  const avgGebruiksgemak =
    withGebruiksgemak.length > 0
      ? withGebruiksgemak.reduce((sum, r) => sum + r.gebruiksgemak!, 0) / withGebruiksgemak.length
      : 0;
  const avgOndersteuning =
    withOndersteuning.length > 0
      ? withOndersteuning.reduce((sum, r) => sum + r.ondersteuning!, 0) / withOndersteuning.length
      : 0;
  const avgPrijsKwaliteit =
    withPrijsKwaliteit.length > 0
      ? withPrijsKwaliteit.reduce((sum, r) => sum + r.prijsKwaliteit!, 0) / withPrijsKwaliteit.length
      : 0;
  const avgStandaardenSupport =
    withStandaardenSupport.length > 0
      ? withStandaardenSupport.reduce((sum, r) => sum + r.standaardenSupport!, 0) / withStandaardenSupport.length
      : 0;

  const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    distribution[r.score - 1]++;
  }

  return {
    avg: Math.round(avg * 10) / 10,
    count,
    avgGebruiksgemak: Math.round(avgGebruiksgemak * 10) / 10,
    avgOndersteuning: Math.round(avgOndersteuning * 10) / 10,
    avgPrijsKwaliteit: Math.round(avgPrijsKwaliteit * 10) / 10,
    avgStandaardenSupport: Math.round(avgStandaardenSupport * 10) / 10,
    distribution,
  };
}

/**
 * Get the existing review from a specific organisatie for a pakket.
 * @param pakketId - The pakket ID
 * @param organisatieId - The organisatie ID
 * @returns The review or null
 */
export async function getMyReview(pakketId: string, organisatieId: string) {
  return prisma.pakketReview.findUnique({
    where: {
      pakketId_organisatieId: { pakketId, organisatieId },
    },
  });
}

/**
 * Create or update a review (upsert on pakketId + organisatieId).
 * @param data - Review data including pakketId, organisatieId, userId, and scores
 * @returns The created or updated review
 */
export async function createOrUpdateReview(data: {
  pakketId: string;
  organisatieId: string;
  userId: string;
  score: number;
  gebruiksgemak?: number | null;
  ondersteuning?: number | null;
  prijsKwaliteit?: number | null;
  standaardenSupport?: number | null;
  toelichting?: string | null;
  anoniem?: boolean;
}) {
  const { pakketId, organisatieId, userId, ...rest } = data;
  return prisma.pakketReview.upsert({
    where: {
      pakketId_organisatieId: { pakketId, organisatieId },
    },
    create: {
      pakketId,
      organisatieId,
      userId,
      ...rest,
    },
    update: {
      userId,
      ...rest,
    },
  });
}

/**
 * Delete a review. Only the author or an admin may delete.
 * @param id - The review ID
 * @param userId - The requesting user's ID
 * @param isAdmin - Whether the requesting user is an admin
 * @returns The deleted review, or null if not authorized
 */
export async function deleteReview(id: string, userId: string, isAdmin: boolean) {
  const review = await prisma.pakketReview.findUnique({ where: { id } });
  if (!review) return null;
  if (review.userId !== userId && !isAdmin) return null;

  return prisma.pakketReview.delete({ where: { id } });
}

/**
 * Get top-rated pakketten by average review score.
 * @param limit - Max number of pakketten to return
 * @returns Array of pakketten with their average score
 */
export async function getTopRatedPakketten(limit: number = 10) {
  const results = await prisma.pakketReview.groupBy({
    by: ["pakketId"],
    _avg: { score: true },
    _count: { score: true },
    orderBy: { _avg: { score: "desc" } },
    take: limit,
  });

  if (results.length === 0) return [];

  const pakketIds = results.map((r) => r.pakketId);
  const pakketten = await prisma.pakket.findMany({
    where: { id: { in: pakketIds } },
    select: { id: true, naam: true, slug: true, leverancier: { select: { naam: true } } },
  });

  const pakketMap = new Map(pakketten.map((p) => [p.id, p]));

  return results
    .map((r) => ({
      pakket: pakketMap.get(r.pakketId)!,
      avgScore: Math.round((r._avg.score ?? 0) * 10) / 10,
      reviewCount: r._count.score,
    }))
    .filter((r) => r.pakket);
}

/**
 * Get all pakketten with their average review score.
 * @returns Map of pakketId to { avg, count }
 */
export async function getPakkettenWithAvgScore(): Promise<
  Map<string, { avg: number; count: number }>
> {
  const results = await prisma.pakketReview.groupBy({
    by: ["pakketId"],
    _avg: { score: true },
    _count: { score: true },
  });

  const map = new Map<string, { avg: number; count: number }>();
  for (const r of results) {
    map.set(r.pakketId, {
      avg: Math.round((r._avg.score ?? 0) * 10) / 10,
      count: r._count.score,
    });
  }
  return map;
}
