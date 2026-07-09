import type { MetadataRoute } from "next";
import { ROUTES } from "@/constants";
import { getAllBlogSlugs } from "@/services/blogs.service";
import { getAllDestinationSlugs } from "@/services/destinations.service";
import { getAllTourSlugs } from "@/services/tours.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticPages = [
    ROUTES.home,
    ROUTES.about,
    ROUTES.destinations,
    ROUTES.tours,
    ROUTES.gallery,
    ROUTES.blog,
    ROUTES.contact,
    ROUTES.faq,
    ROUTES.privacy,
    ROUTES.terms,
  ];

  const [tours, destinations, blogs] = await Promise.all([
    getAllTourSlugs().catch(() => []),
    getAllDestinationSlugs().catch(() => []),
    getAllBlogSlugs().catch(() => []),
  ]);

  return [
    ...staticPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: path === ROUTES.home ? ("daily" as const) : ("weekly" as const),
      priority: path === ROUTES.home ? 1 : 0.8,
    })),
    ...tours.map(({ slug }) => ({
      url: `${baseUrl}${ROUTES.tours}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...destinations.map(({ slug }) => ({
      url: `${baseUrl}${ROUTES.destinations}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...blogs.map(({ slug }) => ({
      url: `${baseUrl}${ROUTES.blog}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
