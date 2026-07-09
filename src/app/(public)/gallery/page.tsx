import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { GalleryGrid } from "@/features/gallery/components/gallery-grid";
import { getGalleryCategories, getGalleryImages } from "@/services/gallery.service";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse photos from our travelers and destinations.",
};

export const revalidate = 300;

export default async function GalleryPage() {
  const [items, categories] = await Promise.all([
    getGalleryImages(),
    getGalleryCategories(),
  ]);

  return (
    <>
      <PageHero
        title="Photo Gallery"
        description="Explore stunning moments captured by our travelers around the world."
      />
      <div className="container mx-auto px-4 py-12">
        {items.length > 0 ? (
          <GalleryGrid items={items} categories={categories} />
        ) : (
          <p className="text-muted-foreground py-16 text-center">No gallery images yet.</p>
        )}
      </div>
    </>
  );
}
