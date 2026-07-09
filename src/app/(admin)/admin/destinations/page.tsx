import type { Metadata } from "next";
import { DestinationsManager } from "@/features/admin/components/destinations-manager";
import { getAllDestinationsAdmin } from "@/services/admin/content.service";

export const metadata: Metadata = { title: "Manage Destinations" };

export default async function AdminDestinationsPage() {
  const items = await getAllDestinationsAdmin();
  return <DestinationsManager items={items} />;
}
