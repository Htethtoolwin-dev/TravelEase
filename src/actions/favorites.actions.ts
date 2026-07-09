"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { toggleFavorite as toggleFavoriteService } from "@/services/favorites.service";
import { requireAuth } from "@/lib/session";
import type { ActionResult } from "@/types";

const tourIdSchema = z.string().uuid("Invalid tour");

export async function toggleFavorite(
  tourId: string,
): Promise<ActionResult<{ favorited: boolean }>> {
  const session = await requireAuth();
  const parsed = tourIdSchema.safeParse(tourId);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid tour" };
  }

  try {
    const result = await toggleFavoriteService(session.user.id, parsed.data);
    revalidatePath("/dashboard/favorites");
    revalidatePath("/dashboard");
    return { success: true, data: { favorited: result.favorited } };
  } catch {
    return { success: false, error: "Failed to update favorite." };
  }
}
