import type { Metadata } from "next";
import { CalendarDays, DollarSign, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminAnalyticsCharts } from "@/features/admin/components/admin-charts-loader";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { getAnalyticsData } from "@/services/admin/analytics.service";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const { kpis, monthlyBookings, monthlyRevenue, popularDestinations, customerGrowth } =
    await getAnalyticsData();

  const stats = [
    { label: "Total Customers", value: String(kpis.customers), icon: Users },
    { label: "Total Tours", value: String(kpis.tours), icon: MapPin },
    { label: "Total Bookings", value: String(kpis.bookings), icon: CalendarDays },
    { label: "Monthly Revenue", value: kpis.monthlyRevenue, icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Analytics" description="Business metrics and reporting" />
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
      <AdminAnalyticsCharts
        data={{ monthlyBookings, monthlyRevenue, popularDestinations, customerGrowth }}
      />
    </div>
  );
}
