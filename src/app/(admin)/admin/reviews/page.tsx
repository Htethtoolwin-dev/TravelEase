import type { Metadata } from "next";
import { ReviewsManager } from "@/features/admin/components/reviews-manager";
import { getAllReviewsAdmin } from "@/services/admin/content.service";

export const metadata: Metadata = { title: "Manage Reviews" };

export default async function AdminReviewsPage() {
  const items = await getAllReviewsAdmin();
  return <ReviewsManager items={items} />;
}
