import type { Metadata } from "next";
import { MessagesManager } from "@/features/admin/components/messages-manager";
import { getAllMessagesAdmin } from "@/services/admin/content.service";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const items = await getAllMessagesAdmin();
  return <MessagesManager items={items} />;
}
