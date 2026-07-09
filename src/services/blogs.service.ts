import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogs, user } from "@/lib/db/schema";

export async function getPublishedBlogs(limit?: number) {
  const query = db
    .select({
      blog: blogs,
      authorName: user.name,
    })
    .from(blogs)
    .leftJoin(user, eq(blogs.authorId, user.id))
    .where(eq(blogs.published, true))
    .orderBy(desc(blogs.publishedAt))
    .$dynamic();

  if (limit) return query.limit(limit);
  return query;
}

export async function getBlogBySlug(slug: string) {
  const [row] = await db
    .select({
      blog: blogs,
      authorName: user.name,
    })
    .from(blogs)
    .leftJoin(user, eq(blogs.authorId, user.id))
    .where(eq(blogs.slug, slug))
    .limit(1);

  if (!row || !row.blog.published) return null;
  return row;
}

export async function getAllBlogSlugs() {
  return db
    .select({ slug: blogs.slug })
    .from(blogs)
    .where(eq(blogs.published, true));
}
