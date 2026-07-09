"use client";

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  FolderTree,
  Image,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageSquare,
  Settings,
  Star,
  Users,
} from "lucide-react";
import { ROUTES } from "@/constants";
import { DashboardNav } from "./dashboard-nav";

const adminNavItems = [
  { href: ROUTES.admin, label: "Dashboard", icon: LayoutDashboard },
  { href: `${ROUTES.admin}/tours`, label: "Tours", icon: MapPin },
  { href: `${ROUTES.admin}/destinations`, label: "Destinations", icon: FolderTree },
  { href: `${ROUTES.admin}/categories`, label: "Categories", icon: FolderTree },
  { href: `${ROUTES.admin}/bookings`, label: "Bookings", icon: CalendarDays },
  { href: `${ROUTES.admin}/customers`, label: "Customers", icon: Users },
  { href: `${ROUTES.admin}/reviews`, label: "Reviews", icon: Star },
  { href: `${ROUTES.admin}/blog`, label: "Blog Posts", icon: BookOpen },
  { href: `${ROUTES.admin}/gallery`, label: "Gallery", icon: Image },
  { href: `${ROUTES.admin}/messages`, label: "Messages", icon: MessageSquare },
  { href: `${ROUTES.admin}/newsletter`, label: "Newsletter", icon: Mail },
  { href: `${ROUTES.admin}/analytics`, label: "Analytics", icon: BarChart3 },
  { href: `${ROUTES.admin}/settings`, label: "Settings", icon: Settings },
];

export function AdminDashboardNav() {
  return <DashboardNav items={adminNavItems} rootHref={ROUTES.admin} />;
}
