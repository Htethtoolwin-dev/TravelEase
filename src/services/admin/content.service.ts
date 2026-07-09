import { asc, count, desc, eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  blogs,
  bookings,
  categories,
  destinations,
  gallery,
  messages,
  newsletter,
  reviews,
  siteSettings,
  tours,
  user,
} from "@/lib/db/schema";
import type {
  BlogInput,
  CategoryInput,
  DestinationInput,
  GalleryInput,
  TourInput,
} from "@/schemas/admin";
import { parseListField } from "@/schemas/admin";
import { slugify } from "@/utils/slug";
import { BOOKING_STATUS, USER_ROLES } from "@/constants";

// ─── Destinations ───────────────────────────────────────────

export async function getAllDestinationsAdmin() {
  return db.select().from(destinations).orderBy(desc(destinations.createdAt));
}

export async function createDestination(input: DestinationInput) {
  const slug = input.slug || slugify(input.name);
  const [row] = await db
    .insert(destinations)
    .values({ ...input, slug })
    .returning();
  return row;
}

export async function updateDestination(id: string, input: DestinationInput) {
  const slug = input.slug || slugify(input.name);
  const [row] = await db
    .update(destinations)
    .set({ ...input, slug })
    .where(eq(destinations.id, id))
    .returning();
  return row;
}

export async function deleteDestination(id: string) {
  await db.delete(destinations).where(eq(destinations.id, id));
}

// ─── Categories ─────────────────────────────────────────────

export async function getAllCategoriesAdmin() {
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function createCategory(input: CategoryInput) {
  const slug = input.slug || slugify(input.name);
  const [row] = await db
    .insert(categories)
    .values({ ...input, slug })
    .returning();
  return row;
}

export async function updateCategory(id: string, input: CategoryInput) {
  const slug = input.slug || slugify(input.name);
  const [row] = await db
    .update(categories)
    .set({ ...input, slug })
    .where(eq(categories.id, id))
    .returning();
  return row;
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── Tours ──────────────────────────────────────────────────

export async function getAllToursAdmin() {
  return db
    .select({
      tour: tours,
      destination: destinations,
      category: categories,
    })
    .from(tours)
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .innerJoin(categories, eq(tours.categoryId, categories.id))
    .orderBy(desc(tours.createdAt));
}

export async function getTourAdminById(id: string) {
  const [row] = await db.select().from(tours).where(eq(tours.id, id)).limit(1);
  return row ?? null;
}

function tourValues(input: TourInput) {
  return {
    destinationId: input.destinationId,
    categoryId: input.categoryId,
    title: input.title,
    slug: input.slug || slugify(input.title),
    description: input.description,
    duration: input.duration,
    difficulty: input.difficulty,
    price: input.price.toFixed(2),
    discountPrice: input.discountPrice ? input.discountPrice.toFixed(2) : null,
    maxGuests: input.maxGuests,
    availableSeats: input.availableSeats,
    featured: input.featured,
    coverImage: input.coverImage,
    highlights: parseListField(input.highlights),
    included: parseListField(input.included),
    excluded: parseListField(input.excluded),
    tourGuide: input.tourGuide || null,
  };
}

export async function createTour(input: TourInput) {
  const [row] = await db.insert(tours).values(tourValues(input)).returning();
  return row;
}

export async function updateTour(id: string, input: TourInput) {
  const [row] = await db
    .update(tours)
    .set(tourValues(input))
    .where(eq(tours.id, id))
    .returning();
  return row;
}

export async function deleteTour(id: string) {
  await db.delete(tours).where(eq(tours.id, id));
}

// ─── Bookings ───────────────────────────────────────────────

export async function getAllBookingsAdmin() {
  return db
    .select({
      booking: bookings,
      tour: tours,
      destination: destinations,
      customer: user,
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .innerJoin(user, eq(bookings.userId, user.id))
    .orderBy(desc(bookings.createdAt));
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "completed",
) {
  try {
    return await db.transaction(async (tx) => {
      const [booking] = await tx
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking) {
        return { success: false as const, error: "Booking not found." };
      }

      const previousStatus = booking.bookingStatus;

      if (status === "cancelled" && previousStatus === BOOKING_STATUS.PENDING) {
        await tx
          .update(tours)
          .set({
            availableSeats: sql`LEAST(${tours.availableSeats} + ${booking.travelers}, ${tours.maxGuests})`,
          })
          .where(eq(tours.id, booking.tourId));
      }

      if (status === "cancelled" && previousStatus === BOOKING_STATUS.CONFIRMED) {
        await tx
          .update(tours)
          .set({
            availableSeats: sql`LEAST(${tours.availableSeats} + ${booking.travelers}, ${tours.maxGuests})`,
          })
          .where(eq(tours.id, booking.tourId));
      }

      await tx
        .update(bookings)
        .set({
          bookingStatus: status,
          paymentStatus: status === "confirmed" ? "paid" : booking.paymentStatus,
        })
        .where(eq(bookings.id, bookingId));

      return { success: true as const };
    });
  } catch {
    return { success: false as const, error: "Failed to update booking status." };
  }
}

// ─── Customers ──────────────────────────────────────────────

export async function getAllCustomersAdmin() {
  const customers = await db
    .select()
    .from(user)
    .where(eq(user.role, USER_ROLES.CUSTOMER))
    .orderBy(desc(user.createdAt));

  const bookingCounts = await db
    .select({
      userId: bookings.userId,
      total: count(),
    })
    .from(bookings)
    .groupBy(bookings.userId);

  const countMap = new Map(
    bookingCounts.map((b) => [b.userId, Number(b.total)]),
  );

  return customers.map((c) => ({
    ...c,
    bookingCount: countMap.get(c.id) ?? 0,
  }));
}

// ─── Reviews ────────────────────────────────────────────────

async function recalculateTourRating(tourId: string) {
  const approved = await db
    .select({ rating: reviews.rating })
    .from(reviews)
    .where(and(eq(reviews.tourId, tourId), eq(reviews.status, "approved")));

  const reviewCount = approved.length;
  const averageRating =
    reviewCount > 0
      ? (approved.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(2)
      : "0";

  await db
    .update(tours)
    .set({ averageRating, reviewCount })
    .where(eq(tours.id, tourId));
}

export async function getAllReviewsAdmin() {
  return db
    .select({
      review: reviews,
      tour: tours,
      customer: user,
    })
    .from(reviews)
    .innerJoin(tours, eq(reviews.tourId, tours.id))
    .innerJoin(user, eq(reviews.userId, user.id))
    .orderBy(desc(reviews.createdAt));
}

export async function updateReviewStatus(
  reviewId: string,
  status: "approved" | "rejected",
) {
  const [review] = await db
    .update(reviews)
    .set({ status })
    .where(eq(reviews.id, reviewId))
    .returning();

  if (review) await recalculateTourRating(review.tourId);
  return review;
}

export async function deleteReview(reviewId: string) {
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);

  if (!review) return;
  await db.delete(reviews).where(eq(reviews.id, reviewId));
  await recalculateTourRating(review.tourId);
}

// ─── Blogs ──────────────────────────────────────────────────

export async function getAllBlogsAdmin() {
  return db.select().from(blogs).orderBy(desc(blogs.createdAt));
}

export async function createBlog(input: BlogInput, authorId?: string) {
  const slug = input.slug || slugify(input.title);
  const [row] = await db
    .insert(blogs)
    .values({
      ...input,
      slug,
      authorId: authorId ?? null,
      publishedAt: input.published ? new Date() : null,
    })
    .returning();
  return row;
}

export async function updateBlog(id: string, input: BlogInput) {
  const slug = input.slug || slugify(input.title);
  const [existing] = await db
    .select()
    .from(blogs)
    .where(eq(blogs.id, id))
    .limit(1);

  const [row] = await db
    .update(blogs)
    .set({
      ...input,
      slug,
      publishedAt:
        input.published && !existing?.publishedAt
          ? new Date()
          : existing?.publishedAt,
    })
    .where(eq(blogs.id, id))
    .returning();
  return row;
}

export async function deleteBlog(id: string) {
  await db.delete(blogs).where(eq(blogs.id, id));
}

// ─── Gallery ────────────────────────────────────────────────

export async function getAllGalleryAdmin() {
  return db.select().from(gallery).orderBy(asc(gallery.sortOrder));
}

export async function createGalleryItem(input: GalleryInput) {
  const [row] = await db.insert(gallery).values(input).returning();
  return row;
}

export async function updateGalleryItem(id: string, input: GalleryInput) {
  const [row] = await db
    .update(gallery)
    .set(input)
    .where(eq(gallery.id, id))
    .returning();
  return row;
}

export async function deleteGalleryItem(id: string) {
  await db.delete(gallery).where(eq(gallery.id, id));
}

// ─── Messages ───────────────────────────────────────────────

export async function getAllMessagesAdmin() {
  return db.select().from(messages).orderBy(desc(messages.createdAt));
}

export async function markMessageRead(id: string, read = true) {
  await db.update(messages).set({ read }).where(eq(messages.id, id));
}

export async function deleteMessage(id: string) {
  await db.delete(messages).where(eq(messages.id, id));
}

// ─── Newsletter ─────────────────────────────────────────────

export async function getAllNewsletterAdmin() {
  return db.select().from(newsletter).orderBy(desc(newsletter.subscribedAt));
}

export async function toggleNewsletterActive(id: string, active: boolean) {
  await db.update(newsletter).set({ active }).where(eq(newsletter.id, id));
}

// ─── Settings ───────────────────────────────────────────────

export async function getSiteSettings() {
  const rows = await db.select().from(siteSettings);
  const map: Record<string, unknown> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function upsertSiteSetting(key: string, value: unknown) {
  await db
    .insert(siteSettings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value },
    });
}
