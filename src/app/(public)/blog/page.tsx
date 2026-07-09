import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { BlogCard } from "@/features/blog/components/blog-card";
import { getPublishedBlogs } from "@/services/blogs.service";

export const metadata: Metadata = {
  title: "Travel Blog",
  description: "Stories, tips, and inspiration for your next adventure.",
};

export const revalidate = 300;

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();

  return (
    <>
      <PageHero
        title="Travel Blog"
        description="Stories, tips, and inspiration from our travel experts."
      />
      <div className="container mx-auto px-4 py-12">
        {blogs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map(({ blog, authorName }) => (
              <BlogCard
                key={blog.id}
                slug={blog.slug}
                title={blog.title}
                excerpt={blog.excerpt}
                coverImage={blog.coverImage}
                publishedAt={blog.publishedAt}
                authorName={authorName}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-16 text-center">No blog posts yet.</p>
        )}
      </div>
    </>
  );
}
