import type { Metadata } from "next";
import { NewsletterManager } from "@/features/admin/components/newsletter-manager";
import { getAllNewsletterAdmin } from "@/services/admin/content.service";

export const metadata: Metadata = { title: "Newsletter" };

export default async function AdminNewsletterPage() {
  const items = await getAllNewsletterAdmin();
  return <NewsletterManager items={items} />;
}
