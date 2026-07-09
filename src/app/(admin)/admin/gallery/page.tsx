import type { Metadata } from "next";
import { GalleryManager } from "@/features/admin/components/gallery-manager";
import { getAllGalleryAdmin } from "@/services/admin/content.service";

export const metadata: Metadata = { title: "Manage Gallery" };

export default async function AdminGalleryPage() {
  const items = await getAllGalleryAdmin();
  return <GalleryManager items={items} />;
}
