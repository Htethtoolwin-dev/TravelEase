import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Allow only same-origin relative paths for post-login redirects. */
export function safeCallbackPath(
  url: string | null | undefined,
  fallback: string,
): string {
  if (!url) return fallback;

  let path = url;
  try {
    path = decodeURIComponent(url);
  } catch {
    return fallback;
  }

  if (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("://") &&
    !path.includes("\\")
  ) {
    return path;
  }

  return fallback;
}
