const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): { success: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { success: true };
}

export function getClientIp(headers: Headers): string {
  const vercelIp = headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0]?.trim() ?? "unknown";

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
