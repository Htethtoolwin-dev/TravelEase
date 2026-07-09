import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Heart, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingStatusBadge } from "@/features/booking/components/booking-status-badge";
import { ROUTES } from "@/constants";
import { requireAuth } from "@/lib/session";
import {
  getDashboardBookingStats,
  getRecentUserBookings,
} from "@/services/bookings.service";
import { getUserFavoriteCount } from "@/services/favorites.service";
import { getUserReviewCount } from "@/services/reviews.service";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireAuth();

  const [bookingStats, favoriteCount, reviewCount, recentBookings] =
    await Promise.all([
      getDashboardBookingStats(session.user.id),
      getUserFavoriteCount(session.user.id),
      getUserReviewCount(session.user.id),
      getRecentUserBookings(session.user.id, 5),
    ]);

  const stats = [
    { label: "Upcoming Bookings", value: String(bookingStats.upcoming), icon: CalendarDays },
    { label: "Favorite Tours", value: String(favoriteCount), icon: Heart },
    { label: "Reviews Written", value: String(reviewCount), icon: Star },
  ];

  const recent = recentBookings;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">
          Welcome back, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your bookings, favorites, and travel plans.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          {bookingStats.total > 0 ? (
            <Link
              href={`${ROUTES.dashboard}/bookings`}
              className="text-primary text-sm hover:underline"
            >
              View all
            </Link>
          ) : null}
        </CardHeader>
        <CardContent>
          {recent.length > 0 ? (
            <div className="space-y-3">
              {recent.map(({ booking, tour }) => (
                <Link
                  key={booking.id}
                  href={`${ROUTES.dashboard}/bookings/${booking.bookingNumber}`}
                  className="hover:bg-muted/50 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
                >
                  <div>
                    <p className="font-medium">{tour.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(booking.travelDate)} · {booking.bookingNumber}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.bookingStatus} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">
                No bookings yet. Explore our tours and plan your next adventure!
              </p>
              <Link
                href={ROUTES.tours}
                className="text-primary text-sm font-medium hover:underline"
              >
                Browse tours →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
