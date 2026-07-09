"use server";

import { revalidatePath } from "next/cache";
import { createReview } from "@/services/reviews.service";
import { createReviewSchema } from "@/schemas/profile";
import { requireAuth } from "@/lib/session";
import type { ActionResult } from "@/types";

export async function submitReview(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = createReviewSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid review",
    };
  }

  const result = await createReview(session.user.id, parsed.data);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/dashboard/reviews");
  revalidatePath("/dashboard");

  return { success: true, data: undefined };
}
