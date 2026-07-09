import type { Metadata } from "next";
import { BookingCard } from "@/features/booking/components/booking-card";
import { ButtonLink } from "@/components/shared/button-link";
import { ROUTES } from "@/constants";
import { requireAuth } from "@/lib/session";
import { getUserBookings } from "@/services/bookings.service";

export const metadata: Metadata = { title: "My Bookings" };

export default async function BookingsPage() {
  const session = await requireAuth();
  const bookings = await getUserBookings(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your tour booking history.
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map(({ booking, tour, destination }) => (
            <BookingCard
              key={booking.id}
              bookingNumber={booking.bookingNumber}
              tourTitle={tour.title}
              coverImage={tour.coverImage}
              destinationName={destination.name}
              country={destination.country}
              travelDate={booking.travelDate}
              travelers={booking.travelers}
              totalPrice={booking.totalPrice}
              status={booking.bookingStatus}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground mb-4">You haven&apos;t booked any tours yet.</p>
          <ButtonLink href={ROUTES.tours}>Browse Tours</ButtonLink>
        </div>
      )}
    </div>
  );
}
