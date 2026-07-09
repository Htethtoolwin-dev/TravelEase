import { z } from "zod";

const travelerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce
    .number()
    .int("Age must be a whole number")
    .min(1, "Age must be at least 1")
    .max(120, "Age must be 120 or less")
    .optional(),
});

export const createBookingSchema = z.object({
  tourId: z.string().uuid("Invalid tour"),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid travel date"),
  travelers: z.coerce
    .number()
    .int()
    .min(1, "At least 1 traveler required")
    .max(50, "Maximum 50 travelers"),
  travelerInfo: z
    .array(travelerSchema)
    .min(1, "Traveler information is required"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type TravelerInput = z.infer<typeof travelerSchema>;
