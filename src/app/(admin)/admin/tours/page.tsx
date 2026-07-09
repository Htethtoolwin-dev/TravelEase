import type { Metadata } from "next";
import { ToursManager } from "@/features/admin/components/tours-manager";
import {
  getAllCategoriesAdmin,
  getAllDestinationsAdmin,
  getAllToursAdmin,
} from "@/services/admin/content.service";

export const metadata: Metadata = { title: "Manage Tours" };

export default async function AdminToursPage() {
  const [items, destinations, categories] = await Promise.all([
    getAllToursAdmin(),
    getAllDestinationsAdmin(),
    getAllCategoriesAdmin(),
  ]);
  return <ToursManager items={items} destinations={destinations} categories={categories} />;
}
