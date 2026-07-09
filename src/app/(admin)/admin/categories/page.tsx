import type { Metadata } from "next";
import { CategoriesManager } from "@/features/admin/components/categories-manager";
import { getAllCategoriesAdmin } from "@/services/admin/content.service";

export const metadata: Metadata = { title: "Manage Categories" };

export default async function AdminCategoriesPage() {
  const items = await getAllCategoriesAdmin();
  return <CategoriesManager items={items} />;
}
