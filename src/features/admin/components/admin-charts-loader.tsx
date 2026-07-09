"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboardCharts = dynamic(
  () =>
    import("@/features/admin/components/admin-charts").then(
      (mod) => mod.AdminDashboardCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    ),
  },
);

const AdminAnalyticsCharts = dynamic(
  () =>
    import("@/features/admin/components/admin-charts").then(
      (mod) => mod.AdminAnalyticsCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    ),
  },
);

export { AdminDashboardCharts, AdminAnalyticsCharts };
