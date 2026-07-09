"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminUpdateBookingStatus } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { BookingStatusBadge } from "@/features/booking/components/booking-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatPrice } from "@/utils/format";
import type { bookings, destinations, tours, user } from "@/lib/db/schema";
import { BOOKING_STATUS } from "@/constants";

type BookingRow = {
  booking: typeof bookings.$inferSelect;
  tour: typeof tours.$inferSelect;
  destination: typeof destinations.$inferSelect;
  customer: typeof user.$inferSelect;
};

export function BookingsManager({ items }: { items: BookingRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateStatus(bookingId: string, status: "confirmed" | "cancelled" | "completed") {
    startTransition(async () => {
      const result = await adminUpdateBookingStatus(bookingId, status);
      if (!result.success) toast.error(result.error);
      else {
        toast.success(`Booking ${status}`);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Bookings" description="View and manage customer bookings" />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Tour</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(({ booking, tour, customer }) => (
              <TableRow key={booking.id}>
                <TableCell className="font-mono text-xs">{booking.bookingNumber}</TableCell>
                <TableCell>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-muted-foreground text-xs">{customer.email}</p>
                </TableCell>
                <TableCell>{tour.title}</TableCell>
                <TableCell>{formatDate(booking.travelDate)}</TableCell>
                <TableCell>{formatPrice(booking.totalPrice)}</TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.bookingStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {booking.bookingStatus === BOOKING_STATUS.PENDING ? (
                      <>
                        <Button size="sm" disabled={isPending} onClick={() => updateStatus(booking.id, "confirmed")}>Confirm</Button>
                        <Button size="sm" variant="outline" disabled={isPending} onClick={() => updateStatus(booking.id, "cancelled")}>Reject</Button>
                      </>
                    ) : null}
                    {booking.bookingStatus === BOOKING_STATUS.CONFIRMED ? (
                      <>
                        <Button size="sm" variant="outline" disabled={isPending} onClick={() => updateStatus(booking.id, "completed")}>Complete</Button>
                        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => updateStatus(booking.id, "cancelled")}>Cancel</Button>
                      </>
                    ) : null}
                    {booking.bookingStatus === BOOKING_STATUS.CANCELLED ? (
                      <Badge variant="destructive">Cancelled</Badge>
                    ) : null}
                    {booking.bookingStatus === BOOKING_STATUS.COMPLETED ? (
                      <Badge variant="outline">Completed</Badge>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
