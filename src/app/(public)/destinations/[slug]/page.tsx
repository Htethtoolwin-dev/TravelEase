import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { TourCard } from "@/features/tours/components/tour-card";
import { getDestinationBySlug } from "@/services/destinations.service";

interface DestinationDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DestinationDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getDestinationBySlug(slug);
  if (!data) return { title: "Destination Not Found" };
  return {
    title: data.destination.name,
    description: data.destination.description.slice(0, 160),
  };
}

export default async function DestinationDetailPage({
  params,
}: DestinationDetailPageProps) {
  const { slug } = await params;
  const data = await getDestinationBySlug(slug);
  if (!data) notFound();

  const { destination, tourCount, tours } = data;

  return (
    <>
      <div className="relative h-72">
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <PageHero
        title={destination.name}
        description={`${destination.city}, ${destination.country} · ${Number(tourCount)} tours available`}
      />
      <div className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground mx-auto mb-12 max-w-3xl text-center leading-relaxed">
          {destination.description}
        </p>

        {tours.length > 0 ? (
          <>
            <h2 className="font-heading mb-6 text-2xl font-semibold">Available Tours</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
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
          </>
        ) : (
          <p className="text-muted-foreground text-center">No tours available for this destination yet.</p>
        )}
      </div>
    </>
  );
}
