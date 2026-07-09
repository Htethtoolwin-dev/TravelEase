import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, DollarSign, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminDashboardCharts } from "@/features/admin/components/admin-charts-loader";
import { BookingStatusBadge } from "@/features/booking/components/booking-status-badge";
import { Badge } from "@/components/ui/badge";
import {
  getAnalyticsData,
  getRecentBookings,
  getRecentCustomers,
  getRecentReviewsAdmin,
} from "@/services/admin/analytics.service";
import { formatDate } from "@/utils/format";
import { ROUTES } from "@/constants";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [chartData, recentBookings, recentCustomers, recentReviews] =
    await Promise.all([
      getAnalyticsData(),
      getRecentBookings(5),
      getRecentCustomers(5),
      getRecentReviewsAdmin(5),
    ]);

  const kpis = chartData.kpis;

  const stats = [
    { label: "Total Customers", value: String(kpis.customers), icon: Users },
    { label: "Total Tours", value: String(kpis.tours), icon: MapPin },
    { label: "Total Bookings", value: String(kpis.bookings), icon: CalendarDays },
    { label: "Monthly Revenue", value: kpis.monthlyRevenue, icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your travel agency operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <AdminDashboardCharts data={chartData} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Link href={`${ROUTES.admin}/bookings`} className="text-primary text-sm hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map(({ booking, tourTitle, userName }) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">{booking.bookingNumber}</TableCell>
                    <TableCell>{userName}</TableCell>
                    <TableCell className="max-w-[140px] truncate">{tourTitle}</TableCell>
                    <TableCell><BookingStatusBadge status={booking.bookingStatus} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCustomers.map((c) => (
              <div key={c.id} className="rounded-lg border p-3">
                <p className="font-medium">{c.name}</p>
                <p className="text-muted-foreground text-xs">{c.email}</p>
                <p className="text-muted-foreground mt-1 text-xs">{formatDate(c.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Reviews</CardTitle>
            <Link href={`${ROUTES.admin}/reviews`} className="text-primary text-sm hover:underline">Moderate</Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReviews.map(({ review, tourTitle, userName }) => (
                  <TableRow key={review.id}>
                    <TableCell>{userName}</TableCell>
                    <TableCell>{tourTitle}</TableCell>
                    <TableCell>{review.rating}/5</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{review.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
