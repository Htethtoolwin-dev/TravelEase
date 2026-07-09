"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface GalleryItem {
  id: string;
  image: string;
  title: string;
  category: string | null;
}

export function GalleryGrid({
  items,
  categories,
}: {
  items: GalleryItem[];
  categories: string[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const filtered = activeCategory
    ? items.filter((i) => i.category === activeCategory)
    : items;

  return (
    <>
      {categories.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !activeCategory
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightbox(item)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="font-medium text-white">{item.title}</p>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          {lightbox ? (
            <div className="relative">
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-2 right-2 z-10 rounded-full bg-black/50 p-2 text-white"
              >
                <X className="size-5" />
              </button>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                <Image
                  src={lightbox.image}
                  alt={lightbox.title}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="mt-3 text-center text-white">{lightbox.title}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
