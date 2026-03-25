import { Stars } from "@/ui/components/ReviewStats";
import ReviewForm from "@/ui/components/ReviewForm";

type Review = {
  id: string;
  score: number;
  gebruiksgemak: number | null;
  ondersteuning: number | null;
  prijsKwaliteit: number | null;
  standaardenSupport: number | null;
  toelichting: string | null;
  anoniem: boolean;
  createdAt: Date | string;
  organisatie: { id: string; naam: string };
  user: { id: string; naam: string };
};

type ReviewListProps = {
  reviews: Review[];
  pakketId: string;
  /** The current user's organisatie ID, if any */
  userOrganisatieId?: string | null;
  /** Whether the current user is logged in */
  isLoggedIn: boolean;
  /** Existing review by the user's organisatie */
  myReview?: {
    id: string;
    score: number;
    gebruiksgemak: number | null;
    ondersteuning: number | null;
    prijsKwaliteit: number | null;
    standaardenSupport: number | null;
    toelichting: string | null;
    anoniem: boolean;
  } | null;
};

/**
 * List of reviews for a pakket.
 * Shows organisation name (or "Anoniem"), stars, date, and toelichting.
 * Includes action button (new review or edit existing).
 */
export default function ReviewList({
  reviews,
  pakketId,
  userOrganisatieId,
  isLoggedIn,
  myReview,
}: ReviewListProps) {
  const canReview = isLoggedIn && !!userOrganisatieId;

  return (
    <div>
      {/* Action button */}
      {canReview && (
        <div className="mb-4">
          <ReviewForm
            pakketId={pakketId}
            existing={myReview}
            buttonLabel={myReview ? "Mijn review bewerken" : "Beoordeel dit pakket"}
          />
        </div>
      )}

      {/* Reviews */}
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
          Nog geen reviews geplaatst.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const date =
              typeof review.createdAt === "string"
                ? new Date(review.createdAt)
                : review.createdAt;
            const isOwn = review.organisatie.id === userOrganisatieId;

            return (
              <div
                key={review.id}
                className={`border rounded-lg p-4 ${
                  isOwn
                    ? "border-[#1a6ca8]/30 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                        {review.anoniem ? "Anoniem" : review.organisatie.naam}
                      </span>
                      {isOwn && (
                        <span className="text-xs bg-[#1a6ca8]/10 text-[#1a6ca8] dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded">
                          Uw review
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Stars score={review.score} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {date.toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                {review.toelichting && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">
                    {review.toelichting}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
