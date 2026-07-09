"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cancelBooking } from "@/actions/booking.actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function CancelBookingButton({
  bookingNumber,
}: {
  bookingNumber: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelBooking(bookingNumber);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Booking cancelled.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Cancel Booking
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your booking request will be cancelled
            and seats will be released.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
          <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
            {isPending ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
