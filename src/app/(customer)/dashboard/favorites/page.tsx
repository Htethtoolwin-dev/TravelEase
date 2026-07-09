import type { Metadata } from "next";
import { TourCard } from "@/features/tours/components/tour-card";
import { ButtonLink } from "@/components/shared/button-link";
import { ROUTES } from "@/constants";
import { requireAuth } from "@/lib/session";
import { getUserFavorites } from "@/services/favorites.service";

export const metadata: Metadata = { title: "Favorite Tours" };

export default async function FavoritesPage() {
  const session = await requireAuth();
  const favorites = await getUserFavorites(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Favorite Tours</h1>
        <p className="text-muted-foreground mt-2">
          Tours you&apos;ve saved for later.
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map(({ tour, destination }) => (
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
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground mb-4">
            No favorite tours yet. Heart a tour to save it here.
          </p>
          <ButtonLink href={ROUTES.tours}>Browse Tours</ButtonLink>
        </div>
      )}
    </div>
  );
}
