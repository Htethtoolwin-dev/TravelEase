"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { CACHE_TAGS } from "@/lib/cache";
import {
  blogSchema,
  categorySchema,
  destinationSchema,
  gallerySchema,
  siteContactSchema,
  siteStatsSchema,
  tourSchema,
} from "@/schemas/admin";
import {
  createBlog,
  createCategory,
  createDestination,
  createGalleryItem,
  createTour,
  deleteBlog,
  deleteCategory,
  deleteDestination,
  deleteGalleryItem,
  deleteMessage,
  deleteReview,
  deleteTour,
  markMessageRead,
  toggleNewsletterActive,
  updateBlog,
  updateBookingStatus,
  updateCategory,
  updateDestination,
  updateGalleryItem,
  updateReviewStatus,
  updateTour,
  upsertSiteSetting,
} from "@/services/admin/content.service";
import type { ActionResult } from "@/types";

async function adminGuard() {
  return requireAdmin();
}

function revalidateContent(tags: string[]) {
  for (const tag of tags) updateTag(tag);
  revalidatePath("/admin");
}

// Destinations
export async function saveDestination(
  input: unknown,
  id?: string,
): Promise<ActionResult> {
  await adminGuard();
  const parsed = destinationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  try {
    if (id) await updateDestination(id, parsed.data);
    else await createDestination(parsed.data);
    revalidateContent([CACHE_TAGS.destinations]);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to save destination." };
  }
}

export async function removeDestination(id: string): Promise<ActionResult> {
  await adminGuard();
  try {
    await deleteDestination(id);
    revalidateContent([CACHE_TAGS.destinations]);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Cannot delete destination with linked tours." };
  }
}

// Categories
export async function saveCategory(
  input: unknown,
  id?: string,
): Promise<ActionResult> {
  await adminGuard();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  try {
    if (id) await updateCategory(id, parsed.data);
    else await createCategory(parsed.data);
    revalidateContent([CACHE_TAGS.tours]);
    revalidatePath("/admin/categories");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to save category." };
  }
}

export async function removeCategory(id: string): Promise<ActionResult> {
  await adminGuard();
  try {
    await deleteCategory(id);
    revalidateContent([CACHE_TAGS.tours]);
    revalidatePath("/admin/categories");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Cannot delete category with linked tours." };
  }
}

// Tours
export async function saveTour(input: unknown, id?: string): Promise<ActionResult> {
  await adminGuard();
  const parsed = tourSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  try {
    if (id) await updateTour(id, parsed.data);
    else await createTour(parsed.data);
    revalidateContent([CACHE_TAGS.tours]);
    revalidatePath("/admin/tours");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to save tour." };
  }
}

export async function removeTour(id: string): Promise<ActionResult> {
  await adminGuard();
  try {
    await deleteTour(id);
    revalidateContent([CACHE_TAGS.tours]);
    revalidatePath("/admin/tours");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Cannot delete tour with active bookings." };
  }
}

// Bookings
export async function adminUpdateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "completed",
): Promise<ActionResult> {
  await adminGuard();
  const result = await updateBookingStatus(bookingId, status);
  if (!result.success) return { success: false, error: result.error };
  revalidatePath("/admin/bookings");
  revalidatePath("/dashboard/bookings");
  return { success: true, data: undefined };
}

// Reviews
export async function adminUpdateReviewStatus(
  reviewId: string,
  status: "approved" | "rejected",
): Promise<ActionResult> {
  await adminGuard();
  await updateReviewStatus(reviewId, status);
  revalidateContent([CACHE_TAGS.reviews]);
  revalidatePath("/admin/reviews");
  return { success: true, data: undefined };
}

export async function adminRemoveReview(reviewId: string): Promise<ActionResult> {
  await adminGuard();
  await deleteReview(reviewId);
  revalidateContent([CACHE_TAGS.reviews]);
  revalidatePath("/admin/reviews");
  return { success: true, data: undefined };
}

// Blogs
export async function saveBlog(input: unknown, id?: string): Promise<ActionResult> {
  await adminGuard();
  const session = await requireAdmin();
  const parsed = blogSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  try {
    if (id) await updateBlog(id, parsed.data);
    else await createBlog(parsed.data, session.user.id);
    revalidateContent([CACHE_TAGS.blogs]);
    revalidatePath("/admin/blog");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to save blog post." };
  }
}

export async function removeBlog(id: string): Promise<ActionResult> {
  await adminGuard();
  await deleteBlog(id);
  revalidatePath("/admin/blog");
  return { success: true, data: undefined };
}

// Gallery
export async function saveGalleryItem(
  input: unknown,
  id?: string,
): Promise<ActionResult> {
  await adminGuard();
  const parsed = gallerySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  try {
    if (id) await updateGalleryItem(id, parsed.data);
    else await createGalleryItem(parsed.data);
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to save gallery item." };
  }
}

export async function removeGalleryItem(id: string): Promise<ActionResult> {
  await adminGuard();
  await deleteGalleryItem(id);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true, data: undefined };
}

// Messages
export async function adminMarkMessageRead(id: string): Promise<ActionResult> {
  await adminGuard();
  await markMessageRead(id, true);
  revalidatePath("/admin/messages");
  return { success: true, data: undefined };
}

export async function adminRemoveMessage(id: string): Promise<ActionResult> {
  await adminGuard();
  await deleteMessage(id);
  revalidatePath("/admin/messages");
  return { success: true, data: undefined };
}

// Newsletter
export async function adminToggleNewsletter(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  await adminGuard();
  await toggleNewsletterActive(id, active);
  revalidatePath("/admin/newsletter");
  return { success: true, data: undefined };
}

// Settings
export async function saveSiteStats(input: unknown): Promise<ActionResult> {
  await adminGuard();
  const parsed = siteStatsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  await upsertSiteSetting("stats", parsed.data);
  revalidateContent([CACHE_TAGS.settings]);
  revalidatePath("/admin/settings");
  return { success: true, data: undefined };
}

export async function saveSiteContact(input: unknown): Promise<ActionResult> {
  await adminGuard();
  const parsed = siteContactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  await upsertSiteSetting("contact", parsed.data);
  revalidateContent([CACHE_TAGS.settings]);
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  return { success: true, data: undefined };
}
