import type { Metadata } from "next";
import { BookingsManager } from "@/features/admin/components/bookings-manager";
import { getAllBookingsAdmin } from "@/services/admin/content.service";

export const metadata: Metadata = { title: "Manage Bookings" };

export default async function AdminBookingsPage() {
  const items = await getAllBookingsAdmin();
  return <BookingsManager items={items} />;
}
