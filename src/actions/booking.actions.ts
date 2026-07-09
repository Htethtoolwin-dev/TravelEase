"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { cancelBooking as cancelBookingService } from "@/services/bookings.service";
import { createBooking } from "@/services/bookings.service";
import { createBookingSchema } from "@/schemas/booking";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { requireCustomer } from "@/lib/session";
import type { ActionResult } from "@/types";

export async function submitBooking(
  input: unknown,
): Promise<ActionResult<{ bookingNumber: string }>> {
  const session = await requireCustomer();
  const ip = getClientIp(await headers());

  const limited = rateLimit(`booking:${session.user.id}:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limited.success) {
    return { success: false, error: "Too many booking attempts. Please wait a moment." };
  }

  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid booking details",
    };
  }

  const result = await createBooking(session.user.id, parsed.data);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    data: { bookingNumber: result.data.bookingNumber },
  };
}

export async function cancelBooking(
  bookingNumber: string,
): Promise<ActionResult> {
  const session = await requireCustomer();
  const result = await cancelBookingService(bookingNumber, session.user.id);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath(`/dashboard/bookings/${bookingNumber}`);
  revalidatePath("/dashboard");

  return { success: true, data: undefined };
}
