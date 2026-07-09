import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Star,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ButtonLink } from "@/components/shared/button-link";
import { TourCard } from "@/features/tours/components/tour-card";
import { FavoriteButton } from "@/features/tours/components/favorite-button";
import { ROUTES } from "@/constants";
import { getSession } from "@/lib/session";
import { isTourFavorited } from "@/services/favorites.service";
import { getTourBySlug, getTours } from "@/services/tours.service";
import { formatPrice, getEffectivePrice } from "@/utils/format";

interface TourDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TourDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTourBySlug(slug);
  if (!data) return { title: "Tour Not Found" };
  return {
    title: data.tour.title,
    description: data.tour.description.slice(0, 160),
    openGraph: { images: [data.tour.coverImage] },
  };
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params;
  const [data, session] = await Promise.all([getTourBySlug(slug), getSession()]);
  if (!data) notFound();

  const { tour, destination, category, images, reviews } = data;
  const effectivePrice = getEffectivePrice(tour.price, tour.discountPrice);
  const highlights = (tour.highlights as string[]) ?? [];
  const included = (tour.included as string[]) ?? [];
  const excluded = (tour.excluded as string[]) ?? [];
  const itinerary =
    (tour.itinerary as { day: number; title: string; description: string }[]) ??
    [];
  const location = tour.location as {
    address: string;
    lat: number;
    lng: number;
  } | null;

  const related = await getTours({
    category: category.slug,
    page: 1,
  });

  const isFavorited = session
    ? await isTourFavorited(session.user.id, tour.id)
    : false;

  return (
    <>
      <div className="relative h-[50vh] min-h-[400px]">
        <Image
          src={tour.coverImage}
          alt={tour.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 container mx-auto px-4 pb-8 text-white">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{category.name}</Badge>
            <Badge variant="outline" className="border-white/30 text-white capitalize">
              {tour.difficulty}
            </Badge>
          </div>
          <h1 className="font-heading mt-3 text-3xl font-bold md:text-5xl">
            {tour.title}
          </h1>
          <p className="mt-2 flex items-center gap-1 text-white/80">
            <MapPin className="size-4" />
            {destination.name}, {destination.country}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-2">
                <Clock className="text-primary size-4" />
                {tour.duration}
              </span>
              <span className="flex items-center gap-2">
                <Users className="text-primary size-4" />
                Max {tour.maxGuests} guests
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="text-primary size-4" />
                {tour.availableSeats} seats left
              </span>
              <span className="flex items-center gap-2">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {Number(tour.averageRating ?? 0).toFixed(1)} ({tour.reviewCount} reviews)
              </span>
            </div>

            <section>
              <h2 className="font-heading mb-4 text-2xl font-semibold">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">{tour.description}</p>
            </section>

            {highlights.length > 0 ? (
              <section>
                <h2 className="font-heading mb-4 text-2xl font-semibold">Highlights</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="text-primary mt-0.5 size-4 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {images.length > 0 ? (
              <section>
                <h2 className="font-heading mb-4 text-2xl font-semibold">Gallery</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {images.map((img) => (
                    <div key={img.id} className="relative aspect-video overflow-hidden rounded-xl">
                      <Image
                        src={img.imageUrl}
                        alt={tour.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {itinerary.length > 0 ? (
              <section>
                <h2 className="font-heading mb-4 text-2xl font-semibold">Itinerary</h2>
                <div className="space-y-4">
                  {itinerary.map((day) => (
                    <div key={day.day} className="rounded-xl border p-4">
                      <p className="text-primary text-sm font-medium">Day {day.day}</p>
                      <h3 className="font-semibold">{day.title}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">{day.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2">
              {included.length > 0 ? (
                <section>
                  <h2 className="font-heading mb-3 text-lg font-semibold">Included</h2>
                  <ul className="space-y-2">
                    {included.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <Check className="size-4 text-green-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {excluded.length > 0 ? (
                <section>
                  <h2 className="font-heading mb-3 text-lg font-semibold">Excluded</h2>
                  <ul className="space-y-2">
                    {excluded.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <X className="text-destructive size-4" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            {location ? (
              <section>
                <h2 className="font-heading mb-4 text-2xl font-semibold">Location</h2>
                <p className="text-muted-foreground mb-3 text-sm">{location.address}</p>
                <div className="aspect-video overflow-hidden rounded-xl">
                  <iframe
                    title="Tour location"
                    src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=12&output=embed`}
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
              </section>
            ) : null}

            {reviews.length > 0 ? (
              <section>
                <h2 className="font-heading mb-4 text-2xl font-semibold">Reviews</h2>
                <div className="space-y-4">
                  {reviews.map(({ review, userName }) => (
                    <div key={review.id} className="rounded-xl border p-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 flex size-8 items-center justify-center rounded-full text-sm font-medium">
                          {userName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">{userName}</p>
                          <p className="flex items-center gap-1 text-sm">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                            ))}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-3 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border bg-card p-6 shadow-lg">
              <div className="mb-4">
                <p className="text-primary text-3xl font-bold">{formatPrice(effectivePrice)}</p>
                {tour.discountPrice ? (
                  <p className="text-muted-foreground text-sm line-through">
                    {formatPrice(tour.price)}
                  </p>
                ) : null}
                <p className="text-muted-foreground text-sm">per person</p>
              </div>
              <Separator className="my-4" />
              <ul className="text-muted-foreground mb-6 space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Duration</span>
                  <span className="text-foreground">{tour.duration}</span>
                </li>
                <li className="flex justify-between">
                  <span>Available</span>
                  <span className="text-foreground">{tour.availableSeats} seats</span>
                </li>
                {tour.tourGuide ? (
                  <li className="flex justify-between">
                    <span>Guide</span>
                    <span className="text-foreground">{tour.tourGuide}</span>
                  </li>
                ) : null}
              </ul>
              <div className="flex gap-2">
                <ButtonLink href={ROUTES.tourBook(slug)} className="flex-1">
                  Book Now
                </ButtonLink>
                {session ? (
                  <FavoriteButton tourId={tour.id} initialFavorited={isFavorited} />
                ) : null}
              </div>
              <p className="text-muted-foreground mt-3 text-center text-xs">
                {session
                  ? "Book now or save this tour to your favorites"
                  : "Sign in required to complete your booking"}
              </p>
            </div>
          </aside>
        </div>

        {related.tours.filter((t) => t.tour.slug !== slug).length > 0 ? (
          <section className="mt-16">
            <h2 className="font-heading mb-6 text-2xl font-semibold">Related Tours</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.tours
                .filter((t) => t.tour.slug !== slug)
                .slice(0, 3)
                .map(({ tour: t, destination: d }) => (
                  <TourCard
                    key={t.id}
                    slug={t.slug}
                    title={t.title}
                    coverImage={t.coverImage}
                    duration={t.duration}
                    price={t.price}
                    discountPrice={t.discountPrice}
                    averageRating={t.averageRating}
                    reviewCount={t.reviewCount}
                    availableSeats={t.availableSeats}
                    destinationName={d.name}
                    country={d.country}
                    difficulty={t.difficulty}
                  />
                ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
