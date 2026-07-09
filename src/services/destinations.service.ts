import { asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { destinations, tours } from "@/lib/db/schema";

export async function getDestinations(search?: string) {
  const where = search
    ? or(
        ilike(destinations.name, `%${search}%`),
        ilike(destinations.city, `%${search}%`),
        ilike(destinations.country, `%${search}%`),
      )
    : undefined;

  const rows = await db
    .select({
      destination: destinations,
      tourCount: count(tours.id),
    })
    .from(destinations)
    .leftJoin(tours, eq(tours.destinationId, destinations.id))
    .where(where)
    .groupBy(destinations.id)
    .orderBy(desc(destinations.featured), asc(destinations.name));

  return rows;
}

export async function getFeaturedDestinations(limit = 6) {
  return db
    .select({
      destination: destinations,
      tourCount: count(tours.id),
    })
    .from(destinations)
    .leftJoin(tours, eq(tours.destinationId, destinations.id))
    .where(eq(destinations.featured, true))
    .groupBy(destinations.id)
    .orderBy(asc(destinations.name))
    .limit(limit);
}

export async function getDestinationBySlug(slug: string) {
  const [row] = await db
    .select({
      destination: destinations,
      tourCount: count(tours.id),
    })
    .from(destinations)
    .leftJoin(tours, eq(tours.destinationId, destinations.id))
    .where(eq(destinations.slug, slug))
    .groupBy(destinations.id)
    .limit(1);

  if (!row) return null;

  const destinationTours = await db
    .select()
    .from(tours)
    .where(eq(tours.destinationId, row.destination.id))
    .orderBy(desc(tours.featured), desc(tours.averageRating));

  return { ...row, tours: destinationTours };
}

export async function getAllDestinationSlugs() {
  return db.select({ slug: destinations.slug }).from(destinations);
}
