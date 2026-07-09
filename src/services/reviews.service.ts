import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, reviews, tours, user } from "@/lib/db/schema";
import { BOOKING_STATUS } from "@/constants";
import type { CreateReviewInput } from "@/schemas/profile";

export async function getApprovedTestimonials(limit = 6) {
  return db
    .select({
      review: reviews,
      userName: user.name,
      userImage: user.image,
      tourTitle: tours.title,
    })
    .from(reviews)
    .innerJoin(user, eq(reviews.userId, user.id))
    .innerJoin(tours, eq(reviews.tourId, tours.id))
    .where(eq(reviews.status, "approved"))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export async function getUserReviews(userId: string) {
  return db
    .select({
      review: reviews,
      tour: tours,
    })
    .from(reviews)
    .innerJoin(tours, eq(reviews.tourId, tours.id))
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt));
}

export async function getUserReviewCount(userId: string) {
  const [result] = await db
    .select({ total: count() })
    .from(reviews)
    .where(eq(reviews.userId, userId));

  return Number(result?.total ?? 0);
}

export async function getReviewableToursForUser(userId: string) {
  const completedBookings = await db
    .select({ tourId: bookings.tourId })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        eq(bookings.bookingStatus, BOOKING_STATUS.COMPLETED),
      ),
    );

  const tourIds = [...new Set(completedBookings.map((b) => b.tourId))];
  if (tourIds.length === 0) return [];

  const existingReviews = await db
    .select({ tourId: reviews.tourId })
    .from(reviews)
    .where(eq(reviews.userId, userId));

  const reviewedTourIds = new Set(existingReviews.map((r) => r.tourId));
  const unreviewedIds = tourIds.filter((id) => !reviewedTourIds.has(id));
  if (unreviewedIds.length === 0) return [];

  return db.select().from(tours).where(inArray(tours.id, unreviewedIds));
}

export async function createReview(userId: string, input: CreateReviewInput) {
  const [completedBooking] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        eq(bookings.tourId, input.tourId),
        eq(bookings.bookingStatus, BOOKING_STATUS.COMPLETED),
      ),
    )
    .limit(1);

  if (!completedBooking) {
    return {
      success: false as const,
      error: "You can only review tours you have completed.",
    };
  }

  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.tourId, input.tourId)))
    .limit(1);

  if (existing) {
    return { success: false as const, error: "You have already reviewed this tour." };
  }

  await db
    .insert(reviews)
    .values({
      userId,
      tourId: input.tourId,
      rating: input.rating,
      comment: input.comment,
      status: "pending",
    })
    .onConflictDoNothing({ target: [reviews.userId, reviews.tourId] })
    .returning();

  const [review] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.tourId, input.tourId)))
    .limit(1);

  if (!review) {
    return { success: false as const, error: "You have already reviewed this tour." };
  }

  return { success: true as const, data: review };
}
