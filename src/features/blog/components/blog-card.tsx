import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { formatDate } from "@/utils/format";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string;
  publishedAt: Date | null;
  authorName: string | null;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  coverImage,
  publishedAt,
  authorName,
}: BlogCardProps) {
  return (
    <Link href={`${ROUTES.blog}/${slug}`}>
      <Card className="group overflow-hidden pt-0 transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-44 overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-xs">
            {formatDate(publishedAt)}
            {authorName ? ` · ${authorName}` : ""}
          </p>
          <h3 className="font-heading group-hover:text-primary line-clamp-2 font-semibold">
            {title}
          </h3>
          {excerpt ? (
            <p className="text-muted-foreground line-clamp-2 text-sm">{excerpt}</p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
