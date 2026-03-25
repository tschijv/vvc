import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/process/auth";
import { parseBody } from "@/process/validation";
import {
  getReviewsForPakket,
  createOrUpdateReview,
  deleteReview,
} from "@/service/review";
import { prisma } from "@/data/prisma";

const reviewSchema = z.object({
  pakketId: z.string().min(1, "pakketId is verplicht"),
  score: z.number().int().min(1).max(5, "Score moet tussen 1 en 5 zijn"),
  gebruiksgemak: z.number().int().min(1).max(5).nullable().optional(),
  ondersteuning: z.number().int().min(1).max(5).nullable().optional(),
  prijsKwaliteit: z.number().int().min(1).max(5).nullable().optional(),
  standaardenSupport: z.number().int().min(1).max(5).nullable().optional(),
  toelichting: z.string().max(2000).nullable().optional(),
  anoniem: z.boolean().optional().default(false),
});

const deleteSchema = z.object({
  id: z.string().min(1, "Review-ID is verplicht"),
});

/**
 * GET /api/reviews?pakketId=xxx
 * Get reviews for a pakket. Auth required.
 * Leverancier users only see reviews for their own pakketten.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const pakketId = req.nextUrl.searchParams.get("pakketId");
  if (!pakketId) {
    return NextResponse.json(
      { error: "pakketId parameter is verplicht" },
      { status: 400 }
    );
  }

  // Leverancier check: only their own pakketten
  if (session.user.role === "LEVERANCIER" && session.user.leverancierId) {
    const pakket = await prisma.pakket.findUnique({
      where: { id: pakketId },
      select: { leverancierId: true },
    });
    if (!pakket || pakket.leverancierId !== session.user.leverancierId) {
      return NextResponse.json(
        { error: "Geen toegang tot reviews van dit pakket" },
        { status: 403 }
      );
    }
  }

  const reviews = await getReviewsForPakket(pakketId);
  return NextResponse.json({ reviews });
}

/**
 * POST /api/reviews
 * Create or update a review. Only GEMEENTE or ADMIN users with an organisatieId.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const role = session.user.role;
  const organisatieId = session.user.organisatieId;

  if (!["GEMEENTE", "ADMIN"].includes(role) || !organisatieId) {
    return NextResponse.json(
      { error: "Alleen gemeente-gebruikers kunnen reviews plaatsen" },
      { status: 403 }
    );
  }

  const parsed = await parseBody(req, reviewSchema);
  if ("error" in parsed) return parsed.error;

  const { pakketId, score, gebruiksgemak, ondersteuning, prijsKwaliteit, standaardenSupport, toelichting, anoniem } =
    parsed.data;

  const review = await createOrUpdateReview({
    pakketId,
    organisatieId,
    userId: session.user.id,
    score,
    gebruiksgemak: gebruiksgemak ?? null,
    ondersteuning: ondersteuning ?? null,
    prijsKwaliteit: prijsKwaliteit ?? null,
    standaardenSupport: standaardenSupport ?? null,
    toelichting: toelichting ?? null,
    anoniem,
  });

  return NextResponse.json({ review }, { status: 200 });
}

/**
 * DELETE /api/reviews
 * Delete own review (or any review if admin).
 */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const parsed = await parseBody(req, deleteSchema);
  if ("error" in parsed) return parsed.error;

  const isAdmin = session.user.role === "ADMIN";
  const result = await deleteReview(parsed.data.id, session.user.id, isAdmin);

  if (!result) {
    return NextResponse.json(
      { error: "Review niet gevonden of geen rechten" },
      { status: 404 }
    );
  }

  return NextResponse.json({ deleted: true });
}
