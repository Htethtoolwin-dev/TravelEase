import { and, desc, eq, gte, ilike, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, destinations, tours } from "@/lib/db/schema";
import type { CreateBookingInput } from "@/schemas/booking";
import { getEffectivePrice } from "@/utils/format";
import { BOOKING_STATUS } from "@/constants";

function bookingPrefix() {
  return `TRV-${new Date().getFullYear()}-`;
}

async function nextBookingNumber() {
  const prefix = bookingPrefix();

  const [latest] = await db
    .select({ bookingNumber: bookings.bookingNumber })
    .from(bookings)
    .where(ilike(bookings.bookingNumber, `${prefix}%`))
    .orderBy(desc(bookings.bookingNumber))
    .limit(1);

  const nextNumber = latest?.bookingNumber
    ? Number.parseInt(latest.bookingNumber.split("-")[2] ?? "0", 10) + 1
    : 1;

  return `${prefix}${String(nextNumber).padStart(6, "0")}`;
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

      let booking;
      for (let attempt = 0; attempt < 3; attempt++) {
        const bookingNumber = await nextBookingNumber();
        try {
          [booking] = await tx
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
          break;
        } catch (err) {
          const isUniqueViolation =
            err instanceof Error &&
            (err.message.includes("unique") || err.message.includes("duplicate"));
          if (!isUniqueViolation || attempt === 2) throw err;
        }
      }

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
  const data = await getBookingByNumberForUser(bookingNumber, userId);
  if (!data) {
    return { success: false as const, error: "Booking not found." };
  }

  if (data.booking.bookingStatus !== BOOKING_STATUS.PENDING) {
    return {
      success: false as const,
      error: "Only pending bookings can be cancelled.",
    };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(tours)
        .set({
          availableSeats: sql`LEAST(${tours.availableSeats} + ${data.booking.travelers}, ${tours.maxGuests})`,
        })
        .where(eq(tours.id, data.booking.tourId));

      await tx
        .update(bookings)
        .set({ bookingStatus: BOOKING_STATUS.CANCELLED })
        .where(eq(bookings.id, data.booking.id));
    });

    return { success: true as const };
  } catch {
    return { success: false as const, error: "Failed to cancel booking." };
  }
}
