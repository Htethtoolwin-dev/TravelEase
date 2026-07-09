import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { ButtonLink } from "@/components/shared/button-link";
import { BookingWizard } from "@/features/booking/components/booking-wizard";
import { ROUTES } from "@/constants";
import { getSession } from "@/lib/session";
import { getTourBySlug } from "@/services/tours.service";

interface BookTourPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BookTourPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTourBySlug(slug);
  if (!data) return { title: "Book Tour" };
  return { title: `Book ${data.tour.title}` };
}

export default async function BookTourPage({ params }: BookTourPageProps) {
  const { slug } = await params;
  const session = await getSession();

  if (!session) {
    redirect(
      `${ROUTES.login}?callbackUrl=${encodeURIComponent(`/tours/${slug}/book`)}`,
    );
  }

  const data = await getTourBySlug(slug);
  if (!data) notFound();

  const { tour, destination } = data;

  if (tour.availableSeats < 1) {
    return (
      <>
        <PageHero title="Tour Unavailable" description="This tour is currently sold out." />
        <div className="container mx-auto px-4 py-12 text-center">
          <ButtonLink href={`/tours/${slug}`}>Back to Tour</ButtonLink>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Book Your Tour"
        description={`Complete your booking for ${tour.title}`}
      />
      <div className="container mx-auto px-4 py-12">
        <BookingWizard
          tour={{
            id: tour.id,
            slug: tour.slug,
            title: tour.title,
            coverImage: tour.coverImage,
            duration: tour.duration,
            price: tour.price,
            discountPrice: tour.discountPrice,
            availableSeats: tour.availableSeats,
            maxGuests: tour.maxGuests,
            destinationName: destination.name,
            country: destination.country,
          }}
          userName={session.user.name}
        />
      </div>
    </>
  );
}
