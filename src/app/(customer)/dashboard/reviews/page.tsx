import type { Metadata } from "next";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewForm } from "@/features/reviews/components/review-form";
import { requireAuth } from "@/lib/session";
import { getReviewableToursForUser, getUserReviews } from "@/services/reviews.service";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = { title: "My Reviews" };

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

export default async function ReviewsPage() {
  const session = await requireAuth();
  const [reviews, reviewableTours] = await Promise.all([
    getUserReviews(session.user.id),
    getReviewableToursForUser(session.user.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">My Reviews</h1>
        <p className="text-muted-foreground mt-2">
          Reviews you&apos;ve submitted and tours waiting for your feedback.
        </p>
      </div>

      {reviewableTours.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">Leave a Review</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {reviewableTours.map((tour) => (
              <ReviewForm key={tour.id} tourId={tour.id} tourTitle={tour.title} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">Your Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(({ review, tour }) => (
              <Card key={review.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="text-base">{tour.title}</CardTitle>
                    <Badge variant={statusVariant[review.status] ?? "secondary"} className="capitalize">
                      {review.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{formatDate(review.createdAt)}</p>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </p>
                  <p className="text-muted-foreground text-sm">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                No reviews yet. Complete a tour to share your experience!
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
