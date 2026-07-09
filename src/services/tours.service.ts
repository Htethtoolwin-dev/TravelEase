import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import {
  categories,
  destinations,
  reviews,
  tourImages,
  tours,
  user,
} from "@/lib/db/schema";

const PAGE_SIZE = 12;

export type TourSort = "newest" | "popular" | "price-asc" | "price-desc" | "rating";

export interface TourFilters {
  q?: string;
  category?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: TourSort;
  page?: number;
}

function tourOrderBy(sort: TourSort = "newest") {
  switch (sort) {
    case "popular":
      return desc(tours.reviewCount);
    case "price-asc":
      return asc(sql`COALESCE(${tours.discountPrice}, ${tours.price})`);
    case "price-desc":
      return desc(sql`COALESCE(${tours.discountPrice}, ${tours.price})`);
    case "rating":
      return desc(tours.averageRating);
    default:
      return desc(tours.createdAt);
  }
}

function buildTourConditions(filters: TourFilters) {
  const conditions = [];

  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(
      or(
        ilike(tours.title, term),
        ilike(destinations.name, term),
        ilike(destinations.city, term),
        ilike(destinations.country, term),
      ),
    );
  }

  if (filters.category) {
    conditions.push(eq(categories.slug, filters.category));
  }

  if (filters.difficulty) {
    conditions.push(
      eq(tours.difficulty, filters.difficulty as "easy" | "moderate" | "hard"),
    );
  }

  if (filters.minPrice !== undefined) {
    conditions.push(
      gte(sql`COALESCE(${tours.discountPrice}, ${tours.price})`, String(filters.minPrice)),
    );
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(
      lte(sql`COALESCE(${tours.discountPrice}, ${tours.price})`, String(filters.maxPrice)),
    );
  }

  if (filters.minRating !== undefined) {
    conditions.push(gte(tours.averageRating, String(filters.minRating)));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function getTours(filters: TourFilters = {}) {
  const page = filters.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;
  const where = buildTourConditions(filters);

  const baseQuery = db
    .select({
      tour: tours,
      destination: destinations,
      category: categories,
    })
    .from(tours)
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .innerJoin(categories, eq(tours.categoryId, categories.id))
    .$dynamic();

  const rows = await (where ? baseQuery.where(where) : baseQuery)
    .orderBy(tourOrderBy(filters.sort))
    .limit(PAGE_SIZE)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(tours)
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .innerJoin(categories, eq(tours.categoryId, categories.id))
    .where(where ?? undefined);

  return {
    tours: rows,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getFeaturedTours(limit = 6) {
  return db
    .select({
      tour: tours,
      destination: destinations,
      category: categories,
    })
    .from(tours)
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .innerJoin(categories, eq(tours.categoryId, categories.id))
    .where(eq(tours.featured, true))
    .orderBy(desc(tours.averageRating))
    .limit(limit);
}

export const getTourBySlug = cache(async (slug: string) => {
  const [row] = await db
    .select({
      tour: tours,
      destination: destinations,
      category: categories,
    })
    .from(tours)
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .innerJoin(categories, eq(tours.categoryId, categories.id))
    .where(eq(tours.slug, slug))
    .limit(1);

  if (!row) return null;

  const images = await db
    .select()
    .from(tourImages)
    .where(eq(tourImages.tourId, row.tour.id))
    .orderBy(asc(tourImages.sortOrder));

  const tourReviews = await db
    .select({
      review: reviews,
      userName: user.name,
      userImage: user.image,
    })
    .from(reviews)
    .innerJoin(user, eq(reviews.userId, user.id))
    .where(and(eq(reviews.tourId, row.tour.id), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  return { ...row, images, reviews: tourReviews };
});

export async function getAllTourSlugs() {
  return db.select({ slug: tours.slug }).from(tours);
}

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}

export { PAGE_SIZE as TOURS_PAGE_SIZE };
