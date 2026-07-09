import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin } from "lucide-react";
import { ButtonLink } from "@/components/shared/button-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookingStatusBadge } from "@/features/booking/components/booking-status-badge";
import { CancelBookingButton } from "@/features/booking/components/cancel-booking-button";
import { ROUTES, BOOKING_STATUS } from "@/constants";
import { requireAuth } from "@/lib/session";
import { getBookingByNumberForUser } from "@/services/bookings.service";
import { formatDate, formatPrice } from "@/utils/format";

interface BookingDetailPageProps {
  params: Promise<{ bookingNumber: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}

export async function generateMetadata({
  params,
}: BookingDetailPageProps): Promise<Metadata> {
  const { bookingNumber } = await params;
  return { title: `Booking ${bookingNumber}` };
}

const paymentVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  paid: "default",
  refunded: "outline",
};

export default async function BookingDetailPage({
  params,
  searchParams,
}: BookingDetailPageProps) {
  const { bookingNumber } = await params;
  const { confirmed } = await searchParams;
  const session = await requireAuth();

  const data = await getBookingByNumberForUser(bookingNumber, session.user.id);
  if (!data) notFound();

  const { booking, tour, destination } = data;
  const travelerInfo =
    (booking.travelerInfo as { name: string; age?: number }[]) ?? [];
  const isNewBooking = confirmed === "true";

  return (
    <div className="space-y-6">
      {isNewBooking ? (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/50">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">
              Booking submitted successfully!
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Our team will review your request and confirm within 24 hours.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Booking Reference</p>
          <h1 className="font-heading text-2xl font-bold">{booking.bookingNumber}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <BookingStatusBadge status={booking.bookingStatus} />
            <Badge variant={paymentVariant[booking.paymentStatus] ?? "secondary"} className="capitalize">
              Payment: {booking.paymentStatus}
            </Badge>
          </div>
        </div>
        {booking.bookingStatus === BOOKING_STATUS.PENDING ? (
          <CancelBookingButton bookingNumber={booking.bookingNumber} />
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tour.title}</CardTitle>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <MapPin className="size-3.5" />
            {destination.name}, {destination.country}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-muted-foreground text-sm">Travel Date</p>
              <p className="font-medium">{formatDate(booking.travelDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Travelers</p>
              <p className="font-medium">{booking.travelers}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Duration</p>
              <p className="font-medium">{tour.duration}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Price</p>
              <p className="text-primary font-semibold">{formatPrice(booking.totalPrice)}</p>
            </div>
          </div>

          {travelerInfo.length > 0 ? (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium">Travelers</p>
                <ul className="space-y-1 text-sm">
                  {travelerInfo.map((traveler, index) => (
                    <li key={index} className="text-muted-foreground">
                      {traveler.name}
                      {traveler.age ? ` · ${traveler.age} years old` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}

          <Separator />

          <div className="flex flex-wrap gap-3">
            <ButtonLink href={`/tours/${tour.slug}`}>View Tour</ButtonLink>
            <ButtonLink href={`${ROUTES.dashboard}/bookings`} variant="outline">
              All Bookings
            </ButtonLink>
            <Link
              href={ROUTES.tours}
              className="text-muted-foreground inline-flex h-8 items-center px-2 text-sm hover:underline"
            >
              Browse more tours
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
