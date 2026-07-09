import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export async function getUserById(userId: string) {
  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return row ?? null;
}
