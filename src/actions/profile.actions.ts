"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { requireAuth } from "@/lib/session";
import { STORAGE_BUCKETS } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/supabase/storage";
import { updateProfileSchema } from "@/schemas/profile";
import type { ActionResult } from "@/types";

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = updateProfileSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid profile data",
    };
  }

  try {
    await db
      .update(user)
      .set({
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      })
      .where(eq(user.id, session.user.id));

    revalidatePath("/dashboard/profile");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to update profile." };
  }
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult<{ imageUrl: string }>> {
  const session = await requireAuth();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please select an image file." };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "File must be an image." };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "Image must be under 2MB." };
  }

  try {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${session.user.id}/avatar-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadFile(STORAGE_BUCKETS.avatars, path, buffer, file.type);

    await db
      .update(user)
      .set({ image: imageUrl })
      .where(eq(user.id, session.user.id));

    revalidatePath("/dashboard/profile");
    return { success: true, data: { imageUrl } };
  } catch {
    return {
      success: false,
      error: "Failed to upload avatar. Ensure the avatars storage bucket exists.",
    };
  }
}
