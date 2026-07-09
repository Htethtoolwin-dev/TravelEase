import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/shared/page-hero";
import { ListPagination } from "@/components/shared/list-pagination";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { TourCard } from "@/features/tours/components/tour-card";
import { TourFilters } from "@/features/tours/components/tour-filters";
import { getCategories, getTours } from "@/services/tours.service";

export const metadata: Metadata = {
  title: "Tour Packages",
  description: "Browse and book curated tour packages worldwide.",
};

interface ToursPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    difficulty?: string;
    sort?: string;
    minRating?: string;
    page?: string;
  }>;
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [{ tours, total, totalPages }, categories] = await Promise.all([
    getTours({
      q: params.q,
      category: params.category,
      difficulty: params.difficulty,
      sort: (params.sort as "newest" | "popular" | "price-asc" | "price-desc" | "rating") ?? "newest",
      minRating: params.minRating ? Number(params.minRating) : undefined,
      page,
    }),
    getCategories(),
  ]);

  return (
    <>
      <PageHero
        title="Tour Packages"
        description="Browse our curated collection of tour packages and find your perfect adventure."
      />
      <div className="container mx-auto px-4 py-12">
        <Suspense fallback={<PageSkeleton />}>
          <TourFilters
            categories={categories}
            filters={{
              q: params.q ?? "",
              category: params.category ?? "all",
              difficulty: params.difficulty ?? "all",
              sort: params.sort ?? "newest",
              minRating: params.minRating ?? "all",
            }}
          />
        </Suspense>

        <p className="text-muted-foreground my-6 text-sm">
          {total} tour{total !== 1 ? "s" : ""} found
        </p>

        {tours.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map(({ tour, destination }) => (
              <TourCard
                key={tour.id}
                slug={tour.slug}
                title={tour.title}
                coverImage={tour.coverImage}
                duration={tour.duration}
                price={tour.price}
                discountPrice={tour.discountPrice}
                averageRating={tour.averageRating}
                reviewCount={tour.reviewCount}
                availableSeats={tour.availableSeats}
                destinationName={destination.name}
                country={destination.country}
                difficulty={tour.difficulty}
                featured={tour.featured}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-lg">No tours match your filters.</p>
          </div>
        )}

        <ListPagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/tours"
          searchParams={{
            q: params.q,
            category: params.category,
            difficulty: params.difficulty,
            sort: params.sort,
            minRating: params.minRating,
          }}
        />
      </div>
    </>
  );
}
