import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, destinations, tours } from "@/lib/db/schema";
import type { CreateBookingInput } from "@/schemas/booking";
import { getEffectivePrice } from "@/utils/format";
import { BOOKING_STATUS } from "@/constants";

// Booking numbers come from a Postgres sequence. nextval() is atomic, so two
// concurrent bookings can never get the same number, and it is never rolled
// back, so a failed booking just leaves a gap (which is fine for an ID).
// Reading MAX(booking_number) + 1 instead lets two requests pick the same
// number at the same time.
async function nextBookingNumber(executor: Pick<typeof db, "execute">) {
  const [row] = await executor.execute<{ n: string }>(
    sql`select nextval('booking_number_seq')::text as n`,
  );
  const n = row?.n;
  if (!n) throw new Error("Could not allocate a booking number.");
  return `TRV-${new Date().getFullYear()}-${n.padStart(6, "0")}`;
}

export async function getBookingByNumber(bookingNumber: string) {
  const [row] = await db
    .select({
      booking: bookings,
      tour: tours,
      destination: destinations,
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .where(eq(bookings.bookingNumber, bookingNumber))
    .limit(1);

  return row ?? null;
}

export async function getBookingByNumberForUser(
  bookingNumber: string,
  userId: string,
) {
  const row = await getBookingByNumber(bookingNumber);
  if (!row || row.booking.userId !== userId) return null;
  return row;
}

export async function createBooking(
  userId: string,
  input: CreateBookingInput,
) {
  const [tour] = await db
    .select()
    .from(tours)
    .where(eq(tours.id, input.tourId))
    .limit(1);

  if (!tour) {
    return { success: false as const, error: "Tour not found." };
  }

  if (input.travelers > tour.maxGuests) {
    return {
      success: false as const,
      error: `This tour allows a maximum of ${tour.maxGuests} guests per booking.`,
    };
  }

  if (input.travelerInfo.length !== input.travelers) {
    return {
      success: false as const,
      error: "Traveler information must match the number of travelers.",
    };
  }

  const travelDate = new Date(`${input.travelDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (travelDate < today) {
    return {
      success: false as const,
      error: "Travel date must be in the future.",
    };
  }

  const unitPrice = Number(getEffectivePrice(tour.price, tour.discountPrice));
  const totalPrice = (unitPrice * input.travelers).toFixed(2);

  try {
    return await db.transaction(async (tx) => {
      // Check and decrement in ONE statement. Postgres locks the row and
      // re-checks the WHERE clause, so if two requests race for the last
      // seat, the second one updates 0 rows and gets "no seats left".
      const [updatedTour] = await tx
        .update(tours)
        .set({
          availableSeats: sql`${tours.availableSeats} - ${input.travelers}`,
        })
        .where(
          and(
            eq(tours.id, tour.id),
            gte(tours.availableSeats, input.travelers),
          ),
        )
        .returning({ availableSeats: tours.availableSeats });

      if (!updatedTour) {
        const [current] = await tx
          .select({ availableSeats: tours.availableSeats })
          .from(tours)
          .where(eq(tours.id, tour.id))
          .limit(1);

        const seats = current?.availableSeats ?? 0;
        return {
          success: false as const,
          error: `Only ${seats} seat${seats === 1 ? "" : "s"} available.`,
        };
      }

      // Insert inside the same transaction as the seat update: if this
      // fails, the seat decrement above is rolled back too.
      const bookingNumber = await nextBookingNumber(tx);
      const [booking] = await tx
        .insert(bookings)
        .values({
          bookingNumber,
          userId,
          tourId: tour.id,
          travelDate: input.travelDate,
          travelers: input.travelers,
          travelerInfo: input.travelerInfo,
          totalPrice,
          bookingStatus: "pending",
          paymentStatus: "pending",
        })
        .returning();

      if (!booking) {
        throw new Error("Failed to create booking.");
      }

      return { success: true as const, data: booking };
    });
  } catch {
    return {
      success: false as const,
      error: "Failed to create booking. Please try again.",
    };
  }
}

export async function getRecentUserBookings(userId: string, limit = 5) {
  return db
    .select({
      booking: bookings,
      tour: tours,
      destination: destinations,
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt))
    .limit(limit);
}

export async function getUserBookings(userId: string) {
  return db
    .select({
      booking: bookings,
      tour: tours,
      destination: destinations,
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));
}

export async function getUpcomingBookings(userId: string, limit = 5) {
  const today = new Date().toISOString().split("T")[0];

  return db
    .select({
      booking: bookings,
      tour: tours,
      destination: destinations,
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .where(
      and(
        eq(bookings.userId, userId),
        inArray(bookings.bookingStatus, [
          BOOKING_STATUS.PENDING,
          BOOKING_STATUS.CONFIRMED,
        ]),
        gte(bookings.travelDate, today),
      ),
    )
    .orderBy(bookings.travelDate)
    .limit(limit);
}

export async function getDashboardBookingStats(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const [stats] = await db
    .select({
      upcoming: sql<number>`count(*) filter (where ${bookings.bookingStatus} in ('pending', 'confirmed') and ${bookings.travelDate} >= ${today})`,
      total: sql<number>`count(*)`,
    })
    .from(bookings)
    .where(eq(bookings.userId, userId));

  return {
    upcoming: Number(stats?.upcoming ?? 0),
    total: Number(stats?.total ?? 0),
  };
}

export async function cancelBooking(bookingNumber: string, userId: string) {
  try {
    return await db.transaction(async (tx) => {
      // Flip the status only if it is still pending, in one statement.
      // If the user double-clicks Cancel (or an admin cancels at the same
      // time), only one request gets a row back, so seats are returned once.
      const [cancelled] = await tx
        .update(bookings)
        .set({ bookingStatus: BOOKING_STATUS.CANCELLED })
        .where(
          and(
            eq(bookings.bookingNumber, bookingNumber),
            eq(bookings.userId, userId),
            eq(bookings.bookingStatus, BOOKING_STATUS.PENDING),
          ),
        )
        .returning({
          tourId: bookings.tourId,
          travelers: bookings.travelers,
        });

      if (!cancelled) {
        const owned = await getBookingByNumberForUser(bookingNumber, userId);
        return {
          success: false as const,
          error: owned
            ? "Only pending bookings can be cancelled."
            : "Booking not found.",
        };
      }

      await tx
        .update(tours)
        .set({
          availableSeats: sql`${tours.availableSeats} + ${cancelled.travelers}`,
        })
        .where(eq(tours.id, cancelled.tourId));

      return { success: true as const };
    });
  } catch {
    return { success: false as const, error: "Failed to cancel booking." };
  }
}
