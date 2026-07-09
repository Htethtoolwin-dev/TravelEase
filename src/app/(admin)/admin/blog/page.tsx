import type { Metadata } from "next";
import { BlogsManager } from "@/features/admin/components/blogs-manager";
import { getAllBlogsAdmin } from "@/services/admin/content.service";

export const metadata: Metadata = { title: "Manage Blog" };

export default async function AdminBlogPage() {
  const items = await getAllBlogsAdmin();
  return <BlogsManager items={items} />;
}
