import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  bookings,
  destinations,
  reviews,
  tours,
  user,
} from "@/lib/db/schema";
import { BOOKING_STATUS, USER_ROLES } from "@/constants";
import { formatPrice } from "@/utils/format";

export async function getAdminKpis() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [customerCount] = await db
    .select({ total: count() })
    .from(user)
    .where(eq(user.role, USER_ROLES.CUSTOMER));

  const [tourCount] = await db.select({ total: count() }).from(tours);
  const [bookingCount] = await db.select({ total: count() }).from(bookings);

  const [monthlyRevenue] = await db
    .select({
      total: sql<string>`coalesce(sum(${bookings.totalPrice}), 0)`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.bookingStatus, BOOKING_STATUS.CONFIRMED),
        gte(bookings.createdAt, new Date(monthStart)),
      ),
    );

  return {
    customers: Number(customerCount?.total ?? 0),
    tours: Number(tourCount?.total ?? 0),
    bookings: Number(bookingCount?.total ?? 0),
    monthlyRevenue: formatPrice(monthlyRevenue?.total ?? 0),
    monthlyRevenueRaw: Number(monthlyRevenue?.total ?? 0),
  };
}

export async function getMonthlyBookingsChart() {
  const rows = await db
    .select({
      month: sql<string>`to_char(${bookings.createdAt}, 'YYYY-MM')`,
      total: count(),
    })
    .from(bookings)
    .groupBy(sql`to_char(${bookings.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${bookings.createdAt}, 'YYYY-MM')`)
    .limit(12);

  return rows.map((r) => ({
    month: r.month,
    bookings: Number(r.total),
  }));
}

export async function getMonthlyRevenueChart() {
  const rows = await db
    .select({
      month: sql<string>`to_char(${bookings.createdAt}, 'YYYY-MM')`,
      revenue: sql<string>`coalesce(sum(${bookings.totalPrice}), 0)`,
    })
    .from(bookings)
    .where(eq(bookings.bookingStatus, BOOKING_STATUS.CONFIRMED))
    .groupBy(sql`to_char(${bookings.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${bookings.createdAt}, 'YYYY-MM')`)
    .limit(12);

  return rows.map((r) => ({
    month: r.month,
    revenue: Number(r.revenue),
  }));
}

export async function getPopularDestinationsChart() {
  const rows = await db
    .select({
      name: destinations.name,
      bookings: count(),
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .innerJoin(destinations, eq(tours.destinationId, destinations.id))
    .groupBy(destinations.name)
    .orderBy(desc(count()))
    .limit(6);

  return rows.map((r) => ({
    name: r.name,
    bookings: Number(r.bookings),
  }));
}

export async function getCustomerGrowthChart() {
  const rows = await db
    .select({
      month: sql<string>`to_char(${user.createdAt}, 'YYYY-MM')`,
      customers: count(),
    })
    .from(user)
    .where(eq(user.role, USER_ROLES.CUSTOMER))
    .groupBy(sql`to_char(${user.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${user.createdAt}, 'YYYY-MM')`)
    .limit(12);

  return rows.map((r) => ({
    month: r.month,
    customers: Number(r.customers),
  }));
}

export async function getRecentBookings(limit = 5) {
  return db
    .select({
      booking: bookings,
      tourTitle: tours.title,
      userName: user.name,
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .innerJoin(user, eq(bookings.userId, user.id))
    .orderBy(desc(bookings.createdAt))
    .limit(limit);
}

export async function getRecentCustomers(limit = 5) {
  return db
    .select()
    .from(user)
    .where(eq(user.role, USER_ROLES.CUSTOMER))
    .orderBy(desc(user.createdAt))
    .limit(limit);
}

export async function getRecentReviewsAdmin(limit = 5) {
  return db
    .select({
      review: reviews,
      tourTitle: tours.title,
      userName: user.name,
    })
    .from(reviews)
    .innerJoin(tours, eq(reviews.tourId, tours.id))
    .innerJoin(user, eq(reviews.userId, user.id))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export async function getAnalyticsData() {
  const [
    kpis,
    monthlyBookings,
    monthlyRevenue,
    popularDestinations,
    customerGrowth,
  ] = await Promise.all([
    getAdminKpis(),
    getMonthlyBookingsChart(),
    getMonthlyRevenueChart(),
    getPopularDestinationsChart(),
    getCustomerGrowthChart(),
  ]);

  return {
    kpis,
    monthlyBookings,
    monthlyRevenue,
    popularDestinations,
    customerGrowth,
  };
}
