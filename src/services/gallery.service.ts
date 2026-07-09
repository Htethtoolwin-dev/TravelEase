import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { gallery } from "@/lib/db/schema";

export async function getGalleryImages(category?: string) {
  const rows = await db.select().from(gallery).orderBy(asc(gallery.sortOrder));

  if (!category) return rows;
  return rows.filter((item) => item.category?.toLowerCase() === category.toLowerCase());
}

export async function getGalleryCategories() {
  const rows = await db.select({ category: gallery.category }).from(gallery);
  const categories = [...new Set(rows.map((r) => r.category).filter(Boolean))] as string[];
  return categories.sort();
}
