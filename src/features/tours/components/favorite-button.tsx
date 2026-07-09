"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleFavorite } from "@/actions/favorites.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  tourId,
  initialFavorited,
  className,
}: {
  tourId: string;
  initialFavorited: boolean;
  className?: string;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFavorite(tourId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setFavorited(result.data.favorited);
      toast.success(result.data.favorited ? "Added to favorites" : "Removed from favorites");
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(className)}
      onClick={handleClick}
      disabled={isPending}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          favorited && "fill-red-500 text-red-500",
        )}
      />
    </Button>
  );
}
