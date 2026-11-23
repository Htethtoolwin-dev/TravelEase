"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { submitReview } from "@/actions/reviews.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReviewSchema, type CreateReviewInput } from "@/schemas/profile";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  tourId: string;
  tourTitle: string;
}

export function ReviewForm({ tourId, tourTitle }: ReviewFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      tourId,
      rating: 5,
      comment: "",
    },
  });

  const rating = useWatch({ control, name: "rating" });

  async function onSubmit(data: CreateReviewInput) {
    const result = await submitReview(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Review submitted! It will appear after approval.");
    reset({ tourId, rating: 5, comment: "" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border p-4">
      <div>
        <p className="font-medium">{tourTitle}</p>
        <p className="text-muted-foreground text-sm">Share your experience</p>
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setValue("rating", i + 1)}
              className="rounded p-0.5"
            >
              <Star
                className={cn(
                  "size-6",
                  i < rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
        {errors.rating ? (
          <p className="text-destructive text-sm">{errors.rating.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`comment-${tourId}`}>Your Review</Label>
        <Textarea
          id={`comment-${tourId}`}
          rows={4}
          placeholder="Tell others about your experience..."
          {...register("comment")}
        />
        {errors.comment ? (
          <p className="text-destructive text-sm">{errors.comment.message}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
