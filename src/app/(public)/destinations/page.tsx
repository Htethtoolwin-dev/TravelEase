import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { DestinationCard } from "@/features/destinations/components/destination-card";
import { getDestinations } from "@/services/destinations.service";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Explore breathtaking destinations around the world.",
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <>
      <PageHero
        title="Destinations"
        description="Discover amazing places around the world and find tours for each destination."
      />
      <div className="container mx-auto px-4 py-12">
        {destinations.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map(({ destination, tourCount }) => (
              <DestinationCard
                key={destination.id}
                slug={destination.slug}
                name={destination.name}
                country={destination.country}
                city={destination.city}
                image={destination.image}
                tourCount={Number(tourCount)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-16 text-center">No destinations yet.</p>
        )}
      </div>
    </>
  );
}
