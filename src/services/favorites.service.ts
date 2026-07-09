import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, destinations, favorites, tours } from "@/lib/db/schema";

export async function getUserFavorites(userId: string) {
  return db
    .select({
      favorite: favorites,
      tour: tours,
      destination: destinations,
      category: categories,
    })
    .from(favorites)
    .innerJoin(tours, eq(favorites.tourId, tours.id))
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .innerJoin(categories, eq(tours.categoryId, categories.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.id));
}

export async function isTourFavorited(userId: string, tourId: string) {
  const [row] = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.tourId, tourId)))
    .limit(1);

  return !!row;
}

export async function getUserFavoriteCount(userId: string) {
  const [result] = await db
    .select({ total: count() })
    .from(favorites)
    .where(eq(favorites.userId, userId));

  return Number(result?.total ?? 0);
}

export async function toggleFavorite(userId: string, tourId: string) {
  const [existing] = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.tourId, tourId)))
    .limit(1);

  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
    return { success: true as const, favorited: false };
  }

  await db.insert(favorites).values({ userId, tourId });
  return { success: true as const, favorited: true };
}
