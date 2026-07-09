"use client";

import {
  CalendarDays,
  Heart,
  LayoutDashboard,
  Settings,
  Star,
  User,
} from "lucide-react";
import { ROUTES } from "@/constants";
import { DashboardNav } from "./dashboard-nav";

const customerNavItems = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: `${ROUTES.dashboard}/profile`, label: "My Profile", icon: User },
  { href: `${ROUTES.dashboard}/bookings`, label: "My Bookings", icon: CalendarDays },
  { href: `${ROUTES.dashboard}/favorites`, label: "Favorites", icon: Heart },
  { href: `${ROUTES.dashboard}/reviews`, label: "My Reviews", icon: Star },
  { href: `${ROUTES.dashboard}/settings`, label: "Settings", icon: Settings },
];

export function CustomerDashboardNav() {
  return <DashboardNav items={customerNavItems} rootHref={ROUTES.dashboard} />;
}
