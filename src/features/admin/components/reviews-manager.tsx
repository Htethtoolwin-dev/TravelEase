"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminRemoveReview, adminUpdateReviewStatus } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/format";
import type { reviews, tours, user } from "@/lib/db/schema";

type ReviewRow = {
  review: typeof reviews.$inferSelect;
  tour: typeof tours.$inferSelect;
  customer: typeof user.$inferSelect;
};

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

export function ReviewsManager({ items }: { items: ReviewRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatus(reviewId: string, status: "approved" | "rejected") {
    startTransition(async () => {
      const result = await adminUpdateReviewStatus(reviewId, status);
      if (!result.success) toast.error(result.error);
      else { toast.success(`Review ${status}`); router.refresh(); }
    });
  }

  function handleDelete(reviewId: string) {
    if (!confirm("Delete this review?")) return;
    startTransition(async () => {
      const result = await adminRemoveReview(reviewId);
      if (!result.success) toast.error(result.error);
      else { toast.success("Review deleted"); router.refresh(); }
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reviews" description="Moderate customer reviews" />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Tour</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(({ review, tour, customer }) => (
              <TableRow key={review.id}>
                <TableCell>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-muted-foreground text-xs">{formatDate(review.createdAt)}</p>
                </TableCell>
                <TableCell>{tour.title}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                    ))}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm">{review.comment}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[review.status]} className="capitalize">{review.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {review.status === "pending" ? (
                      <>
                        <Button size="sm" disabled={isPending} onClick={() => handleStatus(review.id, "approved")}>Approve</Button>
                        <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleStatus(review.id, "rejected")}>Reject</Button>
                      </>
                    ) : null}
                    <Button size="icon" variant="ghost" disabled={isPending} onClick={() => handleDelete(review.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
