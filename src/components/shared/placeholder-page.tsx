import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";

export function createPlaceholderMetadata(title: string): Metadata {
  return { title };
}

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <PageHero title={title} description={description} />
      <div className="container mx-auto px-4 py-16">
        <div className="bg-muted/30 mx-auto max-w-xl rounded-2xl border p-8 text-center">
          <p className="text-muted-foreground">
            This page will be fully implemented in Phase 2. The foundation and
            routing are ready.
          </p>
        </div>
      </div>
    </>
  );
}
