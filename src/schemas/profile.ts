import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[\d\s\-+()]*$/, "Invalid phone number")
    .max(20)
    .optional()
    .or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createReviewSchema = z.object({
  tourId: z.string().uuid("Invalid tour"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
