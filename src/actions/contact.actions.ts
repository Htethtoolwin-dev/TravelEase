"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { messages, newsletter } from "@/lib/db/schema";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { contactSchema, newsletterSchema } from "@/schemas/auth";
import type { ActionResult } from "@/types";

export async function submitContact(
  input: unknown,
): Promise<ActionResult> {
  const ip = getClientIp(await headers());
  const limited = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limited.success) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await db.insert(messages).values(parsed.data);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to send message. Please try again." };
  }
}

export async function subscribeNewsletter(
  input: unknown,
): Promise<ActionResult> {
  const ip = getClientIp(await headers());
  const limited = rateLimit(`newsletter:${ip}`, { limit: 3, windowMs: 60_000 });
  if (!limited.success) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  try {
    await db
      .insert(newsletter)
      .values({ email: parsed.data.email })
      .onConflictDoNothing();
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to subscribe. Please try again." };
  }
}
