import type { Metadata } from "next";

const pages = [
  "tours",
  "destinations",
  "categories",
  "bookings",
  "customers",
  "reviews",
  "blog",
  "gallery",
  "messages",
  "newsletter",
  "analytics",
  "settings",
] as const;

export function createAdminPlaceholder(title: string): Metadata {
  return { title };
}

export function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">
        Full CRUD management for {title.toLowerCase()} will be implemented in Phase 5.
      </p>
    </div>
  );
}

export { pages as adminPages };
