import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/services/blogs.service";
import { formatDate } from "@/utils/format";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBlogBySlug(slug);
  if (!data) return { title: "Article Not Found" };
  return {
    title: data.blog.title,
    description: data.blog.excerpt ?? data.blog.content.slice(0, 160),
    openGraph: { images: [data.blog.coverImage] },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const data = await getBlogBySlug(slug);
  if (!data) notFound();

  const { blog, authorName } = data;

  return (
    <article>
      <div className="relative h-72 md:h-96">
        <Image
          src={blog.coverImage}
          alt={blog.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <p className="text-muted-foreground text-sm">
          {formatDate(blog.publishedAt)}
          {authorName ? ` · By ${authorName}` : ""}
        </p>
        <h1 className="font-heading mt-2 text-3xl font-bold md:text-4xl">
          {blog.title}
        </h1>
        {blog.excerpt ? (
          <p className="text-muted-foreground mt-4 text-lg">{blog.excerpt}</p>
        ) : null}
        <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
          {blog.content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-muted-foreground mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
